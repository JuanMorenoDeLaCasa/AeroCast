import { NextResponse } from "next/server"
import { fetchCurrentData } from "@/lib/influxdb"

export async function GET() {
  try {
    const data = await fetchCurrentData()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in current-data API route:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch current data" }, { status: 500 })
  }
}

