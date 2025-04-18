"use client"

import { useState, useEffect } from "react"
import { Check, Copy, LinkIcon, Twitter, Facebook, Instagram } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { FaWhatsapp } from "react-icons/fa"

interface RoomShareCardProps {
  roomId: string
  roomName: string
}

export function RoomShareCard({ roomId, roomName }: RoomShareCardProps) {
  const [copied, setCopied] = useState(false)
  const [roomUrl, setRoomUrl] = useState("")
  const { toast } = useToast()

  // Set room URL after component mounts to avoid hydration mismatch
  useEffect(() => {
    setRoomUrl(`${window.location.origin}/room/${roomId}`)
  }, [roomId])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Room link has been copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Could not copy the link to clipboard",
        variant: "destructive",
      })
    }
  }

  const shareText = `Diskusi apapun 100% Anonim!! gabung dengan roomku sekarang jugaa... ${roomUrl}`

  const shareViaTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, "_blank")
  }

  const shareViaFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(roomUrl)}`, "_blank")
  }

  const shareViaWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank")
  }

  const shareViaInstagram = () => {
    // Instagram doesn't have a direct share API, so we'll copy the text to clipboard
    navigator.clipboard.writeText(shareText).then(() => {
      toast({
        title: "Text copied for Instagram",
        description: "Share text copied to clipboard. Open Instagram and paste in your story or DM.",
      })
    })
  }

  return (
    <Card className="overflow-hidden border-2 border-primary/20 bg-gradient-to-br from-background to-accent/30 animate-fade-in">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-primary" />
          Share This Room
        </CardTitle>
        <CardDescription>Invite others to join this room</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="flex gap-2">
            <Input
              value={roomUrl}
              readOnly
              className="font-mono text-sm bg-background/80"
              onClick={(e) => (e.target as HTMLInputElement).select()}
            />
            <Button variant="outline" onClick={handleCopyLink} className="shrink-0 group">
              {copied ? (
                <Check className="h-4 w-4 mr-2 text-green-500" />
              ) : (
                <Copy className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              )}
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button className="w-full group" onClick={shareViaWhatsApp}>
              <FaWhatsapp className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              WhatsApp
            </Button>
            <Button className="w-full group" onClick={shareViaTwitter}>
              <Twitter className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Twitter
            </Button>
            <Button className="w-full group" onClick={shareViaFacebook}>
              <Facebook className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Facebook
            </Button>
            <Button className="w-full group" onClick={shareViaInstagram}>
              <Instagram className="h-4 w-4 mr-2 group-hover:scale-110 transition-transform" />
              Instagram
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
