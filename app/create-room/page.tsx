import { CreateRoomForm } from "@/components/forms/create-room-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateRoomPage() {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Room</CardTitle>
          <CardDescription>Create a new public room</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateRoomForm />
        </CardContent>
      </Card>
    </div>
  )
}
