import Navigation from "@/components/ui/navigation"
import HeroSection from "@/components/ui/hero-section"
import { FeatureSteps } from "@/components/ui/feature-steps"
import Footer from "@/components/ui/footer"
import Aurora from "@/components/ui/aurora"
import Carousel from "@/components/ui/carousel"

const invoiceFeatures = [
  {
    step: "Step 1",
    title: "Generate Invoices",
    content:
      "Create professional invoices in seconds with our intuitive drag-and-drop builder. Add your logo, customize colors, and include all necessary details.",
    image: "/professional-invoice-creation-interface.jpg",
  },
  {
    step: "Step 2",
    title: "View Invoice History",
    content:
      "Access your complete invoice history with powerful search and filtering. Track payment status, due dates, and client information all in one place.",
    image: "/invoice-history-dashboard-with-charts.jpg",
  },
  {
    step: "Step 3",
    title: "Email Invoices",
    content:
      "Send invoices directly to clients with automated email delivery. Set up payment reminders and track when invoices are opened and viewed.",
    image: "/email-invoice-sending-interface.jpg",
  },
  {
    step: "Step 4",
    title: "Design Custom Templates",
    content:
      "Create branded invoice templates that reflect your business identity. Choose from dozens of professional layouts or design your own from scratch.",
    image: "/custom-invoice-template-designer.jpg",
  },
]

const teamMembers = [
  {
    title: "SUHAN POOJARY",
    description: "Full Stack Developer & Project Lead",
    id: 1,
    icon: <span className="text-2xl font-bold">SP</span>,
  },
  {
    title: "SUMIT JHA",
    description: "Backend Developer & Database Architect",
    id: 2,
    icon: <span className="text-2xl font-bold">SJ</span>,
  },
  {
    title: "VED MOTWANI",
    description: "Frontend Developer & UI/UX Designer",
    id: 3,
    icon: <span className="text-2xl font-bold">VM</span>,
  },
  {
    title: "VAIBHAV KANKONKAR",
    description: "DevOps Engineer & Quality Assurance",
    id: 4,
    icon: <span className="text-2xl font-bold">VK</span>,
  },
]

export default function LandingPage() {
  return (
    <>
      <div className="fixed top-0 left-0 w-full h-full z-0">
        <Aurora colorStops={["#1e3a8a", "#3b82f6", "#60a5fa"]} blend={0.5} amplitude={1.0} speed={0.5} />
      </div>

      <main className="min-h-screen relative z-10">
        <Navigation />
        <HeroSection />

        {/* Features Section */}
        <section id="features" className="py-24 relative">
          <FeatureSteps
            features={invoiceFeatures}
            title="How Invoicely Works"
            autoPlayInterval={4000}
            className="max-w-7xl mx-auto"
          />
        </section>

        {/* About Us Section */}
        <section id="about" className="py-24 relative">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">Meet Our Team</h2>
              <p className="text-xl text-blue-200 max-w-3xl mx-auto">
                The talented individuals behind Invoicely, dedicated to revolutionizing your invoicing experience
              </p>
            </div>

            <div className="w-full max-w-4xl mx-auto">
              <div className="relative" style={{ height: "450px" }}>
                <Carousel
                  items={teamMembers}
                  baseWidth={400}
                  autoplay={true}
                  autoplayDelay={3000}
                  pauseOnHover={true}
                  loop={true}
                  round={false}
                />
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}
