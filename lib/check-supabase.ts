"use client"

import { useEffect, useState } from "react"
import { supabase } from "./supabase"

export function useSupabaseStatus() {
  const [isConfigured, setIsConfigured] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Use the singleton instance
    const checkSupabase = async () => {
      try {
        // Try a simple query to check if Supabase is working
        const { error } = await supabase.from("users").select("id").limit(1)

        if (error && (error.message.includes("not found") || error.message.includes("configuration"))) {
          setIsConfigured(false)
        } else {
          setIsConfigured(true)
        }
      } catch (err) {
        console.error("Error checking Supabase:", err)
        setIsConfigured(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkSupabase()
  }, [])

  return { isConfigured, isLoading }
}
