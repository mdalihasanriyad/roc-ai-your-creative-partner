 import { useEffect, useRef } from "react";
 
 const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
 
 /**
  * Warms up the edge function on app load to reduce cold start latency.
  * Makes a lightweight OPTIONS request that triggers the serverless function.
  */
 export function useApiWarmup() {
   const hasWarmedUp = useRef(false);
 
   useEffect(() => {
     if (hasWarmedUp.current) return;
     hasWarmedUp.current = true;
 
     // Warm up the edge function with an OPTIONS preflight request
     // This triggers the function without processing a full request
     const warmup = async () => {
       try {
         await fetch(CHAT_URL, {
           method: "OPTIONS",
           headers: {
             "Content-Type": "application/json",
           },
         });
         console.log("[Warmup] Edge function warmed up successfully");
       } catch (error) {
         // Silently fail - warmup is best effort
         console.log("[Warmup] Edge function warmup failed (non-critical)");
       }
     };
 
     // Use requestIdleCallback for non-blocking warmup, fallback to setTimeout
     if ("requestIdleCallback" in window) {
       requestIdleCallback(() => warmup(), { timeout: 2000 });
     } else {
       setTimeout(warmup, 100);
     }
   }, []);
 }