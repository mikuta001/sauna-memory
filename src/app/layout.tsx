import type { Metadata } from "next";
import "./globals.css";
import NavigationBar from "./components/NavigationBar";

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
      <body className="pb-14 md:pb-0 md:pl-56">
        {children}
        <NavigationBar />
      </body>
    </html>
  );
}
