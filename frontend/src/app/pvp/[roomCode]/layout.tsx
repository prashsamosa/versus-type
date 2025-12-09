import type { Metadata } from "next";

type Props = {
	params: Promise<{ roomCode: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { roomCode } = await params;

	return {
		title: `Room ${roomCode}`,
		description: `Join the typing battle in room ${roomCode}`,
		openGraph: {
			title: `Join Room ${roomCode} | Versus Type`,
			description: `Join the typing battle in room ${roomCode}`,
			type: "website",
		},
	};
}

export default function RoomLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
