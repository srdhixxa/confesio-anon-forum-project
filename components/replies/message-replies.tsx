"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { MessageCircle, Send, User, Clock } from "lucide-react"

interface Reply {
  id: string
  content: string
  sender_nickname: string | null
  created_at: string
}

interface MessageRepliesProps {
  messageId: string
  messageType: "profile" | "room"
}

export function MessageReplies({ messageId, messageType }: MessageRepliesProps) {
  const [replies, setReplies] = useState<Reply[]>([])
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState("")
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const tableName = messageType === "profile" ? "message_replies" : "room_message_replies"
  const foreignKey = messageType === "profile" ? "message_id" : "room_message_id"

  useEffect(() => {
    fetchReplies()

    // Set up real-time subscription
    const channel = supabase
      .channel(`${tableName}-changes-${messageId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: tableName,
          filter: `${foreignKey}=eq.${messageId}`,
        },
        (payload) => {
          setReplies((prev) => [...prev, payload.new as Reply])
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [messageId, tableName, foreignKey])

  const fetchReplies = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq(foreignKey, messageId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setReplies(data || [])
    } catch (error) {
      console.error("Error fetching replies:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!replyContent.trim()) {
      toast({
        title: "Error",
        description: "Reply cannot be empty",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.from(tableName).insert([
        {
          [foreignKey]: messageId,
          content: replyContent.trim(),
          sender_nickname: nickname.trim() || null,
        },
      ])

      if (error) throw error

      toast({
        title: "Reply sent",
        description: "Your reply has been posted",
      })

      // Clear form
      setReplyContent("")
      setNickname("")
      setShowReplyForm(false)
    } catch (error) {
      console.error("Error submitting reply:", error)
      toast({
        title: "Error",
        description: "Failed to post reply",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-3 space-y-3">
      {/* Reply Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setShowReplyForm(!showReplyForm)}
        className="h-7 px-2 text-xs hover:bg-muted/50"
      >
        <MessageCircle className="h-3 w-3 mr-1" />
        Reply {replies.length > 0 && `(${replies.length})`}
      </Button>

      {/* Reply Form */}
      {showReplyForm && (
        <form onSubmit={handleSubmitReply} className="space-y-2 bg-muted/30 p-3 rounded-lg">
          <div className="space-y-2">
            <Input
              placeholder="Your nickname (optional)"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              disabled={submitting}
              className="h-8 text-sm"
            />
            <Textarea
              placeholder="Write a reply..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              disabled={submitting}
              className="min-h-[60px] text-sm resize-none"
              required
            />
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm" disabled={submitting}>
              <Send className="h-3 w-3 mr-1" />
              {submitting ? "Posting..." : "Post Reply"}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowReplyForm(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Replies List */}
      {loading ? (
        <div className="text-xs text-muted-foreground">Loading replies...</div>
      ) : (
        replies.length > 0 && (
          <div className="space-y-2 pl-4 border-l-2 border-muted">
            {replies.map((reply) => (
              <div key={reply.id} className="bg-muted/30 rounded-lg p-3 text-sm">
                <p className="whitespace-pre-wrap mb-2">{reply.content}</p>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    {reply.sender_nickname || "Anonymous"}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatDate(reply.created_at)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
