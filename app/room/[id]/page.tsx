import { notFound } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { ClientRoomPage } from "./client-page"

interface RoomPageProps {
  params: {
    id: string
  }
}

async function getRoom(id: string) {
  const { data, error } = await supabase.from("rooms").select("*, users(username)").eq("id", id).single()

  if (error || !data) {
    return null
  }

  return data
}

export default async function RoomPage({ params }: RoomPageProps) {
  const { id } = params
  const room = await getRoom(id)

  if (!room) {
    notFound()
  }

  return <ClientRoomPage room={room} />
}
