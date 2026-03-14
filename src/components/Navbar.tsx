import { motion, AnimatePresence } from "framer-motion";
import { RocLogo } from "./RocLogo";
import { Button } from "./ui/button";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setIsOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 px-3 py-3 sm:px-4 sm:py-4"
    >
      <div className="container mx-auto max-w-6xl">
        <div className="glass-card rounded-2xl px-4 py-3 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <RocLogo size="sm" />
            <span className="font-display font-bold text-lg sm:text-xl gradient-text">
              Roc AI
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            <button onClick={() => handleNavClick("capabilities")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              Capabilities
            </button>
            <button onClick={() => handleNavClick("about")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              About
            </button>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link to="/auth">
              <Button variant="ghost" size="sm" className="text-sm">
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="gradient" size="sm" className="text-sm">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile: CTA + Menu Toggle */}
          <div className="flex md:hidden items-center gap-2">
            <Link to="/auth">
              <Button variant="gradient" size="sm" className="text-xs px-3 h-8">
                Get Started
              </Button>
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-foreground rounded-lg hover:bg-muted/50 transition-colors"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="md:hidden mt-2 glass-card rounded-2xl overflow-hidden"
            >
              <div className="flex flex-col p-4 gap-1">
                <button
                  onClick={() => handleNavClick("capabilities")}
                  className="text-left text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 text-sm font-medium"
                >
                  Capabilities
                </button>
                <button
                  onClick={() => handleNavClick("about")}
                  className="text-left text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-muted/50 text-sm font-medium"
                >
                  About
                </button>
                <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-border">
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center h-10">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/auth" onClick={() => setIsOpen(false)}>
                    <Button variant="gradient" className="w-full justify-center h-10">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};
