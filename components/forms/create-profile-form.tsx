"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { User, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CreateProfileForm() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [usernameError, setUsernameError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      setUsernameError("Username cannot be empty")
      return
    }

    setIsLoading(true)
    setUsernameError(null)

    try {
      // Check if username already exists
      const { data: existingUser, error: checkError } = await supabase
        .from("users")
        .select("id")
        .eq("username", username)
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        throw checkError
      }

      if (existingUser) {
        setUsernameError("This username is already taken. Please choose another one.")
        setIsLoading(false)
        return
      }

      // Create new user
      const { data, error } = await supabase.from("users").insert([{ username }]).select().single()

      if (error) {
        throw error
      }

      toast({
        title: "Profile created",
        description: `Welcome, ${username}!`,
      })

      // Redirect to profile page
      router.push(`/profile/${username}`)
    } catch (error) {
      console.error("Error creating profile:", error)
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          Username
        </Label>
        <Input
          id="username"
          placeholder="Enter a username"
          value={username}
          onChange={(e) => {
            setUsername(e.target.value)
            setUsernameError(null)
          }}
          disabled={isLoading}
          required
          className={`transition-all focus:ring-primary ${usernameError ? "border-red-500" : ""}`}
        />
        {usernameError && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{usernameError}</AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground">
          This is the only information we'll store. No email or password required.
        </p>
      </div>
      <Button type="submit" className="w-full group" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <User className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
        )}
        {isLoading ? "Creating..." : "Create Profile"}
      </Button>
    </form>
  )
}
