// /app/api/fotos/route.ts
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const webpDir = path.join(process.cwd(), "storage/fotos/webp");
    const jpgDir = path.join(process.cwd(), "storage/fotos");

    const webpFiles = fs
      .readdirSync(webpDir)
      .filter((f) => f.endsWith(".webp"))
      .sort();
    const jpgFiles = fs
      .readdirSync(jpgDir)
      .filter((f) => f.endsWith(".jpg"))
      .sort();

    // Crear foto.webp "en vivo" con la última foto webp
    if (webpFiles.length > 0) {
      const latestWebp = webpFiles[webpFiles.length - 1];
      const sourcePath = path.join(webpDir, latestWebp);
      const destPath = path.join(process.cwd(), "storage/foto.webp");

      fs.copyFileSync(sourcePath, destPath);
      console.log(`foto.webp actualizada: ${latestWebp}`);
    }

    const photos = webpFiles.map((file) => ({
      webp: `/api/fotos/${file}`, // servido desde la API
      jpg: `/api/fotos/${file.replace(".webp", ".jpg")}`,
    }));

    return NextResponse.json({ photos });
  } catch (error) {
    console.error("Error leyendo carpeta fotos:", error);
    return NextResponse.json({ photos: [] });
  }
}
