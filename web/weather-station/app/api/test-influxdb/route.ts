import { NextResponse } from "next/server"
import { writeTestData } from "@/lib/influxdb"

// This endpoint is for testing the InfluxDB connection
export async function POST(request: Request) {
  try {
    const { temperature, humidity } = await request.json()

    if (typeof temperature !== "number" || typeof humidity !== "number") {
      return NextResponse.json({ error: "Temperature and humidity must be numbers" }, { status: 400 })
    }

    const result = await writeTestData(temperature, humidity)

    return NextResponse.json({ success: result })
  } catch (error) {
    console.error("Error in test-influxdb endpoint:", error)
    return NextResponse.json({ error: error.message || "Failed to write test data to InfluxDB" }, { status: 500 })
  }
}

