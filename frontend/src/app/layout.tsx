import type { Metadata } from "next";
import { Roboto, Roboto_Mono } from "next/font/google";
import "./globals.css";

const roboto = Roboto({
	variable: "--font-roboto",
	subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
	variable: "--font-roboto-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Versus Type",
	description: "Race your typing skills against others in real-time",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<title>Versus Type</title>
			</head>
			<body className={`${roboto.variable} ${robotoMono.variable} antialiased`}>
				{children}
			</body>
		</html>
	);
}
