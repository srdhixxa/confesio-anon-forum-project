"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CreateRoomForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [rules, setRules] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [creatorUsername, setCreatorUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [nameError, setNameError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) {
      setNameError("Room name cannot be empty")
      return
    }

    setIsLoading(true)
    setNameError(null)

    try {
      let userId = null

      // If username is provided, get the user ID
      if (creatorUsername.trim()) {
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("username", creatorUsername.trim())
          .single()

        if (userError) {
          if (userError.code === "PGRST116") {
            toast({
              title: "User not found",
              description: `Username "${creatorUsername}" does not exist. Create a profile first.`,
              variant: "destructive",
            })
            setIsLoading(false)
            return
          }
          throw userError
        }

        userId = userData.id
      }

      // Create room
      const { data, error } = await supabase
        .from("rooms")
        .insert([
          {
            name,
            description: description.trim() || null,
            is_private: isPrivate,
            created_by: userId,
          },
        ])
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Room created",
        description: `Your room "${name}" has been created.`,
      })

      // Redirect to room page
      router.push(`/room/${data.id}`)
    } catch (error) {
      console.error("Error creating room:", error)
      toast({
        title: "Error",
        description: "Failed to create room. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Room Name</Label>
        <Input
          id="name"
          placeholder="Enter a room name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            setNameError(null)
          }}
          disabled={isLoading}
          required
          className={nameError ? "border-red-500" : ""}
        />
        {nameError && (
          <Alert variant="destructive" className="py-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{nameError}</AlertDescription>
          </Alert>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Textarea
          id="description"
          placeholder="Describe what this room is about"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {isPrivate && (
        <div className="space-y-2">
          <Label htmlFor="rules">Room Rules (Optional)</Label>
          <Textarea
            id="rules"
            placeholder="Set rules for your private room"
            value={rules}
            onChange={(e) => setRules(e.target.value)}
            disabled={isLoading}
          />
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="creator">Your Username (Optional)</Label>
        <Input
          id="creator"
          placeholder="Enter your username if you have one"
          value={creatorUsername}
          onChange={(e) => setCreatorUsername(e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="private" checked={isPrivate} onCheckedChange={setIsPrivate} disabled={isLoading} />
        <Label htmlFor="private">Make this room private</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Creating..." : "Create Room"}
      </Button>
    </form>
  )
}
