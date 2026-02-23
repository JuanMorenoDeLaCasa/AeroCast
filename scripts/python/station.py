pc@raspberrypi:~/proyecto $ cat station.py
#!/usr/bin/env python3
"""
Lee DHT22, SHT35, la temperatura de la CPU y el MPPT Victron (VE.Direct),
captura una foto con libcamera-still y envía todos los datos y la imagen
a InfluxDB 2.x y al servidor Next.js.
Pensado para ejecutarse desde *cron* (una sola iteración).
"""

import os
import sys
import socket
import subprocess
import serial
import time
from datetime import datetime, timezone
from pathlib import Path
from PIL import Image

import board
import busio
import Adafruit_DHT
import adafruit_sht31d

from influxdb_client import InfluxDBClient, Point, WritePrecision
from influxdb_client.client.write_api import SYNCHRONOUS


# ─── CONFIGURACIÓN ─────────────────────────────────────────────────────────────
DHT_PIN_BCM = 4
DHT_SENSOR  = Adafruit_DHT.DHT22
i2c = busio.I2C(board.SCL, board.SDA)
sht = adafruit_sht31d.SHT31D(i2c)

# VE.Direct USB (puerto persistente)
VE_DIRECT_PORT = "/dev/serial/by-id/usb-VictronEnergy_BV_VE_Direct_cable_VEA431YE-if00-port0"
VE_BAUDRATE = 19200

# Modem SIM7600G-H AT port (puerto persistente)
MODEM_PORT = "/dev/serial/by-id/usb-SimTech__Incorporated_SimTech__Incorporated_0123456789ABCDEF-if02-port0"
MODEM_BAUDRATE = 115200

# InfluxDB
INFLUX_URL    = "http://server:8086"
INFLUX_TOKEN  = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
INFLUX_ORG    = "AeroCast"
INFLUX_BUCKET = "Sensores"

# Servidor Next.js
SERVIDOR_USUARIO = "juanmoreno"
SERVIDOR_IP = "server"
SERVIDOR_RUTA = "/home/juanmoreno/weather-station/storage/"
# ───────────────────────────────────────────────────────────────────────────────


def reboot_system():
    """Reinicia la Raspberry Pi."""
    print("🔄 REINICIANDO SISTEMA por fallo de conexión...", file=sys.stderr)
    subprocess.run(["sudo", "reboot"], check=False)
    sys.exit(1)


def check_internet_connection(retries=3):
    """Verifica conectividad a internet haciendo ping."""
    hosts = ["8.8.8.8", "1.1.1.1", "server"]

    for attempt in range(retries):
        for host in hosts:
            try:
                result = subprocess.run(
                    ["ping", "-c", "1", "-W", "3", host],
                    stdout=subprocess.DEVNULL,
                    stderr=subprocess.DEVNULL,
                    timeout=5
                )
                if result.returncode == 0:
                    print(f"✅ Conexión OK (ping a {host})")
                    return True
            except Exception:
                continue

        if attempt < retries - 1:
            print(f"⚠️ Intento {attempt + 1}/{retries} falló, reintentando...")
            time.sleep(5)

    return False


def send_photo_to_nextjs(photo_path: str):
    """Envía la foto (JPG y WebP) al servidor Next.js vía SCP."""
    try:
        destino_live = f"{SERVIDOR_USUARIO}@{SERVIDOR_IP}:{SERVIDOR_RUTA}foto.jpg"
        timestamp = datetime.now().strftime("%Y-%m-%d-%H-%M")
        destino_hist = f"{SERVIDOR_USUARIO}@{SERVIDOR_IP}:{SERVIDOR_RUTA}fotos/{timestamp}.jpg"

        photo_webp_path = str(Path(photo_path).with_suffix(".webp"))
        destino_live_webp = f"{SERVIDOR_USUARIO}@{SERVIDOR_IP}:{SERVIDOR_RUTA}foto.webp"
        destino_hist_webp = f"{SERVIDOR_USUARIO}@{SERVIDOR_IP}:{SERVIDOR_RUTA}fotos/webp/{timestamp}.webp"

        subprocess.run(["scp", photo_path, destino_live], check=True)
        subprocess.run(["scp", photo_path, destino_hist], check=True)

        with Image.open(photo_path) as img:
            w_percent = 800 / img.width
            h_size = int(img.height * w_percent)
            img_resized = img.resize((800, h_size), Image.LANCZOS)
            img_resized.save(photo_webp_path, "WEBP", quality=80, method=6)

        subprocess.run(["scp", photo_webp_path, destino_live_webp], check=True)
        subprocess.run(["scp", photo_webp_path, destino_hist_webp], check=True)

        print("✅ Fotos enviadas correctamente.")
    except Exception as e:
        print(f"⚠️ Error enviando fotos: {e}", file=sys.stderr)


