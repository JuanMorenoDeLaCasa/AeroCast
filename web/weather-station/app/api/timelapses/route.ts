import fs from "fs"
import path from "path"

export async function GET() {
  const folderPath = path.join(process.cwd(), "storage", "timelapses")
  const files = fs.readdirSync(folderPath).filter(f => f.endsWith(".mp4"))

  const timelapses = files.map(f => ({
    filename: f,
    date: f.replace(".mp4", ""),
    url: `/api/timelapse/${f}`,
    thumbnail: `/api/thumbnail/${f.replace(".mp4", ".jpg")}`,
  }))

  return new Response(JSON.stringify({ timelapses }), {
    headers: { "Content-Type": "application/json" },
  })
}
