import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Frutería La Puerta - Mazatlán",
    description: "Frutas y verduras frescas directo a tu mesa. Pedidos por WhatsApp.",
    themeColor: "#10b981",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="es">
            <body className="antialiased bg-gradient-to-br from-green-50 via-white to-orange-50">
                {children}
            </body>
        </html>
    );
}