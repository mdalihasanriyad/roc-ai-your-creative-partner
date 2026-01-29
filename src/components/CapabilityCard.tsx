import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface CapabilityCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  features: string[];
  gradient: string;
  delay?: number;
}

export const CapabilityCard = ({
  icon: Icon,
  title,
  description,
  features,
  gradient,
  delay = 0,
}: CapabilityCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative"
    >
      {/* Glow Effect */}
      <div 
        className={`absolute -inset-1 ${gradient} rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-opacity duration-500`}
      />
      
      {/* Card */}
      <div className="relative h-full glass-card rounded-2xl p-6 md:p-8 transition-all duration-300">
        {/* Icon */}
        <div className={`inline-flex p-3 rounded-xl ${gradient} mb-6`}>
          <Icon className="h-6 w-6 text-primary-foreground" />
        </div>

        {/* Title */}
        <h3 className="font-display text-xl md:text-2xl font-semibold mb-3">
          {title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground mb-6">
          {description}
        </p>

        {/* Features */}
        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className={`w-1.5 h-1.5 rounded-full ${gradient}`} />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};
