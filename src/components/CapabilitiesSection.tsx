import { motion } from "framer-motion";
import { CapabilityCard } from "./CapabilityCard";
import { PenLine, Code2, Palette, Search } from "lucide-react";

const capabilities = [
  {
    icon: PenLine,
    title: "Text & Writing Expert",
    description: "From blogs to emails, let Roc craft compelling content that resonates with your audience.",
    features: [
      "Blog posts & articles",
      "Professional emails & CVs",
      "Grammar fixing & rewriting",
      "Summarizing long content",
    ],
    gradient: "bg-gradient-to-br from-purple-500 to-pink-500",
  },
  {
    icon: Code2,
    title: "Coding & Development",
    description: "Debug, optimize, and write clean code across multiple languages and frameworks.",
    features: [
      "MERN, React, Tailwind",
      "Python, JavaScript, C",
      "Step-by-step explanations",
      "Clean, reusable components",
    ],
    gradient: "bg-gradient-to-br from-blue-500 to-cyan-500",
  },
  {
    icon: Palette,
    title: "Image & Creative",
    description: "Generate stunning AI image prompts for any creative project you can imagine.",
    features: [
      "Detailed image prompts",
      "Social media creatives",
      "UI mockups & posters",
      "Ads & marketing visuals",
    ],
    gradient: "bg-gradient-to-br from-orange-500 to-red-500",
  },
  {
    icon: Search,
    title: "Research & Knowledgement",
    description: "Deep research and clear insights to help you understand complex topics quickly.",
    features: [
      "In-depth research",
      "Comparisons & analysis",
      "Clear explanations",
      "Honest uncertainty",
    ],
    gradient: "bg-gradient-to-br from-green-500 to-emerald-500",
  },
];

export const CapabilitiesSection = () => {
  return (
    <section id="capabilities" className="relative py-24 px-4">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      
      <div className="container mx-auto relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            One AI, <span className="gradient-text">Endless Possibilities</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Roc AI adapts to your needs — whether you're writing, coding, creating, or researching.
          </p>
        </motion.div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {capabilities.map((capability, index) => (
            <CapabilityCard
              key={capability.title}
              {...capability}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
