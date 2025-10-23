import { useNavigate, useLocation } from "react-router-dom"
import { OTPVerification } from "@/components/ui/otp-verify"
import { useAuth } from "@/lib/hooks/useAuth"
import { toast } from "sonner"

export default function OTPVerifyPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { confirmSignup } = useAuth()
  
  // Get email from navigation state
  const email = location.state?.email || ""

  const handleVerify = async (code: string) => {
    try {
      await confirmSignup(email, code)
      toast.success("Email verified successfully!")
      navigate("/sign-in")
    } catch (error: any) {
      toast.error(error.message || "Invalid verification code")
      throw error
    }
  }

  const handleResend = () => {
    toast.info("Verification code has been resent to your email")
    // In a real implementation, you would call an API to resend the code
  }

  if (!email) {
    navigate("/create-account")
    return null
  }

  return (
    <OTPVerification 
      email={email}
      onVerify={handleVerify}
      onResend={handleResend}
    />
  )
}
