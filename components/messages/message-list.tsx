"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageReactions } from "@/components/reactions/message-reactions"
import { MessageReplies } from "@/components/replies/message-replies"
import { MessageSquare, User, Clock } from "lucide-react"

interface Message {
  id: string
  content: string
  sender_username: string | null
  created_at: string
}

interface MessageListProps {
  recipientId: string
}

export function MessageList({ recipientId }: MessageListProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMessages() {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("recipient_id", recipientId)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setMessages(data || [])
      } catch (error) {
        console.error("Error fetching messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Set up real-time subscription
    const channel = supabase
      .channel("messages-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${recipientId}`,
        },
        (payload) => {
          setMessages((prev) => [payload.new as Message, ...prev])
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [recipientId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden animate-pulse">
            <CardContent className="p-0">
              <div className="p-6">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </CardContent>
            <CardFooter className="border-t bg-muted/50 px-6 py-3">
              <div className="flex justify-between w-full">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-24" />
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (messages.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">No messages yet. Be the first to send a message!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <Card
          key={message.id}
          className="overflow-hidden border shadow-sm card-hover animate-slide-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <CardContent className="p-6">
            {/* Message Content */}
            <p className="whitespace-pre-wrap mb-3">{message.content}</p>

            {/* Reactions */}
            <MessageReactions messageId={message.id} messageType="profile" />

            {/* Replies */}
            <MessageReplies messageId={message.id} messageType="profile" />
          </CardContent>

          <CardFooter className="border-t bg-muted/30 px-6 py-3 flex justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {message.sender_username ? message.sender_username : "Anonymous"}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDate(message.created_at)}
            </span>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
