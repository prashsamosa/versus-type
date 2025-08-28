import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.json).*)",
	],
};

const SESSION_COOKIE_NAME = "better-auth.session_token";

export default async function middleware(req: NextRequest) {
	// IMP: This only checks the cookie, not the session validity.
	// TODO: Handle loop for corrupt cookie: / (invalid session) -> /sign-in (cookie present) -> / (invalid session) -> ...

	console.log(`Middleware triggered for ${req.method} ${req.nextUrl.pathname}`);

	const { pathname } = req.nextUrl;

	const sessionCookie = (await cookies()).get(SESSION_COOKIE_NAME);
	const isAuthenticated = !!sessionCookie;

	const publicPaths = ["/sign-in", "/sign-up", "/forgot-password"];
	const authPaths = ["/dashboard", "/profile", "/settings"];

	// send already authenticated users to the home page (for public paths)
	if (isAuthenticated && publicPaths.includes(pathname)) {
		console.log(
			`Authenticated user accessing public path ${pathname}. Redirecting to /.`,
		);
		return NextResponse.redirect(new URL("/", req.nextUrl));
	}

	// send non-authenticated user to /sign-in for protected routes
	if (!isAuthenticated && authPaths.includes(pathname)) {
		console.log(
			`Unauthenticated user accessing protected path ${pathname}. Redirecting to /sign-in.`,
		);
		return NextResponse.redirect(new URL("/sign-in", req.url));
	}

	return NextResponse.next();
}
