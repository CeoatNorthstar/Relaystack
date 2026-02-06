import { Hero } from "@/components/landing/Hero";
import { Providers } from "@/components/landing/Providers";
import { Features } from "@/components/landing/Features";
import { InteractiveDemo } from "@/components/landing/InteractiveDemo";
import { CodePreview } from "@/components/landing/CodePreview";
import { Pricing } from "@/components/landing/Pricing";
import { CTA } from "@/components/landing/CTA";

export default function LandingPage() {
  return (
    <>
      <Hero />
      <Providers />
      <Features />
      <InteractiveDemo />
      <CodePreview />
      <Pricing />
      <CTA />
    </>
  );
}
