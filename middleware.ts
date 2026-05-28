import { NextRequest, NextResponse } from "next/server";

const protectedPages = ["/chat", "/contacts", "/groups", "/stories", "/profile", "/admin"];
const authPages = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const token = request.cookies.get("bluechat_token")?.value;
  const pathname = request.nextUrl.pathname;

  if (protectedPages.some((path) => pathname.startsWith(path)) && !token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (authPages.some((path) => pathname.startsWith(path)) && token) {
    return NextResponse.redirect(new URL("/chat", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/chat/:path*", "/contacts/:path*", "/groups/:path*", "/stories/:path*", "/profile/:path*", "/admin/:path*", "/login", "/register"]
};
