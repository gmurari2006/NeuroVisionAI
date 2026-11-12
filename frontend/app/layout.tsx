import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../components/ThemeProvider";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";

export const metadata: Metadata = {
  title: "NeuroVisionAI | Professional Medical Research Workstation",
  description:
    "AI-powered brain MRI tumor classification and Grad-CAM explainability platform benchmarking ResNet-50 and VGG-16.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Anti-flash inline theme initializer - Defaults to Light theme for first-time visitors */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('neurovision_theme');
                  if (t === 'dark') {
                    document.documentElement.classList.add('dark');
                  } else if (t === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="antialiased selection:bg-[#0D9488]/20 selection:text-[#0D9488] dark:selection:bg-[#2DD4BF]/20 dark:selection:text-[#2DD4BF] min-h-screen flex flex-col bg-[#F4F7FB] dark:bg-[#0F172A] text-[#172B4D] dark:text-[#F1F5F9] transition-colors">
        <ThemeProvider>
          <Header />
          <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 py-5 sm:py-6">
            {children}
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
