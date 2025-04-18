"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Clock, User } from "lucide-react"

interface RoomInvitation {
  id: string
  invited_username: string
  invited_by: string | null
  status: string
  created_at: string
}

interface RoomInvitationsProps {
  roomId: string
}

export function RoomInvitations({ roomId }: RoomInvitationsProps) {
  const [invitations, setInvitations] = useState<RoomInvitation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInvitations() {
      try {
        const { data, error } = await supabase
          .from("room_invitations")
          .select("*")
          .eq("room_id", roomId)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setInvitations(data || [])
      } catch (error) {
        console.error("Error fetching invitations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchInvitations()

    // Set up real-time subscription
    const channel = supabase
      .channel("room-invitations-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "room_invitations",
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setInvitations((prev) => [payload.new as RoomInvitation, ...prev])
          } else if (payload.eventType === "UPDATE") {
            setInvitations((prev) =>
              prev.map((inv) => (inv.id === payload.new.id ? (payload.new as RoomInvitation) : inv)),
            )
          } else if (payload.eventType === "DELETE") {
            setInvitations((prev) => prev.filter((inv) => inv.id !== payload.old.id))
          }
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
        {[1, 2].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-5 w-1/3 mb-2" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (invitations.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No invitations have been sent for this room.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {invitations.map((invitation) => (
        <Card key={invitation.id} className="overflow-hidden animate-slide-in">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="h-4 w-4" />
                {invitation.invited_username}
              </CardTitle>
              <Badge
                variant={
                  invitation.status === "approved"
                    ? "default"
                    : invitation.status === "rejected"
                      ? "destructive"
                      : "outline"
                }
              >
                {invitation.status}
              </Badge>
            </div>
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Invited {formatDate(invitation.created_at)}
              {invitation.invited_by && ` by ${invitation.invited_by}`}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
