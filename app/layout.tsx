import type { Metadata } from 'next';
import './globals.css';
import './rules.css';
import './lore.css';
import './enhancements.css';
import './school.css';
export const metadata: Metadata = {
  title: 'Elderwood · Grimoire privé',
  description:
    'Carnet local de personnages, lieux, connaissances et projets RP.',
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700&family=Cormorant+Garamond:ital,wght@0,500;0,600;1,500&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('elderwood-house-theme');if(!['aerwyn','brumval','falcon','venatrix'].includes(t))t='falcon';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='falcon'}setTimeout(function(){document.documentElement.classList.add('grimoire-ready')},1800)})();`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
