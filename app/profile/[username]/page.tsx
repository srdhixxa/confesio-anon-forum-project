import { Suspense } from "react"
import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { formatDate, generateColor } from "@/lib/utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SendMessageForm } from "@/components/forms/send-message-form"
import { MessageList } from "@/components/messages/message-list"
import { ProfileShareCard } from "@/components/profile/profile-share-card"
import { ShareProfile } from "@/components/profile/share-profile"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Clock } from "lucide-react"

interface ProfilePageProps {
  params: {
    username: string
  }
}

async function getUser(username: string) {
  const { data, error } = await supabase.from("users").select("*").eq("username", username).single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = params
  const decodedUsername = decodeURIComponent(username)
  const user = await getUser(decodedUsername)

  if (!user) {
    notFound()
  }

  const colorClass = generateColor(decodedUsername)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Card className="overflow-hidden border-none shadow-lg">
        <div className="h-32 bg-gradient-to-r from-primary/40 to-purple-400/40"></div>
        <CardHeader className="-mt-16 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-white ${colorClass} shadow-lg border-4 border-background animate-pulse-slow`}
              >
                <span className="text-3xl font-bold">{decodedUsername.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <CardTitle className="text-2xl md:text-3xl gradient-text">{decodedUsername}</CardTitle>
                <CardDescription className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Joined {formatDate(user.created_at)}
                </CardDescription>
              </div>
            </div>
            <ShareProfile username={decodedUsername} />
          </div>
        </CardHeader>
      </Card>

      <ProfileShareCard username={decodedUsername} />

      <Tabs defaultValue="send" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="send" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Send Message</span>
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>View Messages</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="send" className="mt-4 animate-slide-in">
          <Card className="overflow-hidden border shadow-md">
            <CardHeader className="pb-2 bg-accent/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Send Anonymous Message
              </CardTitle>
              <CardDescription>Your message will be public and visible to everyone</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <SendMessageForm recipientId={user.id} recipientUsername={decodedUsername} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="messages" className="mt-4 animate-slide-in">
          <Card className="overflow-hidden border shadow-md">
            <CardHeader className="pb-2 bg-accent/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Messages
              </CardTitle>
              <CardDescription>All messages sent to {decodedUsername}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Suspense fallback={<div className="py-8 text-center">Loading messages...</div>}>
                <MessageList recipientId={user.id} />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
