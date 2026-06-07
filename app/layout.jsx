import "./globals.css";
import Nav from "../components/Nav";

export const metadata = {
  title: "Space Engineers Ore & POI Registry",
  description:
    "Community registry of ore deposits and points of interest in Space Engineers, searchable by in-game GPS coordinates.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <Nav />
        {children}
      </body>
    </html>
  );
}
