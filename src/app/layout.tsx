"use client";
import "@/app/styles/globals.css";
import Navigation from "../components/ui/navigation";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`bg-aa-0 dark:bg-aa-dark-0 ${inter.className} h-screen`}>
        {/* <SessionProvider session={session}> */}
        {/* <Navigation /> */}
        {children}
        {/* </SessionProvider> */}
      </body>
    </html>
  );
}
