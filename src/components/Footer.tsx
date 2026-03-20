import { RocLogo } from "./RocLogo";
import { Github, Twitter, Linkedin, Heart } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="relative py-10 sm:py-14 md:py-16 px-4 border-t border-border">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col items-center gap-6 sm:gap-8 md:flex-row md:items-start md:justify-between">
          {/* Logo & Tagline */}
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-center gap-2.5">
              <RocLogo size="sm" />
              <span className="font-display font-bold text-lg gradient-text">
                Roc AI
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center md:text-left">
              Create faster. Code smarter. Design better.
            </p>
          </div>

          {/* Links */}
          <div className="flex items-center gap-6 sm:gap-8 text-sm text-muted-foreground">
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
          <div className="flex items-center gap-3">
            <a href="#" className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
              <Twitter className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a href="#" className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
              <Github className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
            <a href="#" className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/50">
              <Linkedin className="h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border text-center">
          <p className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center gap-1">
            Made with <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-500 fill-red-500" /> by the Roc AI Team Leader AH Riyad
          </p>
        </div>
      </div>
    </footer>
  );
};
