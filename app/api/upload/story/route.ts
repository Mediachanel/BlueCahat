import { requireUser } from "@/lib/auth";
import { saveUpload } from "@/lib/upload";
import { jsonResponse } from "@/lib/utils";

export async function POST(request: Request) {
  await requireUser(request);
  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return jsonResponse({ message: "File wajib diunggah" }, { status: 400 });
  const upload = await saveUpload(file, "stories");
  return jsonResponse({ upload }, { status: 201 });
}
