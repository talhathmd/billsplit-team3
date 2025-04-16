import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

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
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
