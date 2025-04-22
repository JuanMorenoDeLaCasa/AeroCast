import { NextResponse } from "next/server"
import { fetchHistoricalData } from "@/lib/influxdb"

export async function POST(request: Request) {
  try {
    const { start, end } = await request.json()

    if (!start || !end) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 })
    }

    const data = await fetchHistoricalData(new Date(start), new Date(end))
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in historical-data API route:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch historical data" }, { status: 500 })
  }
}

