export default function Home() {
  return (
    <main
      style={{
        maxWidth: 720,
        margin: "0 auto",
        padding: "80px 24px",
      }}
    >
      <p
        style={{
          textTransform: "uppercase",
          letterSpacing: 2,
          fontSize: 12,
          color: "#75c9f1",
          margin: 0,
        }}
      >
        Space Engineers
      </p>
      <h1 style={{ fontSize: 40, lineHeight: 1.1, margin: "8px 0 16px" }}>
        Ore &amp; POI Registry
      </h1>
      <p style={{ fontSize: 18, color: "#9fb0c3", margin: "0 0 32px" }}>
        A community registry of ore deposits and points of interest, searchable
        by in-game GPS coordinates. Submit a location, find what others have
        charted, and rate the best spots.
      </p>
      <div
        style={{
          display: "inline-block",
          padding: "10px 16px",
          borderRadius: 8,
          border: "1px solid #1e2a3d",
          background: "#111a2b",
          color: "#9fb0c3",
          fontSize: 14,
        }}
      >
        🚧 Under construction — deployment pipeline is live.
      </div>
    </main>
  );
}
