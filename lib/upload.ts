import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export type UploadFolder = "avatars" | "messages" | "stories";

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

function uploadPublicPath() {
  const publicPath = process.env.UPLOAD_PUBLIC_PATH ?? "/uploads";
  return `/${publicPath.replace(/^\/+|\/+$/g, "")}`;
}

export function uploadRootDir() {
  const uploadRoot = process.env.UPLOAD_DIR ?? "public/uploads";
  return path.isAbsolute(uploadRoot) ? uploadRoot : path.join(process.cwd(), uploadRoot);
}

export function resolveUploadFilePath(parts: string[]) {
  const root = path.resolve(uploadRootDir());
  const resolved = path.resolve(root, ...parts);
  const relative = path.relative(root, resolved);

  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Response(JSON.stringify({ message: "Path upload tidak valid" }), { status: 400 });
  }

  const folder = parts[0];
  if (!folder || !["avatars", "messages", "stories"].includes(folder)) {
    throw new Response(JSON.stringify({ message: "Folder upload tidak valid" }), { status: 400 });
  }

  return resolved;
}

export async function saveUpload(file: File, folder: UploadFolder) {
  if (!allowedMime.has(file.type)) {
    throw new Response(JSON.stringify({ message: "Tipe file tidak diizinkan" }), { status: 400 });
  }

  if (folder === "avatars" && !file.type.startsWith("image/")) {
    throw new Response(JSON.stringify({ message: "Foto profil harus berupa gambar" }), { status: 400 });
  }

  if (file.size > maxUploadBytes()) {
    throw new Response(JSON.stringify({ message: "Ukuran file terlalu besar" }), { status: 400 });
  }

  const targetDir = path.join(uploadRootDir(), folder);
  await mkdir(targetDir, { recursive: true });

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").toLowerCase();
  const fileName = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const filePath = path.join(targetDir, fileName);
  const bytes = await file.arrayBuffer();
  await writeFile(filePath, Buffer.from(bytes));

  return {
    fileName: safeName,
    fileUrl: `${uploadPublicPath()}/${folder}/${fileName}`,
    fileType: folder,
    fileSize: file.size,
    mimeType: file.type
  };
}
