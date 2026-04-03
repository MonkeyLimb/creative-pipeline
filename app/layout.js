import "./globals.css";

export const metadata = {
  title: "Dreambound Creative Pipeline",
  description: "AI-powered content briefs and compliant ad copy for education marketing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            const t = localStorage.getItem('theme');
            if (t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
              document.documentElement.classList.add('dark');
            }
          } catch {}
        `}} />
      </head>
      <body
        className="min-h-screen antialiased transition-colors duration-300"
        style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "var(--bg)", color: "var(--text)" }}
      >
        <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient-bg)" }} />
        <div className="relative">{children}</div>
      </body>
    </html>
  );
}
