"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { UserPlus, Loader2 } from "lucide-react"

interface InviteUserFormProps {
  roomId: string
  roomName: string
  inviterUsername?: string
}

export function InviteUserForm({ roomId, roomName, inviterUsername }: InviteUserFormProps) {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Check if user exists
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("username", username.trim())
        .single()

      if (userError) {
        if (userError.code === "PGRST116") {
          toast({
            title: "User not found",
            description: `Username "${username}" does not exist.`,
            variant: "destructive",
          })
          setIsLoading(false)
          return
        }
        throw userError
      }

      // Check if invitation already exists
      const { data: existingInvite, error: inviteError } = await supabase
        .from("room_invitations")
        .select("id, status")
        .eq("room_id", roomId)
        .eq("invited_username", username.trim())
        .single()

      if (!inviteError && existingInvite) {
        toast({
          title: "Invitation already exists",
          description: `${username} has already been invited to this room (status: ${existingInvite.status}).`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Create invitation
      const { error } = await supabase.from("room_invitations").insert([
        {
          room_id: roomId,
          invited_username: username.trim(),
          invited_by: inviterUsername || null,
          status: "pending",
        },
      ])

      if (error) {
        throw error
      }

      toast({
        title: "Invitation sent",
        description: `${username} has been invited to join "${roomName}".`,
      })

      // Clear form
      setUsername("")
    } catch (error) {
      console.error("Error inviting user:", error)
      toast({
        title: "Error",
        description: "Failed to send invitation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="username">Invite User by Username</Label>
        <div className="flex gap-2">
          <Input
            id="username"
            placeholder="Enter username to invite"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isLoading}
            required
          />
          <Button type="submit" disabled={isLoading} className="shrink-0">
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
            {isLoading ? "Inviting..." : "Invite"}
          </Button>
        </div>
      </div>
    </form>
  )
}
