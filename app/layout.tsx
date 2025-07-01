import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '@/context/user-context';
import { PerformanceMonitor } from '@/components/performance-monitor';
import Script from 'next/script';

const inter = Inter({ subsets: ['latin'] });
const GA_ID = process.env.NEXT_PUBLIC_GA_ID!;


export const metadata: Metadata = {
  title: 'MyMasterpiece | Find Your Next Favorite Movie',
  description: 'Discover personalized movie recommendations based on your streaming services and preferences',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics */}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_ID}');
              `}
            </Script>
          </>
        )}
        {/* other head */}
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false}
          disableTransitionOnChange
        >
          <UserProvider>
            <div className="relative min-h-screen bg-background">
              <Header />
              <main className="pt-16">
                {children}
              </main>
              <Toaster />
              <PerformanceMonitor />
            </div>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}