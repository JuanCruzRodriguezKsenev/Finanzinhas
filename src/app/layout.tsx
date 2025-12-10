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
          {/* El Navbar tiene position: fixed, así que no afecta el flujo del div de abajo */}
          <Navbar />

          <div
            style={{
              /* En Desktop: Dejamos margen a la izquierda igual al ancho del sidebar */
              /* En Móvil: La variable --sidebar-width es 0px (definido en globals.css), así que ocupa todo el ancho */
              marginLeft: "var(--sidebar-width)",

              /* Ancho fluido */
              width: "auto",

              /* Mínimo alto de pantalla */
              minHeight: "100vh",

              /* Transición suave al cambiar de tamaño */
              transition: "margin-left 0.3s ease",
            }}
          >
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
