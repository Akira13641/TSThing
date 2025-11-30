import React from 'react';
import type { Metadata } from 'next';

/**
 * Root layout component
 * Provides the HTML structure for the game application
 */
export const metadata: Metadata = {
  title: 'Aetherial Vanguard',
  description: 'A retro 16-bit turn-based JRPG',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            background: #000;
            overflow: hidden;
            font-family: monospace;
          }
          
          canvas, img, .sprite {
            image-rendering: pixelated;
            image-rendering: crisp-edges;
          }
        `}</style>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}