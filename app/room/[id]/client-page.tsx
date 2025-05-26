"use client"

import { formatDate } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SendRoomMessageForm } from "@/components/forms/send-room-message-form"
import { RoomMessageList } from "@/components/messages/room-message-list"
import { RoomShare } from "@/components/rooms/room-share"
import { RoomShareCard } from "@/components/rooms/room-share-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Unlock } from "lucide-react"

interface Room {
  id: string
  name: string
  description: string | null
  is_private: boolean
  created_at: string
  created_by: string | null
  users: {
    username: string | null
  } | null
}

interface ClientRoomPageProps {
  room: Room
}

export function ClientRoomPage({ room }: ClientRoomPageProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="h-32 bg-gradient-to-r from-primary/40 to-purple-400/40"></div>
        <CardHeader className="-mt-16 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full flex items-center justify-center text-white bg-primary shadow-md border-4 border-background">
                <span className="text-2xl font-bold">{room.name.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-2xl">{room.name}</CardTitle>
                  <Badge variant="secondary">
                    <div className="flex items-center gap-1">
                      <Unlock className="h-3 w-3" />
                      Public Room
                    </div>
                  </Badge>
                </div>
                <CardDescription>
                  Created {formatDate(room.created_at)}
                  {room.users?.username && ` by ${room.users.username}`}
                </CardDescription>
              </div>
            </div>
            <RoomShare roomId={room.id} roomName={room.name} />
          </div>
          {room.description && (
            <p className="mt-4 text-sm text-muted-foreground whitespace-pre-wrap">{room.description}</p>
          )}
        </CardHeader>
      </Card>

      <RoomShareCard roomId={room.id} roomName={room.name} />

      <Tabs defaultValue="messages" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </TabsTrigger>
          <TabsTrigger value="send" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Send Message</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="messages" className="mt-4 animate-slide-in">
          <Card>
            <CardHeader className="pb-2 bg-accent/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Messages
              </CardTitle>
              <CardDescription>All messages in this public room with reactions and replies</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <RoomMessageList roomId={room.id} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="send" className="mt-4 animate-slide-in">
          <Card>
            <CardHeader className="pb-2 bg-accent/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Send Message
              </CardTitle>
              <CardDescription>Your message will be visible to everyone in this room</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <SendRoomMessageForm roomId={room.id} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default ClientRoomPage
