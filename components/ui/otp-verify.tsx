import type React from "react"
import { useState, useRef } from "react"
import { Zap } from "lucide-react"

interface OTPVerificationProps {
  email: string;
  onVerify: (code: string) => Promise<void>;
  onResend: () => void;
}

export function OTPVerification({ email, onVerify, onResend }: OTPVerificationProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isLoading, setIsLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const otpCode = otp.join("")
    if (otpCode.length !== 6) return

    setIsLoading(true)
    try {
      await onVerify(otpCode)
    } catch (error) {
      console.error("OTP verification failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = () => {
    setOtp(["", "", "", "", "", ""])
    inputRefs.current[0]?.focus()
    onResend()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="relative w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl">
        {/* Animated Tunnel Background */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://media.giphy.com/media/xJT7pzbviKNqTqF1Ps/giphy.gif"
            alt="Tunnel animation"
            className="w-full h-full object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-600/80 via-blue-800/90 to-black/95" />
        </div>

        <div className="relative z-10 p-8 py-14">
          <div className="text-center mb-8">
            <div className="w-8 h-8 mx-auto mb-6 text-white">
              <Zap className="w-full h-full" />
            </div>
            <h1 className="text-2xl font-semibold text-white mb-3">Enter verification code</h1>
            <p className="text-white/70 text-sm leading-relaxed">
              We emailed you a verification code to
              <br />
              <span className="text-white">{email}</span>
            </p>
          </div>

          <div className="flex justify-center gap-3 mb-8">
            {otp.map((digit, index) => (
              <div key={index} className="relative">
                <input
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-xl font-medium bg-white/10 border-white/20 text-white placeholder-white/40 focus:bg-white/20 focus:border-white/40 focus:outline-none transition-all duration-200 border shadow-lg opacity-100 rounded-2xl"
                  placeholder=""
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleVerify}
            disabled={otp.join("").length !== 6 || isLoading}
            className="w-full mb-6 px-4 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </button>

          <div className="text-center mb-8">
            <span className="text-white/60 text-sm">Didn't get the code? </span>
            <button
              onClick={handleResend}
              className="text-white/80 hover:text-white text-sm font-medium transition-colors duration-200"
            >
              Resend
            </button>
          </div>

          <div className="text-center">
            <p className="text-white/50 text-xs leading-relaxed">
              By continuing, you agree to our{" "}
              <button className="text-white/70 hover:text-white underline transition-colors">
                Terms of Service
              </button>{" "}
              &{" "}
              <button className="text-white/70 hover:text-white underline transition-colors">
                Privacy Policy
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
