import Navbar         from '@/components/Navbar'
import Hero           from '@/components/Hero'
import TrustBar       from '@/components/TrustBar'
import HowItWorks     from '@/components/HowItWorks'
import Industries     from '@/components/Industries'
import Features       from '@/components/Features'
import CTASection     from '@/components/CTASection'
import SurveySection  from '@/components/SurveySection'
import Footer         from '@/components/Footer'
import ScrollReveal   from '@/components/ScrollReveal'

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <TrustBar />
        <HowItWorks />
        <Industries />
        <Features />
        <CTASection />
        <SurveySection />
      </main>
      <Footer />
      <ScrollReveal />
    </>
  )
}
