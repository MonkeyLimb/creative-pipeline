import "./globals.css";
import { Toaster } from "sonner";

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
        <script dangerouslySetInnerHTML={{ __html: `try{const t=localStorage.getItem('theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme:dark)').matches))document.documentElement.classList.add('dark')}catch{}` }} />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "var(--bg)", color: "var(--text)" }} className="min-h-screen antialiased">
        <div className="fixed inset-0 pointer-events-none" style={{ background: "var(--gradient)" }} />
        <div className="relative">{children}</div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: "var(--bg-raised)", color: "var(--text)", border: "1px solid var(--border)", fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13 },
          }}
        />
      </body>
    </html>
  );
}
