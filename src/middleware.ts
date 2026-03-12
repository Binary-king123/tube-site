import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
    if (!req.nextUrl.pathname.startsWith("/dashboard")) {
        return NextResponse.next();
    }

    const authCookie = req.cookies.get("admin_session")?.value;

    if (authCookie === "authenticated") {
        return NextResponse.next();
    }

    // Redirect to custom login page if no valid cookie is found
    return NextResponse.redirect(new URL("/login", req.url));
}

export const config = {
    matcher: ["/dashboard/:path*"]
};
