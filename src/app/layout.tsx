import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react"
import "./globals.css";
import Tutorial from "@/components/Tutorial";

export const metadata = {
  verification: {
    google: 'lvLILYWSuJBjSZnVYxQEOiHmpQliH2GBhV9svlnHc_8'
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider afterSignOutUrl="/">
      <html lang="en">
        <body>
          {children}
          <Tutorial />
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}
