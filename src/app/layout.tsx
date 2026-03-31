import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Smart OCR Scanner — Extract Text from Images with AI",
  description:
    "Smart OCR Scanner helps you digitize content from medical bills, ID cards, handwritten notes, and more. Extract clean text from images with speed and accuracy.",
  keywords: [
    "OCR",
    "text extraction",
    "document scanner",
    "image to text",
    "handwriting recognition",
    "AI scanner",
  ],
  authors: [{ name: "Smart OCR Scanner" }],
  icons: {
    icon: "/logo.png",
  },
  openGraph: {
    title: "Smart OCR Scanner",
    description:
      "Extract text from images and documents with speed and accuracy. Digitize content, search documents, and boost productivity.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
