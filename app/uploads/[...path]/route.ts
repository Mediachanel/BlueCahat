import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { resolveUploadFilePath } from "@/lib/upload";

const mimeTypes: Record<string, string> = {
  ".gif": "image/gif",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".mp3": "audio/mpeg",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".txt": "text/plain; charset=utf-8",
  ".webm": "video/webm",
  ".webp": "image/webp",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: uploadPath } = await params;
    const filePath = resolveUploadFilePath(uploadPath);
    const fileStat = await stat(filePath);

    if (!fileStat.isFile()) {
      return Response.json({ message: "File tidak ditemukan" }, { status: 404 });
    }

    const file = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();

    return new Response(file, {
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Length": String(fileStat.size),
        "Content-Type": mimeTypes[ext] ?? "application/octet-stream"
      }
    });
  } catch (error) {
    if (error instanceof Response) return error;
    return Response.json({ message: "File tidak ditemukan" }, { status: 404 });
  }
}
