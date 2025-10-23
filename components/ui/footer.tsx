"use client"

import type React from "react"
import { Brain, Facebook, Twitter, Linkedin, Github, Instagram, Mail, Phone, MapPin } from "lucide-react"

const Footer: React.FC = () => {
  return (
    <footer className="relative bg-slate-900 pt-32 pb-12 overflow-hidden">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.25) 0%, rgba(30, 64, 175, 0.15) 30%, transparent 70%),
            radial-gradient(circle at 80% 70%, rgba(37, 99, 235, 0.2) 0%, rgba(29, 78, 216, 0.1) 40%, transparent 80%),
            radial-gradient(circle at 40% 80%, rgba(96, 165, 250, 0.15) 0%, rgba(59, 130, 246, 0.08) 50%, transparent 90%),
            radial-gradient(circle at 60% 20%, rgba(147, 197, 253, 0.12) 0%, transparent 60%),
            linear-gradient(135deg, rgba(30, 58, 138, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%)
          `,
          opacity: 0.9,
        }}
      />

      <div
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-blue-400/8 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-blue-600/12 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 max-w-7xl mx-auto">
          <div className="group">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Brain className="h-6 w-6" />
              </div>
              <span className="ml-3 text-xl font-bold tracking-tight text-white">Invoicely</span>
            </div>
            <p className="text-blue-100 leading-relaxed mb-8">
              Professional invoicing made simple. Create, send, and track invoices with ease.
            </p>
            <div className="flex space-x-4">
              {[
                { icon: Facebook, href: "#" },
                { icon: Twitter, href: "#" },
                { icon: Linkedin, href: "#" },
                { icon: Github, href: "#" },
                { icon: Instagram, href: "#" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-blue-100 hover:bg-blue-500 hover:text-white hover:border-blue-400 transition-all duration-300 shadow-sm hover:shadow-lg"
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold tracking-tight mb-6 text-white">Features</h4>
            <ul className="space-y-4">
              {[
                "Invoice Generator",
                "Payment Tracking",
                "Custom Templates",
                "Email Integration",
                "Analytics Dashboard",
              ].map((service, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {service}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold tracking-tight mb-6 text-white">Company</h4>
            <ul className="space-y-4">
              {["About Us", "Pricing", "Templates", "Blog", "Support"].map((item, idx) => (
                <li key={idx}>
                  <a
                    href="#"
                    className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mr-2 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold tracking-tight mb-6 text-white">Contact</h4>
            <ul className="space-y-4">
              <li className="text-blue-100 flex items-center">
                <MapPin className="w-5 h-5 mr-2 text-blue-200" />
                San Francisco, CA
              </li>
              <li>
                <a
                  href="mailto:hello@invoicely.com"
                  className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <Mail className="w-5 h-5 mr-2 text-blue-200" />
                  hello@invoicely.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+15551234567"
                  className="text-blue-100 hover:text-white transition-colors duration-300 flex items-center group"
                >
                  <Phone className="w-5 h-5 mr-2 text-blue-200" />
                  +1 (555) 123-4567
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-white/20 text-center">
          <p className="text-blue-200 text-sm font-medium">
            © {new Date().getFullYear()} Invoicely. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
