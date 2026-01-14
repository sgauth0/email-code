import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Draggable Terminal",
  description: "A draggable xterm.js terminal with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
