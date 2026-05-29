"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html>
      <body>
        <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
          <h2>Something went wrong (Global Error)</h2>
          <pre style={{ color: 'red', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {error.message}
          </pre>
          <pre style={{ color: 'gray', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
            {error.stack}
          </pre>
          <button onClick={() => reset()} style={{ padding: '10px', marginTop: '10px' }}>Try again</button>
        </div>
      </body>
    </html>
  );
}
