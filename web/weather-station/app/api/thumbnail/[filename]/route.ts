import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(
  req: Request,
  context: { params: any }
) {
  const { filename } = await Promise.resolve(context.params)

  const filePath = path.join(
    process.cwd(),
    "storage",
    "timelapses",
    "thumbnails",
    filename
  )

  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Miniatura no encontrada" }, { status: 404 })
  }

  const file = fs.readFileSync(filePath)
  return new Response(file, {
    headers: {
      "Content-Type": "image/jpeg",
    },
  })
}
