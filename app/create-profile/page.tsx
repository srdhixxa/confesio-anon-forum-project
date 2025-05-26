import { CreateProfileForm } from "@/components/forms/create-profile-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function CreateProfilePage() {
  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Anonymous</CardTitle>
          <CardDescription>Enter a username to create your anonymous</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateProfileForm />
        </CardContent>
      </Card>
    </div>
  )
}
