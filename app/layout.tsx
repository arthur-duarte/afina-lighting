import type { Metadata } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Afina v2.0 — Lighting Plot Designer',
  description:
    'Software profissional para criação de Mapas de Luz 2D, Tabela de Patch DMX e Dimensionamento Elétrico para iluminação cênico-teatral.',
  keywords: ['lighting design', 'iluminação cênica', 'mapa de luz', 'patch DMX', 'lighting plot'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="dark">
      <body
        className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-editor-bg text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
