import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import Header from '@/components/header';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '@/context/user-context';
import { PerformanceMonitor } from '@/components/performance-monitor';

const inter = Inter({ subsets: ['latin'] });

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
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider 
          attribute="class" 
          defaultTheme="dark" 
          enableSystem={false}
          disableTransitionOnChange
        >
          <UserProvider>
            <div className="relative min-h-screen bg-background">
              {/* Only show header if not on landing page */}
              {typeof window !== 'undefined' && !window.location.pathname.includes('/landing') && <Header />}
              <main className={typeof window !== 'undefined' && !window.location.pathname.includes('/landing') ? "pt-16" : ""}>
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