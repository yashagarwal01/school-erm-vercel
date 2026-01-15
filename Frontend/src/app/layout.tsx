import AuthGuard from "./AuthGuard";
import "./globals.css";
import { Toaster } from "sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-background">
        <AuthGuard>{children}</AuthGuard>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
