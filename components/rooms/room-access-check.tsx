"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Lock, Loader2 } from "lucide-react"

interface RoomAccessCheckProps {
  roomId: string
  roomName: string
  onAccessGranted: () => void
}

export function RoomAccessCheck({ roomId, roomName, onAccessGranted }: RoomAccessCheckProps) {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const checkAccess = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Please enter your username",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Check if user has an approved invitation
      const { data, error } = await supabase
        .from("room_invitations")
        .select("*")
        .eq("room_id", roomId)
        .eq("invited_username", username.trim())
        .eq("status", "approved")
        .single()

      if (error) {
        toast({
          title: "Access Denied",
          description: `You don't have access to this room. Please request an invitation.`,
          variant: "destructive",
        })
        return
      }

      if (data) {
        // Store the username in session storage for this room
        sessionStorage.setItem(`room_access_${roomId}`, username.trim())
        onAccessGranted()

        toast({
          title: "Access Granted",
          description: `Welcome to ${roomName}!`,
        })
      }
    } catch (error) {
      console.error("Error checking access:", error)
      toast({
        title: "Error",
        description: "An error occurred while checking access. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <Lock className="h-12 w-12 mx-auto text-primary mb-4" />
          <h2 className="text-2xl font-bold mb-2">Private Room</h2>
          <p className="text-muted-foreground">This is a private room. Please enter your username to verify access.</p>
        </div>

        <form onSubmit={checkAccess} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="access-username">Your Username</Label>
            <Input
              id="access-username"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Lock className="h-4 w-4 mr-2" />}
            {isLoading ? "Checking..." : "Check Access"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
