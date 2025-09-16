import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "EventHub - Platform Manajemen Event Terpercaya",
  description: "Platform event management terlengkap untuk organizer dan peserta. Temukan event menarik, beli tiket, dan kelola event dengan mudah.",
  keywords: "event, tiket, workshop, seminar, konferensi, jakarta, indonesia",
  authors: [{ name: "EventHub Team" }],
  openGraph: {
    title: "EventHub - Platform Manajemen Event Terpercaya",
    description: "Platform event management terlengkap untuk organizer dan peserta",
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className="font-sans antialiased bg-gray-50 min-h-screen flex flex-col">
        <Providers>
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
