import { motion } from "framer-motion";
import { RocLogo } from "./RocLogo";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-4 py-4"
    >
      <div className="container mx-auto">
        <div className="glass-card rounded-2xl px-4 py-3 md:px-6 md:py-4 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <RocLogo size="sm" />
            <span className="font-display font-bold text-xl gradient-text">
              Roc AI
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#capabilities" className="text-muted-foreground hover:text-foreground transition-colors">
              Capabilities
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/chat">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
            </Link>
            <Link to="/chat">
            <Button variant="gradient" size="sm">
              Get Started
            </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mt-2 glass-card rounded-2xl p-4"
          >
            <div className="flex flex-col gap-4">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                Features
              </a>
              <a href="#capabilities" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                Capabilities
              </a>
              <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors py-2">
                About
              </a>
              <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <Button variant="ghost" className="w-full justify-center">
                  Sign In
                </Button>
                <Button variant="gradient" className="w-full justify-center">
                  Get Started
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
};
