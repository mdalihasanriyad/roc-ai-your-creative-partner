import { motion } from "framer-motion";

interface RocLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export const RocLogo = ({ className = "", size = "md" }: RocLogoProps) => {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  return (
    <motion.div
      className={`relative ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary to-secondary opacity-80 blur-lg" />
      <div className="relative h-full w-full rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="w-1/2 h-1/2"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 2L2 7l10 5 10-5-10-5z" className="fill-primary-foreground/20" />
          <path d="M2 17l10 5 10-5" />
          <path d="M2 12l10 5 10-5" />
        </svg>
      </div>
    </motion.div>
  );
};
