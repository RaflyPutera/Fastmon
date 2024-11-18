import { Toaster } from "@/components/ui/toaster"

interface RootLayoutProps {
    children: React.ReactNode;
  }
  
  export default function RootLayout({ children }: RootLayoutProps) {
    return (
      <html lang="en">
        <head />
        <body>
          <main>{children}</main>
          <Toaster />
        </body>
      </html>
    );
  }