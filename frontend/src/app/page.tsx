'use client'

import PremiumNavbar from '@/components/layout/PremiumNavbar'
import ConversionHero from '@/components/sections/ConversionHero'
import QuickValue from '@/components/sections/QuickValue'
import SocialProof from '@/components/sections/SocialProof'
import FeatureHighlights from '@/components/sections/FeatureHighlights'
import UrgencyPricing from '@/components/sections/UrgencyPricing'
import TrustAndSecurity from '@/components/sections/TrustAndSecurity'
import FinalCTA from '@/components/sections/FinalCTA'
import Footer from '@/components/layout/Footer'
import Portfolio3D from '@/components/3d/Portfolio3D'
import { ReactLenis } from '@studio-freight/react-lenis'

export default function Home() {
  return (
    <ReactLenis root>
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-black to-blue-900 relative overflow-hidden">
        {/* Red-Black-Blue vertical stripe pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="h-full w-full bg-gradient-to-r from-red-600/20 via-gray-900/20 to-blue-600/20"></div>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] bg-[length:40px_100%]"></div>
        </div>
        <PremiumNavbar />
        <main>
          <ConversionHero />
          <SocialProof />
          <QuickValue />
          
          {/* Portfolio3D Section */}
          <section className="relative py-20 bg-black/20 backdrop-blur-sm">
            <div className="container mx-auto px-6">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
                  Personal Finance Dashboard
                </h2>
                <p className="text-xl text-white/80 max-w-3xl mx-auto">
                  Visualize your financial journey in stunning 3D. Explore savings, investments, and financial goals like never before.
                </p>
              </div>
              <div className="h-[600px] rounded-2xl overflow-hidden border border-white/10">
                <Portfolio3D />
              </div>
            </div>
          </section>
          
          <FeatureHighlights />
          <TrustAndSecurity />
          <UrgencyPricing />
          <FinalCTA />
        </main>
        <Footer />
      </div>
    </ReactLenis>
  )
}
