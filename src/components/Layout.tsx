import { NavBar } from "@/components/ui/tubelight-navbar"
import Aurora from "@/components/ui/aurora"
import InvoicelyLogo from "@/components/ui/invoicely-logo"
import AWSStatusIndicator from "@/components/ui/aws-status-indicator"
import { Home, History, Settings } from "lucide-react"

const navItems = [
  { name: "Home", url: "/home", icon: Home },
  { name: "History", url: "/history", icon: History },
  { name: "Settings", url: "/settings", icon: Settings },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Aurora Background - Same as Landing Page */}
      <div className="fixed top-0 left-0 w-full h-full z-0">
        <Aurora colorStops={["#1e3a8a", "#3b82f6", "#60a5fa"]} blend={0.5} amplitude={1.0} speed={0.5} />
      </div>

      {/* Main Content with Navigation */}
      <div className="min-h-screen relative z-10">
        {/* Logo in top left corner */}
        <div className="fixed top-6 left-6 z-40 bg-transparent backdrop-blur-sm border border-white/10 rounded-xl px-3 py-2">
          <InvoicelyLogo 
            width={100} 
            height={32}
            className="bg-transparent"
            color="white"
          />
        </div>

        {/* AWS Status Indicator in top right corner */}
        <div className="fixed top-6 right-6 z-40">
          <AWSStatusIndicator />
        </div>
        
        <NavBar items={navItems} />
        <main>
          {children}
        </main>
      </div>
    </>
  )
}
