"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface Reaction {
  id: string
  reaction_type: string
  created_at: string
}

interface MessageReactionsProps {
  messageId: string
  messageType: "profile" | "room"
}

const REACTION_EMOJIS = {
  like: "👍",
  love: "❤️",
  laugh: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😡",
}

export function MessageReactions({ messageId, messageType }: MessageReactionsProps) {
  const [reactions, setReactions] = useState<Reaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showReactionPicker, setShowReactionPicker] = useState(false)
  const { toast } = useToast()

  const tableName = messageType === "profile" ? "message_reactions" : "room_message_reactions"
  const foreignKey = messageType === "profile" ? "message_id" : "room_message_id"

  useEffect(() => {
    fetchReactions()

    // Set up real-time subscription
    const channel = supabase
      .channel(`${tableName}-changes-${messageId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: tableName,
          filter: `${foreignKey}=eq.${messageId}`,
        },
        () => {
          fetchReactions()
        },
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [messageId, tableName, foreignKey])

  const fetchReactions = async () => {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .eq(foreignKey, messageId)
        .order("created_at", { ascending: true })

      if (error) throw error
      setReactions(data || [])
    } catch (error) {
      console.error("Error fetching reactions:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleReaction = async (reactionType: string) => {
    try {
      // Add reaction (allow multiple reactions)
      const { error } = await supabase.from(tableName).insert([
        {
          [foreignKey]: messageId,
          reaction_type: reactionType,
        },
      ])

      if (error) throw error
      setShowReactionPicker(false)
    } catch (error) {
      console.error("Error adding reaction:", error)
      toast({
        title: "Error",
        description: "Failed to add reaction",
        variant: "destructive",
      })
    }
  }

  const getReactionCount = (reactionType: string) => {
    return reactions.filter((r) => r.reaction_type === reactionType).length
  }

  const getTotalReactions = () => {
    return reactions.length
  }

  const getTopReactions = () => {
    const counts: { [key: string]: number } = {}
    reactions.forEach((r) => {
      counts[r.reaction_type] = (counts[r.reaction_type] || 0) + 1
    })

    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type)
  }

  if (loading) {
    return <div className="text-xs text-muted-foreground">Loading...</div>
  }

  const totalReactions = getTotalReactions()
  const topReactions = getTopReactions()

  return (
    <div className="flex items-center gap-2 mt-2">
      {/* Reaction Display */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/50 rounded-full px-2 py-1">
          <div className="flex -space-x-1">
            {topReactions.map((type) => (
              <span key={type} className="text-xs bg-background rounded-full border border-background">
                {REACTION_EMOJIS[type as keyof typeof REACTION_EMOJIS]}
              </span>
            ))}
          </div>
          <span className="text-xs">{totalReactions}</span>
        </div>
      )}

      {/* Reaction Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowReactionPicker(!showReactionPicker)}
          className="h-7 px-2 text-xs hover:bg-muted/50"
        >
          👍 React
        </Button>

        {/* Reaction Picker */}
        {showReactionPicker && (
          <div className="absolute bottom-full left-0 mb-2 bg-background border rounded-full shadow-lg p-2 flex gap-1 z-10">
            {Object.entries(REACTION_EMOJIS).map(([type, emoji]) => (
              <Button
                key={type}
                variant="ghost"
                size="sm"
                onClick={() => handleReaction(type)}
                className="h-8 w-8 p-0 hover:scale-125 transition-transform"
                title={type}
              >
                <span className="text-lg">{emoji}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
