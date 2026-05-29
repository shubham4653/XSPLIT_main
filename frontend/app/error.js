"use client";

export default function ErrorBoundary({ error, reset }) {
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', background: 'white', color: 'black', minHeight: '100vh' }}>
      <h2>Something went wrong (Error Boundary)</h2>
      <pre style={{ color: 'red', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {error.message}
      </pre>
      <pre style={{ color: 'gray', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
        {error.stack}
      </pre>
      <button onClick={() => reset()} style={{ padding: '10px', marginTop: '10px' }}>Try again</button>
    </div>
  );
}
