import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sauna Memory",
  description: "Sauna Memory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={"h-full antialiased"}>
      <body>{children}</body>
    </html>
  );
}
