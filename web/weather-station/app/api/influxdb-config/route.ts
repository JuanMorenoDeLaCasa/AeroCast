import { NextResponse } from "next/server"
import { isInfluxDBConfigured } from "@/lib/influxdb"

export async function GET() {
  // Return the InfluxDB configuration status for client-side use
  return NextResponse.json({
    isConfigured: isInfluxDBConfigured(),
    // Include partial configuration info for debugging
    // Don't include the token for security reasons
    config: {
      url: process.env.INFLUXDB_URL ? "Configurado" : "No configurado",
      org: process.env.INFLUXDB_ORG ? "Configurado" : "No configurado",
      bucket: process.env.INFLUXDB_BUCKET ? "Configurado" : "No configurado",
      token: process.env.INFLUXDB_TOKEN ? "Configurado" : "No configurado",
    },
  })
}

