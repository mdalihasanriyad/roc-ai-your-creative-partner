import { RocLogo } from "./RocLogo";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative py-16 px-4 border-t border-border">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-3">
              <RocLogo size="sm" />
              <span className="font-display font-bold text-xl gradient-text">
                Roc AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Create faster. Code smarter. Design better.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-foreground transition-colors">
              Contact
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a href="#" className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
              <Twitter className="h-5 w-5" />
            </a>
            <a href="#" className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
              <Github className="h-5 w-5" />
            </a>
            <a href="#" className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> by the Roc AI Team
          </p>
        </div>
      </div>
    </footer>
  );
};