def capture_photo(photo_path: str = "fto.jpg"):
    """Captura una imagen con libcamera-still."""
    cmd = [
        "libcamera-still",
        "--autofocus-mode", "manual",
        "--lens-position", "3.2",
        "-q", "90",
        "--awb", "auto",
        "--denoise", "cdn_fast",
        "--width", "4656",
        "--height", "3496",
        "--sharpness", "1",
        "--gain", "0.0",
        "-n",
        "-o", photo_path,
    ]
    try:
        subprocess.run(cmd, check=True)
        print(f"✅ Foto capturada: {photo_path}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"⛔ Error capturando foto: {e}", file=sys.stderr)
        return False


def read_dht22(max_retries: int = 15):
    """Devuelve (humedad %, temperatura °C) o (None, None)."""
    for _ in range(max_retries):
        h, t = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN_BCM)
        if h is not None and t is not None:
            return h, t
    return None, None


def read_sht35():
    """Devuelve (humedad %, temperatura °C) o (None, None)."""
    try:
        return sht.relative_humidity, sht.temperature
    except Exception as e:
        print(f"⚠️ Error SHT35: {e}", file=sys.stderr)
        return None, None


def read_cpu_temp():
    """Devuelve la temperatura de la CPU en °C o None si falla."""
    try:
        out = subprocess.check_output(["vcgencmd", "measure_temp"], encoding="utf-8")
        return float(out.strip().split("=")[1].split("'")[0])
    except Exception as e:
        print(f"⚠️ Error CPU temp: {e}", file=sys.stderr)
        return None


def read_vedirect():
    """Lee una línea de datos VE.Direct y devuelve un diccionario."""
    data = {}
    try:
        with serial.Serial(VE_DIRECT_PORT, VE_BAUDRATE, timeout=2) as ser:
            for _ in range(40):  # leer hasta 40 líneas buscando un bloque completo
                line = ser.readline().decode(errors="ignore").strip()
                if not line:
                    continue
                if "\t" in line:
                    key, val = line.split("\t", 1)
                    data[key] = val
                elif line.startswith("Checksum"):
                    break
    except Exception as e:
        print(f"⚠️ Error leyendo VE.Direct: {e}", file=sys.stderr)
    return data


def build_point(host, ts_ns, temp_dht, hum_dht, temp_sht, hum_sht, cpu_temp, ve_data):
    """Crea un Point con todos los campos leídos, usando nombres descriptivos."""
    pt = (
        Point("sensors")
        .tag("host", host)
        .time(ts_ns, WritePrecision.NS)
    )

    # DHT22
    if temp_dht is not None: pt.field("temperatura_interior_C", round(temp_dht, 2))
    if hum_dht is not None:  pt.field("humedad_interior_pct", round(hum_dht, 2))

    # SHT35
    if temp_sht is not None: pt.field("temperatura_exterior_C", round(temp_sht, 2))
    if hum_sht is not None:  pt.field("humedad_exterior_pct", round(hum_sht, 2))

    # CPU
    if cpu_temp is not None: pt.field("temperatura_cpu_C", round(cpu_temp, 2))

    # VE.Direct (en unidades reales)
    try:
        if "V" in ve_data:    pt.field("bateria_V", int(ve_data["V"]) / 1000)
        if "I" in ve_data:    pt.field("corriente_A", int(ve_data["I"]) / 1000)
        if "VPV" in ve_data:  pt.field("panel_V", int(ve_data["VPV"]) / 1000)
        if "PPV" in ve_data:  pt.field("potencia_W", int(ve_data["PPV"]))
        if "CS" in ve_data:   pt.field("estado_carga", int(ve_data["CS"]))
    except Exception as e:
        print(f"⚠️ Error procesando VE.Direct: {e}", file=sys.stderr)

    return pt


