 import { useState } from "react";
 import {
   Dialog,
   DialogContent,
   DialogHeader,
   DialogTitle,
   DialogFooter,
 } from "@/components/ui/dialog";
 import { Button } from "@/components/ui/button";
 import { Textarea } from "@/components/ui/textarea";
 import { Loader2 } from "lucide-react";
 
 interface ImageEditDialogProps {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   imageUrl: string;
   onSubmit: (instruction: string) => void;
   isLoading?: boolean;
 }
 
 export const ImageEditDialog = ({
   open,
   onOpenChange,
   imageUrl,
   onSubmit,
   isLoading,
 }: ImageEditDialogProps) => {
   const [instruction, setInstruction] = useState("");
 
   const handleSubmit = () => {
     if (instruction.trim()) {
       onSubmit(instruction.trim());
       setInstruction("");
     }
   };
 
   return (
     <Dialog open={open} onOpenChange={onOpenChange}>
       <DialogContent className="sm:max-w-lg">
         <DialogHeader>
           <DialogTitle>Edit Image</DialogTitle>
         </DialogHeader>
         <div className="space-y-4">
           <img
             src={imageUrl}
             alt="Image to edit"
             className="w-full max-h-64 object-contain rounded-lg border border-border"
           />
           <Textarea
             placeholder="Describe how you want to edit this image... (e.g., 'make it darker', 'add snow', 'change to sunset')"
             value={instruction}
             onChange={(e) => setInstruction(e.target.value)}
             className="min-h-[80px]"
             disabled={isLoading}
           />
         </div>
         <DialogFooter>
           <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
             Cancel
           </Button>
           <Button onClick={handleSubmit} disabled={!instruction.trim() || isLoading}>
             {isLoading ? (
               <>
                 <Loader2 className="h-4 w-4 animate-spin" />
                 Editing...
               </>
             ) : (
               "Apply Edit"
             )}
           </Button>
         </DialogFooter>
       </DialogContent>
     </Dialog>
   );
 };