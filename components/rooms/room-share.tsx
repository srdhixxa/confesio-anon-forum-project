"use client"

import { useState, useEffect } from "react"
import { Check, Copy, Share2, Twitter, Facebook, Instagram } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { FaWhatsapp } from "react-icons/fa"

interface RoomShareProps {
  roomId: string
  roomName: string
}

export function RoomShare({ roomId, roomName }: RoomShareProps) {
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
    <div className="flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" size="icon" onClick={handleCopyLink}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Copy room link</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="flex gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={shareViaTwitter}>
                    <Twitter className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on Twitter</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={shareViaFacebook}>
                    <Facebook className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on Facebook</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={shareViaWhatsApp}>
                    <FaWhatsapp className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share on WhatsApp</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={shareViaInstagram}>
                    <Instagram className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy for Instagram</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
