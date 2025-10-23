import CreateAccountComponent, { type Testimonial } from "@/components/ui/create-account"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/lib/hooks/useAuth"
import { toast } from "sonner"
import { useState } from "react"

const sampleTestimonials: Testimonial[] = []

export default function CreateAccountPage() {
  const navigate = useNavigate()
  const { signup } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleCreateAccount = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const data = Object.fromEntries(formData.entries())
    
    // Basic validation
    if (data.password !== data.confirmPassword) {
      toast.error("Passwords do not match!")
      return
    }
    
    if (!data.agreeToTerms) {
      toast.error("Please agree to the Terms of Service and Privacy Policy")
      return
    }
    
    setIsLoading(true)
    try {
      await signup(
        data.fullName as string,
        data.email as string,
        data.password as string
      )
      toast.success("Account created! Please check your email for verification code.")
      navigate("/verify-otp", { state: { email: data.email } })
    } catch (error: any) {
      toast.error(error.message || "Failed to create account")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = () => {
    console.log("Google Sign Up clicked")
    navigate("/home")
  }

  const handleSignIn = () => {
    navigate("/sign-in")
  }

  return (
    <div className="bg-background text-foreground min-h-screen">
      <CreateAccountComponent
        testimonials={sampleTestimonials}
        onCreateAccount={handleCreateAccount}
        onGoogleSignUp={handleGoogleSignUp}
        onSignIn={handleSignIn}
      />
    </div>
  )
}
