import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const protectedPaths = ["/dashboard"];
const authPaths = ["/login"];

function getJwtSecretKey() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET is not defined in environment variables.");
    }
    return new TextEncoder().encode(secret);
}

export async function middleware(request: NextRequest) {
    // console.log(`[Middleware] Executing for path: ${request.nextUrl.pathname}`);

    const token = request.cookies.get("auth_token")?.value;
    const pathname = request.nextUrl.pathname;

    let isAuthenticated = false;

    if (token) {
        try {
            await jwtVerify(token, getJwtSecretKey());
            isAuthenticated = true;
        } catch (error) {
            console.log("[Middleware] JWT Verification Failed :", (error as Error).message);
            isAuthenticated = false;
        }
    }

    const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
    const isAuthPath = authPaths.includes(pathname);

    if (isProtectedPath && !isAuthenticated) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAuthPath && isAuthenticated) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};