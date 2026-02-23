// /app/api/fotos/[filename]/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: Request) {
  // Obtener filename desde la URL
  const url = new URL(req.url);
  const filename = url.pathname.split("/").pop(); // extrae [filename]

  if (!filename) {
    return NextResponse.json({ error: "No se proporcionó filename" }, { status: 400 });
  }

  // Validar extensión permitida
  if (!filename.endsWith(".jpg") && !filename.endsWith(".webp")) {
    return NextResponse.json(
      { error: "Formato no permitido" },
      { status: 400 }
    );
  }

  // Carpeta según la extensión
  const folder = filename.endsWith(".webp")
    ? path.join(process.cwd(), "storage/fotos/webp")
    : path.join(process.cwd(), "storage/fotos");

  const filePath = path.join(folder, filename);

  // Verificar si existe
  if (!fs.existsSync(filePath)) {
    // Caso especial: foto.webp "en vivo"
    if (filename === "foto.webp") {
      const livePath = path.join(process.cwd(), "storage/foto.webp");
      if (fs.existsSync(livePath)) {
        const liveBuffer = fs.readFileSync(livePath);
        return new NextResponse(liveBuffer, {
          headers: { "Content-Type": "image/webp" },
        });
      }
    }

    return NextResponse.json({ error: "Foto no encontrada" }, { status: 404 });
  }

  // Leer archivo
  const fileBuffer = fs.readFileSync(filePath);

  // Determinar Content-Type
  const contentType = filename.endsWith(".webp") ? "image/webp" : "image/jpeg";

  return new NextResponse(fileBuffer, {
    headers: { "Content-Type": contentType },
  });
}
