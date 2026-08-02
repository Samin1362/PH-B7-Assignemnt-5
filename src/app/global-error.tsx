"use client";

/**
 * Replaces the root layout when it is the thing that crashed, so it cannot
 * rely on any provider, font variable or global stylesheet being in place.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "1rem",
          padding: "2rem",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          background: "#ffffff",
          color: "#0f172a",
        }}
      >
        <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>
          GearUp could not start
        </h1>
        <p style={{ maxWidth: "28rem", color: "#475569" }}>
          Something failed before the app finished loading. Reloading the page
          usually clears it.
        </p>
        {error.digest ? (
          <p style={{ fontSize: "0.75rem", color: "#64748b" }}>
            Reference: {error.digest}
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          style={{
            borderRadius: "0.625rem",
            background: "#c2410c",
            color: "#ffffff",
            padding: "0.5rem 1rem",
            fontWeight: 500,
            border: "none",
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
