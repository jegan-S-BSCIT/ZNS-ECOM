// The Supabase client is ~55kB gzipped and nothing on the storefront needs it
// until the app actually talks to the backend, so it is fetched on first use
// rather than on first paint. The promise is memoised, so every later caller
// gets the same client.
let clientPromise;

export function getSupabase() {
  clientPromise ??= import('@supabase/supabase-js').then(({ createClient }) =>
    createClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
    )
  );
  return clientPromise;
}
