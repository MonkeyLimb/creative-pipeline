import "./globals.css";

export const metadata = {
  title: "Dreambound Creative Pipeline",
  description: "AI-powered content briefs and compliant ad copy for education marketing",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-[#08090e] text-gray-100 min-h-screen antialiased" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(249,115,22,0.04)_0%,_transparent_50%)] pointer-events-none" />
        <div className="relative">
          {children}
        </div>
      </body>
    </html>
  );
}
