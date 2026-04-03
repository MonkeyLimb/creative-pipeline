import "./globals.css";

export const metadata = {
  title: "Dreambound Creative Pipeline",
  description: "Internal tool for generating compliant ad copy and committing designs to Canva",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
