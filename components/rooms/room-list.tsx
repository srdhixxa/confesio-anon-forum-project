"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MessageSquare, Users, Clock, Lock, Unlock } from "lucide-react"

interface Room {
  id: string
  name: string
  description: string
  is_private: boolean
  created_at: string
}

export function RoomList() {
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchRooms() {
      try {
        const { data, error } = await supabase
          .from("rooms")
          .select("*")
          .eq("is_private", false)
          .order("created_at", { ascending: false })

        if (error) {
          throw error
        }

        setRooms(data || [])
      } catch (error) {
        console.error("Error fetching rooms:", error)
        setError("Failed to load rooms. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRooms()
  }, [])

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Try Again</Button>
      </div>
    )
  }

  if (rooms.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground mb-4">No public rooms available.</p>
        <Link href="/create-room">
          <Button className="group">
            <MessageSquare className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform" />
            Create the first room
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {rooms.map((room, index) => (
        <Card
          key={room.id}
          className="overflow-hidden card-hover animate-slide-in"
          style={{ animationDelay: `${index * 0.05}s` }}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="flex items-center gap-2">
                {room.name}
                {room.is_private ? (
                  <Lock className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Unlock className="h-4 w-4 text-muted-foreground" />
                )}
              </CardTitle>
            </div>
            <CardDescription className="flex items-center gap-1">
              <Clock className="h-3 w-3" /> Created {formatDate(room.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-2">{room.description || "No description provided."}</p>
          </CardContent>
          <CardFooter>
            <Link href={`/room/${room.id}`} className="w-full">
              <Button className="w-full group">
                <Users className="mr-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                Join Room
              </Button>
            </Link>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
