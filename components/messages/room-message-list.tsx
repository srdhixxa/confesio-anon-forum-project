"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface RoomMessage {
  id: string
  content: string
  sender_username: string | null
  created_at: string
}

interface RoomMessageListProps {
  roomId: string
}

export function RoomMessageList({ roomId }: RoomMessageListProps) {
  const [messages, setMessages] = useState<RoomMessage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchMessages() {
      try {
        const { data, error } = await supabase
          .from("room_messages")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setMessages(data || [])
      } catch (error) {
        console.error("Error fetching room messages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMessages()

    // Set up real-time subscription
    const channel = supabase
      .channel("room-messages-changes")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "room_messages",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [payload.new as RoomMessage, ...prev])
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [roomId])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
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
        <p className="text-muted-foreground">No messages in this room yet. Be the first to send a message!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <Card key={message.id} className="overflow-hidden">
          <CardContent className="p-6">
            <p className="whitespace-pre-wrap">{message.content}</p>
          </CardContent>
          <CardFooter className="border-t bg-muted/50 px-6 py-3 flex justify-between text-sm text-muted-foreground">
            <span>{message.sender_username ? `From: ${message.sender_username}` : "Anonymous"}</span>
            <span>{formatDate(message.created_at)}</span>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
