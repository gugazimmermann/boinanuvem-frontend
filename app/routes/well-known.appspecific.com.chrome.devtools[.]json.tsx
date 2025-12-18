export function loader() {
  // Chrome DevTools probes this path in some environments.
  // Returning 204 avoids noisy "No route matches URL" errors in dev.
  return new Response(null, {
    status: 204,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
