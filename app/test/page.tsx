import { InfluxDBTest } from "@/components/influxdb-test"

export default function TestPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-md">
        <h1 className="mb-8 text-3xl font-bold text-slate-800">Prueba de InfluxDB</h1>
        <InfluxDBTest />
      </div>
    </main>
  )
}

