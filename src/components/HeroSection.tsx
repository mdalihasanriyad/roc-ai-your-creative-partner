import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24 pb-12 sm:pb-16 px-4">
      {/* Background Effects */}
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute top-1/4 left-1/4 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-primary/20 rounded-full blur-[80px] sm:blur-[128px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-secondary/20 rounded-full blur-[80px] sm:blur-[128px] animate-float" style={{ animationDelay: "-3s" }} />
      
      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="container mx-auto relative z-10 max-w-5xl">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full glass-card mb-6 sm:mb-8"
          >
            <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0" />
            <span className="text-xs sm:text-sm text-muted-foreground">
              Your Intelligent AI Companion
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-display text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-4 sm:mb-6 leading-tight"
          >
            Think Faster.{" "}
            <span className="gradient-text">Create Better.</span>
            <br className="hidden xs:block" />
            {" "}Build Smarter.
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8 sm:mb-10 px-2"
          >
            Meet Roc AI — your all-in-one assistant for writing, coding, creativity, 
            and research. Powered by advanced AI to help you work smarter.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-col xs:flex-row items-center justify-center gap-3 sm:gap-4 mb-12 sm:mb-16 px-4"
          >
            <Link to="/chat" className="w-full xs:w-auto">
              <Button variant="hero" size="xl" className="w-full xs:w-auto text-sm sm:text-base px-6 sm:px-8">
                Start Chatting Free
                <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
            <Button
              variant="glass"
              size="xl"
              className="w-full xs:w-auto text-sm sm:text-base px-6 sm:px-8"
              onClick={() => document.getElementById('capabilities')?.scrollIntoView({ behavior: 'smooth' })}
            >
              See Capabilities
            </Button>
          </motion.div>

          {/* Quick Start Suggestions */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="max-w-2xl mx-auto px-2"
          >
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">Try asking Roc to:</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {[
                "✍️ Write a cover letter",
                "💻 Debug my React code",
                "🎨 Create an image prompt",
                "🔍 Research a topic",
              ].map((suggestion) => (
                <Link key={suggestion} to="/chat">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm text-muted-foreground glass-card hover:text-foreground transition-colors"
                  >
                    {suggestion}
                  </motion.button>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
