import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AI Megatron | Núcleo de Comando Dourado',
  description: 'Interface holográfica HUD âmbar para interação cognitiva de alto nível com a AI Megatron.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&family=Source+Code+Pro:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-[#050402] text-[#FFBF00]">
        {children}
      </body>
    </html>
  );
}