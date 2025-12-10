import { Analytics } from "@vercel/analytics/next";
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

const siteUrl = "https://versustype.sahaj.dev";
const description = "Race your typing skills against others in real-time";
const title = "Versus Type";

export const metadata: Metadata = {
	title: {
		default: title,
		template: "%s | Versus Type",
	},
	description,
	keywords: [
		"typing game",
		"typing race",
		"typing test",
		"multiplayer typing",
		"competitive typing",
		"wpm test",
		"typing speed",
	],
	authors: [{ name: "Sahaj Bhatt" }],
	creator: "Versus Type",
	metadataBase: new URL(siteUrl),
	icons: {
		icon: "/iconOpaque.svg",
	},
	openGraph: {
		type: "website",
		locale: "en_US",
		url: siteUrl,
		siteName: "Versus Type",
		title,
		description,
	},
	twitter: {
		card: "summary_large_image",
		title,
		description,
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-video-preview": -1,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body className={`${roboto.variable} ${robotoMono.variable} antialiased`}>
				{children}
				<Analytics />
			</body>
		</html>
	);
}
