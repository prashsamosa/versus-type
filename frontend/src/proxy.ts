import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const config = {
	matcher: [
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg|.*\\.json).*)",
	],
};

const SESSION_COOKIE_NAME = "better-auth.session_token";

export default async function proxy(req: NextRequest) {
	const { pathname } = req.nextUrl;

	const sessionCookie = req.cookies.get(SESSION_COOKIE_NAME);
	const isAuthenticated = !!sessionCookie;

	const guestOnlyPaths = ["/sign-in", "/sign-up"];
	const protectedPaths = ["/dashboard", "/profile", "/settings"];

	// send already authenticated users to the home page (for guest-only paths)
	if (isAuthenticated && guestOnlyPaths.includes(pathname)) {
		console.log(
			`Authenticated user accessing public path ${pathname}. Redirecting to /.`,
		);
		return NextResponse.redirect(new URL("/", req.nextUrl));
	}

	// send non-authenticated user to /sign-in for protected routes
	if (!isAuthenticated && protectedPaths.includes(pathname)) {
		console.log(
			`Unauthenticated user accessing protected path ${pathname}. Redirecting to /sign-in.`,
		);
		return NextResponse.redirect(new URL("/sign-in", req.url));
	}

	return NextResponse.next();
}
