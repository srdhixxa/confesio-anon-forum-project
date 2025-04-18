import { createClient } from "@supabase/supabase-js"

type SupabaseClient = ReturnType<typeof createClient>

const globalForSupabase = globalThis as {
  supabase?: SupabaseClient
}

export const supabase = (() => {
  if (globalForSupabase.supabase) {
    return globalForSupabase.supabase
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window === "undefined") {
      console.warn("Supabase URL or Anon Key is missing during SSR")
      return createMockClient()
    }

    console.warn("Using fallback Supabase configuration. Please check your environment variables.")
    const fallbackUrl = "https://your-project-id.supabase.co"
    const fallbackKey = "your-anon-key"
    globalForSupabase.supabase = createClient(fallbackUrl, fallbackKey)
    return globalForSupabase.supabase
  }

  globalForSupabase.supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      storageKey: "anonymous-forum-storage-key", // penting agar beda project tidak bentrok
    },
  })

  return globalForSupabase.supabase
})()

function createMockClient() {
  return {
    from: () => ({
      select: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
      eq: () => ({ data: null, error: null }),
      single: () => ({ data: null, error: null }),
      order: () => ({ data: null, error: null }),
    }),
    auth: {
      getUser: async () => ({ data: { user: null }, error: null }),
      signInWithOtp: async () => ({ data: null, error: null }),
      signOut: async () => ({ error: null }),
    },
    channel: () => ({
      on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
    }),
  } as any
}
