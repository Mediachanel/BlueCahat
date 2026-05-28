import { getCurrentUser } from "@/lib/auth";
import { jsonResponse } from "@/lib/utils";

export async function GET(request: Request) {
  const user = await getCurrentUser(request);
  return jsonResponse({ user });
}