def main():
    host = socket.gethostname()
    ts_ns = int(datetime.now(timezone.utc).timestamp() * 1e9)

    hum_dht, temp_dht = read_dht22()
    hum_sht, temp_sht = read_sht35()
    cpu_temp = read_cpu_temp()
    ve_data = read_vedirect()

    photo_path = "fto.jpg"
    if capture_photo(photo_path):
        send_photo_to_nextjs(photo_path)

    print(f"temperatura_interior : {temp_dht:.2f}" if temp_dht else "temperatura_interior : —")
    print(f"humedad_interior     : {hum_dht:.2f}" if hum_dht else "humedad_interior     : —")
    print(f"temperatura_exterior : {temp_sht:.2f}" if temp_sht else "temperatura_exterior : —")
    print(f"humedad_exterior     : {hum_sht:.2f}" if hum_sht else "humedad_exterior     : —")
    print(f"temperatura_cpu      : {cpu_temp:.2f}" if cpu_temp else "temperatura_cpu      : —")

    if ve_data:
        print(f"voltaje_bateria      : {int(ve_data.get('V',0))/1000:.2f} V")
        print(f"corriente            : {int(ve_data.get('I',0))/1000:.3f} A")
        print(f"voltaje_panel        : {int(ve_data.get('VPV',0))/1000:.2f} V")
        print(f"potencia_panel       : {int(ve_data.get('PPV',0))} W")

    point = build_point(host, ts_ns, temp_dht, hum_dht, temp_sht, hum_sht, cpu_temp, ve_data)

    try:
        with InfluxDBClient(url=INFLUX_URL, token=INFLUX_TOKEN, org=INFLUX_ORG, timeout=10_000) as client:
            with client.write_api(write_options=SYNCHRONOUS) as wapi:
                wapi.write(bucket=INFLUX_BUCKET, record=point)
        print("✅ Datos enviados a InfluxDB")
    except Exception as e:
        print(f"⛔ Error escribiendo en InfluxDB: {e}", file=sys.stderr)
        sys.exit(2)


if __name__ == "__main__":
    # ─── Inicialización modem SIM7600G-H ──────────────────────────────────────
    try:
        ser = serial.Serial(MODEM_PORT, MODEM_BAUDRATE, timeout=1)
    except serial.SerialException as e:
        print(f"Error abriendo {MODEM_PORT}: {e}", file=sys.stderr)
        sys.exit(1)

    # Esperar inicialización del modem
    time.sleep(2)

    # Comprobar comunicación
    ser.write(b"AT\r")
    time.sleep(0.5)
    print("✅ Respuesta AT:", ser.read_all().decode(errors='ignore').strip())

    # Encender radio
    ser.write(b"AT+CFUN=1\r")
    time.sleep(2)
    print("✅ Radio encendida:", ser.read_all().decode(errors='ignore').strip())

    # ─── Verificar conectividad CON LA RADIO ENCENDIDA ────────────────────────
    print("🔍 Verificando conexión a internet...")
    if not check_internet_connection():
        print("❌ Sin conexión a internet detectada", file=sys.stderr)
        # Apagar radio antes de reiniciar
        try:
            ser.write(b"AT+CFUN=0\r")
            time.sleep(1)
        except:
            pass
        ser.close()
        reboot_system()

    # ─── Ejecutar script principal ─────────────────────────────────────────
    try:
        main()
    finally:
        # Apagar radio
        try:
            ser.write(b"AT+CFUN=0\r")
            time.sleep(2)
            print("✅ Radio apagada:", ser.read_all().decode(errors='ignore').strip())
        except Exception as e:
            print(f"⚠️ Error apagando radio: {e}", file=sys.stderr)
        ser.close()