import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ReactQueryProvider from "@/providers/queryProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Will it Taco? ✨🔮🌮",
  description:
    "Just about anything can be a taco, right? Let's put that theory to the test.",
  metadataBase:
    process.env.NODE_ENV === "production"
      ? new URL("https://willittaco.lol")
      : new URL("http://localhost:3000"),
  other: {
    "google-adsense-account": "ca-pub-1549417323917600",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ReactQueryProvider>
          <div className="h-full flex flex-col">{children}</div>
        </ReactQueryProvider>
        {process.env.NODE_ENV === "production" && (
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1549417323917600"
            crossOrigin="anonymous"
          />
        )}
      </body>
    </html>
  );
}
