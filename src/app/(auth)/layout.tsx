import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "ログイン | Sauna Memory",
  description: "Sauna Memory",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="bg-[var(--white)] text-[var(--black)]">{children}</body>
    </html>
  );
}
