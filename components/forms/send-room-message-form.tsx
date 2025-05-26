"use client"

import type React from "react"

import { useState, useRef } from "react"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Send, ImageIcon, X, Loader2 } from "lucide-react"

interface SendRoomMessageFormProps {
  roomId: string
}

export function SendRoomMessageForm({ roomId }: SendRoomMessageFormProps) {
  const [content, setContent] = useState("")
  const [senderUsername, setSenderUsername] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      setSelectedImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeImage = () => {
    setSelectedImage(null)
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    // In a real app, you would upload to a storage service
    // For demo purposes, we'll convert to base64 and store directly
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim() && !selectedImage) {
      toast({
        title: "Error",
        description: "Please enter a message or select an image",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      let imageUrl = null
      if (selectedImage) {
        imageUrl = await uploadImage(selectedImage)
      }

      const { error } = await supabase.from("room_messages").insert([
        {
          room_id: roomId,
          content: content.trim() || null,
          sender_username: senderUsername.trim() || null,
          image_url: imageUrl,
        },
      ])

      if (error) {
        throw error
      }

      toast({
        title: "Message sent",
        description: "Your message has been sent to the room.",
      })

      // Clear form
      setContent("")
      setSenderUsername("")
      removeImage()
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="content">Message</Label>
        <Textarea
          id="content"
          placeholder="Write a message..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={isLoading}
          className="min-h-[100px] resize-none focus:ring-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="username">Username (optional)</Label>
        <Input
          id="username"
          placeholder="Your username (leave blank to stay anonymous)"
          value={senderUsername}
          onChange={(e) => setSenderUsername(e.target.value)}
          disabled={isLoading}
          className="focus:ring-primary"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image (optional)</Label>
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            disabled={isLoading}
            className="hidden"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <ImageIcon className="h-4 w-4" />
            Select Image
          </Button>
          {selectedImage && <span className="text-sm text-muted-foreground">{selectedImage.name}</span>}
        </div>

        {imagePreview && (
          <div className="relative inline-block">
            <img
              src={imagePreview || "/placeholder.svg"}
              alt="Preview"
              className="max-w-xs max-h-32 rounded-lg border"
            />
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6"
              onClick={removeImage}
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
        {isLoading ? "Sending..." : "Send Message"}
      </Button>
    </form>
  )
}
