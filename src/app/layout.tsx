import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar/Navbar";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Finansinho",
  description: "Tu control de gastos personal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ThemeProvider>
          <div style={{ display: "flex" }}>
            <Navbar />

            {/* 👇 CONTENEDOR FLUIDO BASADO EN VARIABLES */}
            <div
              style={{
                flexGrow: 1,

                /* Magia CSS: Lee la variable global */
                marginLeft: "var(--sidebar-width)",

                /* Calcula el ancho restante dinámicamente */
                width: "calc(100% - var(--sidebar-width))",

                minHeight: "100vh",
              }}
              className="content-wrapper"
            >
              {children}
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
