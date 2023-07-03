import Navigation from "@/components/ui/navigation";

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
	return (
		<main className={`${inter.className} h-screen`}>
			<SessionProvider session={session}>
				<Navigation />
				<Component {...pageProps} />
			</SessionProvider>
		</main>
	);
}
