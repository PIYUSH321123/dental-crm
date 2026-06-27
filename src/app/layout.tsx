import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";



const inter = Inter({
    subsets: ["latin"],
    variable: "--font-sans",
});

export const metadata: Metadata = {
    title: "Sales Guru",
    description: "Sales Guru Application",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={inter.variable} suppressHydrationWarning>
            <body>
                {children}
            </body>
        </html>
    );
}
