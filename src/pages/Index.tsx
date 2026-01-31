import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { CapabilitiesSection } from "@/components/CapabilitiesSection";
import { Footer } from "@/components/Footer";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Helmet>
        {/* Primary SEO */}
        <title>Roc AI – Smart & Lovable AI Assistant</title>
        <meta
          name="description"
          content="Roc AI is a smart, fast and lovable AI assistant that helps you chat, learn and solve problems. Works smoothly on mobile, tablet and desktop."
        />
        <meta
          name="keywords"
          content="Roc AI, AI assistant, lovable AI, smart chatbot, free AI chat app"
        />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://rocai.vercel.app/" />

        {/* Open Graph */}
        <meta property="og:title" content="Roc AI – Smart & Lovable AI Assistant" />
        <meta
          property="og:description"
          content="Chat smarter with Roc AI – a fast, friendly and intelligent AI assistant."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://rocai.vercel.app/" />
        <meta property="og:image" content="https://rocai.vercel.app/og-image.png" />

        {/* Twitter / X */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Roc AI – Smart & Lovable AI Assistant" />
        <meta
          name="twitter:description"
          content="A friendly AI assistant to chat, learn and create smarter."
        />
        <meta
          name="twitter:image"
          content="https://rocai.vercel.app/og-image.png"
        />
      </Helmet>

      <Navbar />
      <HeroSection />
      <CapabilitiesSection />
      <Footer />
    </div>
  );
};

export default Index;
