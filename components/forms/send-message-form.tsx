"use client"

import type React from "react"

import { useState } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Send, Loader2, User } from "lucide-react"

interface SendMessageFormProps {
  recipientId: string
  recipientUsername: string
}

export function SendMessageForm({ recipientId, recipientUsername }: SendMessageFormProps) {
  const [content, setContent] = useState("")
  const [senderUsername, setSenderUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)

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
      const { error } = await supabase.from("messages").insert([
        {
          recipient_id: recipientId,
          content,
          sender_username: senderUsername.trim() || null,
        },
      ])

      if (error) {
        throw error
      }

      toast({
        title: "Message sent",
        description: `Your message to ${recipientUsername} has been sent.`,
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
          placeholder={`Write a message to ${recipientUsername}...`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
          required
          className="min-h-[100px] resize-none focus:ring-primary transition-all border-muted"
        />
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <Textarea
            placeholder="Your username (optional, leave blank to stay completely anonymous)"
            value={senderUsername}
            onChange={(e) => setSenderUsername(e.target.value)}
            disabled={isLoading}
            className="min-h-[60px] resize-none focus:ring-primary transition-all border-muted"
          />
        </div>
      </div>
      <Button type="submit" className="w-full group" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
        )}
        {isLoading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
