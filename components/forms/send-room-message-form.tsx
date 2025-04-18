"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"

interface SendRoomMessageFormProps {
  roomId: string
}

export function SendRoomMessageForm({ roomId }: SendRoomMessageFormProps) {
  const [content, setContent] = useState("")
  const [senderUsername, setSenderUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: "Error",
        description: "Message cannot be empty",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase.from("room_messages").insert([
        {
          room_id: roomId,
          content,
          sender_username: senderUsername.trim() || null,
        },
      ])

      if (error) {
        throw error
      }

      toast({
        title: "Message sent",
        description: "Your message has been sent to the room.",
      })

      // Clear form instead of reloading
      setContent("")
      setSenderUsername("")
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Write a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
          required
          className="min-h-[100px] resize-none focus:ring-primary"
        />
      </div>
      <div className="space-y-2">
        <Textarea
          placeholder="Your username (optional, leave blank to stay completely anonymous)"
          value={senderUsername}
          onChange={(e) => setSenderUsername(e.target.value)}
          disabled={isLoading}
          className="min-h-[60px] resize-none focus:ring-primary"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
