import React from 'react';
import localFont from 'next/font/local';

const googleSans = localFont({
  src: '../../../public/Google_Sans/GoogleSans-VariableFont_GRAD,opsz,wght.ttf',
  variable: '--font-google-sans',
  display: 'swap',
});

export default function AdminLandingPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${googleSans.variable}`} style={{ fontFamily: 'var(--font-google-sans), sans-serif' }}>
      {children}
    </div>
  );
}
