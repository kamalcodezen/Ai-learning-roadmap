import { Poppins } from 'next/font/google';
import '../../public/font/css/clash-display.css';
import './globals.css';
import Navbar from '../components/layout/navbar/Navbar';

const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata = { title: 'App' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
