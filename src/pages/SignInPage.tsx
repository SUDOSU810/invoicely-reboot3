import SignInComponent, { type Testimonial } from "@/components/ui/sign-in"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/hooks/useAuth"
import { toast } from "sonner"
import { useState } from "react"

const sampleTestimonials: Testimonial[] = []

export default function SignInPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    setIsLoading(true)
    try {
      await login(data.email as string, data.password as string)
      toast.success("Signed in successfully!")
      navigate("/home")
    } catch (error: any) {
      if (error.name === "UserNotConfirmedException") {
        toast.error("Please verify your email first")
        navigate("/verify-otp", { state: { email: data.email } })
      } else {
        toast.error(error.message || "Failed to sign in")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = () => {
    toast.info("Google Sign In coming soon!")
    // Implement Google OAuth with AWS Cognito
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <SignInComponent
        testimonials={sampleTestimonials}
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={() => alert("Reset Password clicked")}
        onCreateAccount={() => navigate("/create-account")}
      />
    </div>
  )
}
