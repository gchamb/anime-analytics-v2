import "@/app/styles/globals.css";
import Navigation from "../components/ui/navigation";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import type { Metadata } from "next";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Anime Analytics",
  description:
    "Discover, collaborate, and analyze your favorite animes with our all-in-one application. Browse an extensive collection, track your progress, share recommendations, and gain valuable analytics insights. Elevate your anime experience like never before. Try it now!",
  applicationName: "Anime Analytics",
  keywords:
    "anime, browse anime, track anime, share anime, anime analytics, anime app, anime recommendations, anime tracking, anime community, anime statistics, anime insights",
  openGraph: {
    type: "website",
    title: "Anime Analytics",
    description:
      "Discover, collaborate, and analyze your favorite animes with our all-in-one application. Browse an extensive collection, track your progress, share recommendations, and gain valuable analytics insights. Elevate your anime experience like never before. Try it now!",
    images: "https://anime-analytics.vercel.app/aa-og-card.png",
  },
  twitter: {
    title: "Anime Analytics",
    description:
      "Discover, collaborate, and analyze your favorite animes with our all-in-one application. Browse an extensive collection, track your progress, share recommendations, and gain valuable analytics insights. Elevate your anime experience like never before. Try it now!",
    images: "https://anime-analytics.vercel.app/aa-twitter-card.png",
    card: "summary_large_image",
  },
  icons: "/logo.png",
};

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          disableTransitionOnChange
        >
          <main className="h-screen">
            <Navigation />
            {children}
          </main>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
