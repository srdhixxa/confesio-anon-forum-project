"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, MessageSquare, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function CreateRoomForm() {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
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

      // Create room (always public now)
      const { data, error } = await supabase
        .from("rooms")
        .insert([
          {
            name,
            description: description.trim() || null,
            is_private: false, // Always public
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
        description: `Your public room "${name}" has been created.`,
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
          className="min-h-[100px]"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="creator">Your Username (Optional)</Label>
        <Input
          id="creator"
          placeholder="Enter your username if you have one"
          value={creatorUsername}
          onChange={(e) => setCreatorUsername(e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">If you provide a username, you'll be shown as the room creator</p>
      </div>

      <div className="bg-accent/50 p-4 rounded-lg">
        <h3 className="font-medium mb-2 flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Public Room Features
        </h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
          <li>Anyone can join and participate</li>
          <li>Messages support text and images</li>
          <li>Real-time reactions with emoticons</li>
          <li>Easy sharing with friends</li>
        </ul>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <MessageSquare className="h-4 w-4 mr-2" />}
        {isLoading ? "Creating..." : "Create Public Room"}
      </Button>
    </form>
  )
}
