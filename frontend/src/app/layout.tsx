import "./globals.css";

export const metadata = {
  title: "Dating App",
  description: "Find your perfect match",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
