import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUpload } from "@/lib/upload";
import { jsonResponse } from "@/lib/utils";

export async function PATCH(request: Request) {
  const user = await requireUser(request);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonResponse({ message: "File wajib diunggah" }, { status: 400 });
  try {
    const uploaded = await saveUpload(file, "avatars");
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { avatar: uploaded.fileUrl },
      select: { id: true, avatar: true }
    });
    return jsonResponse({ user: updated, upload: uploaded });
  } catch (error) {
    if (error instanceof Response) return error;
    return jsonResponse({ message: "Upload avatar gagal. Coba unggah gambar lain." }, { status: 500 });
  }
}
