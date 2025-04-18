"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RoomList } from "@/components/rooms/room-list"
import { useSupabaseStatus } from "@/lib/check-supabase"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, MessageSquare, UserPlus, Sparkles, HelpCircle, ArrowRight } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { CreateProfileForm } from "@/components/forms/create-profile-form"

export default function HomePage() {
  const { isConfigured, isLoading } = useSupabaseStatus()
  const [showFeatures, setShowFeatures] = useState(false)

  return (
    <div className="space-y-8">
      {isLoading
        ? null
        : !isConfigured && (
            <Alert variant="destructive" className="animate-slide-in">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Configuration Error</AlertTitle>
              <AlertDescription>
                Supabase is not properly configured. Please check your environment variables in the Vercel dashboard.
                Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set correctly.
              </AlertDescription>
            </Alert>
          )}

      <section className="py-8 space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold gradient-text">Confessio</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create an anonymous profile, join rooms, and start messaging without revealing your identity.
          </p>
        </div>
      </section>

      {/* Create Profile Form */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          Create Your Anonymous Profile
        </h2>
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>
              Create your anonymous profile with just a username - no email or password required
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateProfileForm />
          </CardContent>
        </Card>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Anonymous Profiles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Create a profile with just a username. No email, no password, complete anonymity.</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Public & Private Rooms
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Join public discussions or create private rooms that are only accessible via direct links.</p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Real-time Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>Send and receive messages instantly with real-time updates. No refreshing needed.</p>
          </CardContent>
        </Card>
      </div>

      {/* How to Use Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            How to Use Confessio
          </h2>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="step-1">
                <AccordionTrigger className="text-lg font-medium">
                  <span className="flex items-center gap-2">
                    <span className="bg-primary/20 w-6 h-6 rounded-full flex items-center justify-center text-primary font-bold">
                      1
                    </span>
                    Create Your Anonymous Profile
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-8">
                  <p className="mb-2">
                    Start by creating your anonymous profile above. You only need to choose a username - no email or
                    password required.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-2">
                <AccordionTrigger className="text-lg font-medium">
                  <span className="flex items-center gap-2">
                    <span className="bg-primary/20 w-6 h-6 rounded-full flex items-center justify-center text-primary font-bold">
                      2
                    </span>
                    Join or Create a Room
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-8">
                  <p className="mb-2">
                    Browse and join existing public rooms, or create your own room. You can create public rooms that
                    anyone can join, or private rooms where only invited users can participate.
                  </p>
                  <div className="flex gap-4 mt-3">
                    <Link href="#public-rooms">
                      <Button variant="link" className="p-0 h-auto flex items-center gap-1">
                        Browse public rooms <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                    <Link href="/create-room">
                      <Button variant="link" className="p-0 h-auto flex items-center gap-1">
                        Create a new room <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-3">
                <AccordionTrigger className="text-lg font-medium">
                  <span className="flex items-center gap-2">
                    <span className="bg-primary/20 w-6 h-6 rounded-full flex items-center justify-center text-primary font-bold">
                      3
                    </span>
                    Send and Receive Messages
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-8">
                  <p>
                    Once in a room, you can send messages anonymously or include your username. All messages appear in
                    real-time, so there's no need to refresh the page. For private rooms, you can share the link with
                    others.
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="step-4">
                <AccordionTrigger className="text-lg font-medium">
                  <span className="flex items-center gap-2">
                    <span className="bg-primary/20 w-6 h-6 rounded-full flex items-center justify-center text-primary font-bold">
                      4
                    </span>
                    Share Your Profile
                  </span>
                </AccordionTrigger>
                <AccordionContent className="pl-8">
                  <p>
                    Share your profile link with others so they can send you anonymous messages. You can copy your
                    profile link or share it directly on social media platforms.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4" id="public-rooms">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Public Rooms</h2>
          <Button variant="ghost" onClick={() => setShowFeatures(!showFeatures)}>
            {showFeatures ? "Hide Features" : "Show Features"}
          </Button>
        </div>

        {showFeatures && (
          <div className="bg-accent/50 p-4 rounded-lg mb-4 animate-slide-in">
            <h3 className="font-medium mb-2">✨ Room Features</h3>
            <ul className="list-disc pl-5 space-y-1 text-sm">
              <li>Join any public room without registration</li>
              <li>Send messages anonymously or with your username</li>
              <li>Create your own rooms with custom settings</li>
              <li>Share room links with friends</li>
            </ul>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Join a Room</CardTitle>
            <CardDescription>Browse and join public rooms to start chatting</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div className="py-8 text-center">Loading rooms...</div>}>
              <RoomList />
            </Suspense>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
