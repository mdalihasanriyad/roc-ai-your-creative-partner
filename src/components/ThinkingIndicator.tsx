 import { motion } from "framer-motion";
 import { Sparkles } from "lucide-react";
 
 interface ThinkingIndicatorProps {
   message?: string;
 }
 
 export const ThinkingIndicator = ({ message = "Thinking..." }: ThinkingIndicatorProps) => {
   return (
     <motion.div
       initial={{ opacity: 0, y: 10 }}
       animate={{ opacity: 1, y: 0 }}
       exit={{ opacity: 0, y: -10 }}
       transition={{ duration: 0.2 }}
       className="flex items-center gap-2 text-muted-foreground"
     >
       <motion.div
         animate={{ rotate: 360 }}
         transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
       >
         <Sparkles className="h-4 w-4 text-primary" />
       </motion.div>
       <span className="text-sm">{message}</span>
       <div className="flex gap-1">
         {[0, 1, 2].map((i) => (
           <motion.div
             key={i}
             className="h-1.5 w-1.5 rounded-full bg-primary"
             animate={{ opacity: [0.3, 1, 0.3] }}
             transition={{
               duration: 1,
               repeat: Infinity,
               delay: i * 0.2,
             }}
           />
         ))}
       </div>
     </motion.div>
   );
 };