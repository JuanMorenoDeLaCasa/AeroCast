import { InfluxDB, Point } from "@influxdata/influxdb-client"

// InfluxDB connection configuration using environment variables
const url = process.env.INFLUXDB_URL
const token = process.env.INFLUXDB_TOKEN
const org = process.env.INFLUXDB_ORG
const bucket = process.env.INFLUXDB_BUCKET

// Create InfluxDB client
let influxDB = null

// Initialize the InfluxDB client only if all required environment variables are present
if (url && token) {
  influxDB = new InfluxDB({ url, token })
}

/**
 * Fetch current temperature and humidity data
 * @returns {Promise<{temperature: number, humidity: number}>}
 */
export async function fetchCurrentData() {
  if (!influxDB) {
    throw new Error("InfluxDB client not initialized. Check environment variables.")
  }

  try {
    const queryApi = influxDB.getQueryApi(org)

    // Flux query to get the most recent temperature and humidity readings
    // Adapted to match the provided query structure
    const query = `
      from(bucket: "${bucket}")
        |> range(start: -5m)
        |> filter(fn: (r) => r._measurement == "sht35_data")
        |> filter(fn: (r) => r._field == "temperature" or r._field == "humidity")
        |> filter(fn: (r) => r.sensor == "SHT35")
        |> last()
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `

    const result = await queryApi.collectRows(query)

    if (result.length === 0) {
      console.warn("No current data found in InfluxDB")
      return { temperature: 0, humidity: 0 }
    }

    // Extract temperature and humidity from the result
    const latestData = result[0]
    return {
      temperature: Number.parseFloat(latestData.temperature || 0),
      humidity: Number.parseFloat(latestData.humidity || 0),
    }
  } catch (error) {
    console.error("Error fetching current data from InfluxDB:", error)
    throw new Error(`Failed to fetch current weather data: ${error.message}`)
  }
}

/**
 * Fetch historical temperature and humidity data for a given time range
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {Promise<Array<{time: string, temperature: number, humidity: number}>>}
 */
export async function fetchHistoricalData(start, end) {
  if (!influxDB) {
    throw new Error("InfluxDB client not initialized. Check environment variables.")
  }

  try {
    const queryApi = influxDB.getQueryApi(org)

    // Convert dates to RFC3339 format for InfluxDB
    const startRfc = start.toISOString()
    const endRfc = end.toISOString()

    // Calculate appropriate aggregation window based on time range
    const rangeDuration = end.getTime() - start.getTime()
    let aggregationWindow = "1m" // Default to 1 minute

    if (rangeDuration > 7 * 24 * 60 * 60 * 1000) {
      aggregationWindow = "1h" // 1 hour for ranges > 7 days
    } else if (rangeDuration > 24 * 60 * 60 * 1000) {
      aggregationWindow = "15m" // 15 minutes for ranges > 1 day
    } else if (rangeDuration > 6 * 60 * 60 * 1000) {
      aggregationWindow = "5m" // 5 minutes for ranges > 6 hours
    }

    // Flux query to get historical temperature and humidity data, ensuring gaps are filled with null
    const query = `
      from(bucket: "${bucket}")
        |> range(start: ${startRfc}, stop: ${endRfc})
        |> filter(fn: (r) => r._measurement == "sht35_data")
        |> filter(fn: (r) => r._field == "temperature" or r._field == "humidity")
        |> filter(fn: (r) => r.sensor == "SHT35")
        |> aggregateWindow(every: ${aggregationWindow}, fn: mean, createEmpty: false)  // Ensure empty windows are kept
        |> pivot(rowKey:["_time"], columnKey: ["_field"], valueColumn: "_value")
    `

    const result = await queryApi.collectRows(query)

    if (result.length === 0) {
      console.warn("No historical data found in InfluxDB for the specified range")
      return []
    }

    // Format the data for the charts, filling null values
    return result.map((row) => ({
      time: row._time,
      temperature: row.temperature !== undefined ? Number.parseFloat(row.temperature || 0).toFixed(1) : null,
      humidity: row.humidity !== undefined ? Number.parseFloat(row.humidity || 0).toFixed(1) : null,
    }))
  } catch (error) {
    console.error("Error fetching historical data from InfluxDB:", error)
    throw new Error(`Failed to fetch historical weather data: ${error.message}`)
  }
}


/**
 * Helper function to write data to InfluxDB (for testing purposes)
 * @param {number} temperature
 * @param {number} humidity
 */
export async function writeTestData(temperature, humidity) {
  if (!influxDB) {
    throw new Error("InfluxDB client not initialized. Check environment variables.")
  }

  try {
    const writeApi = influxDB.getWriteApi(org, bucket, "ns")

    // Create a point with the correct measurement and tag
    const point = new Point("sht35_data")
      .tag("sensor", "SHT35")
      .floatField("temperature", temperature)
      .floatField("humidity", humidity)

    writeApi.writePoint(point)
    await writeApi.close()

    console.log("Test data written to InfluxDB")
    return true
  } catch (error) {
    console.error("Error writing test data to InfluxDB:", error)
    throw error
  }
}

/**
 * Check if InfluxDB is properly configured
 * @returns {boolean}
 */
export function isInfluxDBConfigured() {
  return Boolean(url && token && org && influxDB)
}

