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
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("next", pathname);
        return NextResponse.redirect(loginUrl);
    }

    if (isAuthPath && isAuthenticated) {
        const nextPath = request.nextUrl.searchParams.get("next");
        const target =
            nextPath && nextPath.startsWith("/")
                ? nextPath
                : "/dashboard";
        return NextResponse.redirect(new URL(target, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login"],
};
