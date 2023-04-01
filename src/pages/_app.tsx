import Navigation from "@/components/ui/navigation";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <main className={`${inter.className} h-screen`}>
      <Navigation />
      <Component {...pageProps} />
    </main>
  );
}
