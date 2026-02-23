import fs from "fs"
import path from "path"

export async function GET(req: Request, context: { params: any }) {
  const { filename } = await Promise.resolve(context.params)
  const filePath = path.join(process.cwd(), "storage", "timelapses", filename)

  if (!fs.existsSync(filePath)) {
    return new Response(JSON.stringify({ error: "Archivo no encontrado" }), { status: 404 })
  }

  const stat = fs.statSync(filePath)
  const total = stat.size
  const rangeHeader = req.headers.get("range")

  if (rangeHeader) {
    const bytesPrefix = "bytes="
    const range = rangeHeader.startsWith(bytesPrefix)
      ? rangeHeader.substring(bytesPrefix.length)
      : ""
    const [startStr, endStr] = range.split("-")
    const start = parseInt(startStr, 10)
    const end = endStr ? parseInt(endStr, 10) : total - 1

    if (start >= total || end >= total) {
      return new Response(null, { status: 416 }) // Requested range not satisfiable
    }

    const chunkSize = end - start + 1
    const file = fs.createReadStream(filePath, { start, end })

    return new Response(file, {
      status: 206,
      headers: {
        "Content-Range": `bytes ${start}-${end}/${total}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunkSize.toString(),
        "Content-Type": "video/mp4",
      },
    })
  } else {
    const file = fs.readFileSync(filePath)
    return new Response(file, {
      headers: { "Content-Type": "video/mp4", "Content-Length": total.toString() },
    })
  }
}
