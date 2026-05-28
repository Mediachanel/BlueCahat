import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const allowedMime = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "video/mp4",
  "video/webm",
  "audio/mpeg",
  "audio/webm",
  "application/pdf",
  "text/plain",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
]);

export function maxUploadBytes() {
  const mb = Number(process.env.MAX_UPLOAD_SIZE_MB ?? "10");
  return mb * 1024 * 1024;
}

export async function saveUpload(file: File, folder: "avatars" | "messages" | "stories") {
  if (!allowedMime.has(file.type)) {
    throw new Response(JSON.stringify({ message: "Tipe file tidak diizinkan" }), { status: 400 });
  }

  if (file.size > maxUploadBytes()) {
    throw new Response(JSON.stringify({ message: "Ukuran file terlalu besar" }), { status: 400 });
  }

  const uploadRoot = process.env.UPLOAD_DIR ?? "public/uploads";
  const targetDir = path.join(process.cwd(), uploadRoot, folder);
  await mkdir(targetDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const filePath = path.join(targetDir, fileName);
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  const publicBase = uploadRoot.replace(/^public[\\/]/, "").replace(/\\/g, "/");
  return {
    fileName: safeName,
    fileUrl: `/${publicBase}/${folder}/${fileName}`,
    fileType: folder,
    fileSize: file.size,
    mimeType: file.type
  };
}
