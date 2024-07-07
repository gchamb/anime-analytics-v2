import "@/app/styles/globals.css";
import Navigation from "../components/ui/navigation";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";

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
      <body className={`dark bg-aa-dark-0 ${inter.className}`}>
        <main className="h-screen">
          <Navigation />
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
