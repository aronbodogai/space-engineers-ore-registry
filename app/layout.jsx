export const metadata = {
  title: "Space Engineers Ore & POI Registry",
  description:
    "Community registry of ore deposits and points of interest in Space Engineers, searchable by in-game GPS coordinates.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily:
            "system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif",
          background: "#0b1220",
          color: "#e6edf6",
        }}
      >
        {children}
      </body>
    </html>
  );
}
