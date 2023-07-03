import Navigation from "@/components/ui/navigation";
import Head from "next/head";

import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";
import { SessionProvider } from "next-auth/react";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
	return (
		<>
			<Head>
				<meta name="application-name" content="Anime Analytics" />
				<meta
					name="description"
					content="Discover, collaborate, and analyze your favorite animes with our all-in-one application. Browse an extensive collection, track your progress, share recommendations, and gain valuable analytics insights. Elevate your anime experience like never before. Try it now!"
				/>
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta
					name="keywords"
					content="anime, browse anime, track anime, share anime, anime analytics, anime app, anime recommendations, anime tracking, anime community, anime statistics, anime insights"
				/>
				<meta property="og:image" content="https://anime-analytics.vercel.app/aa-og-card.png" />
				<meta name="twitter:image" content="https://anime-analytics.vercel.app/aa-twitter-card.png" />
				<meta name="twitter:card" content="summary_large_image" />
				<link rel="icon" href="/logo.png" />
			</Head>
			<main className={`${inter.className} h-screen`}>
				<SessionProvider session={session}>
					<Navigation />
					<Component {...pageProps} />
				</SessionProvider>
			</main>
		</>
	);
}
