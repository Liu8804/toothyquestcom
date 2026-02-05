 import { useState } from "react";
 import { motion, AnimatePresence } from "framer-motion";
 import { X, Sparkles, Users } from "lucide-react";
 import { Button } from "@/components/ui/button";
 import MascotEmotionState from "@/components/mascot/MascotEmotionState";
 import { useNavigate } from "react-router-dom";
 
 interface AdventureStartModalProps {
   isOpen: boolean;
   onClose: () => void;
 }
 
 const AdventureStartModal = ({ isOpen, onClose }: AdventureStartModalProps) => {
   const [selectedPath, setSelectedPath] = useState<"kid" | "parent" | null>(null);
   const navigate = useNavigate();
 
   const handleKidPath = () => {
     setSelectedPath("kid");
     // Navigate to guest games/stories
     setTimeout(() => {
       onClose();
       navigate("/guest");
     }, 300);
   };
 
   const handleParentPath = () => {
     setSelectedPath("parent");
     // Show signup prompt
     setTimeout(() => {
       onClose();
       window.dispatchEvent(new Event('toothyquest:openAuth'));
     }, 300);
   };
 
   if (!isOpen) return null;
 
   return (
     <AnimatePresence>
       {isOpen && (
         <motion.div
           initial={{ opacity: 0 }}
           animate={{ opacity: 1 }}
           exit={{ opacity: 0 }}
           className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-foreground/80 backdrop-blur-md"
           onClick={(e) => e.target === e.currentTarget && onClose()}
         >
           <motion.div
             initial={{ scale: 0.8, y: 50 }}
             animate={{ scale: 1, y: 0 }}
             exit={{ scale: 0.8, y: 50 }}
             transition={{ type: "spring", duration: 0.5 }}
             className="relative w-full max-w-md bg-card rounded-3xl shadow-float overflow-hidden"
           >
             {/* Close button */}
             <button
               onClick={onClose}
               className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors z-10"
             >
               <X className="w-5 h-5 text-muted-foreground" />
             </button>
 
             {/* Background gradient */}
             <div className="absolute inset-0 gradient-hero opacity-10" />
 
             {/* Content */}
             <div className="relative p-6 sm:p-8 text-center">
               {/* Mascot */}
               <motion.div
                 initial={{ scale: 0 }}
                 animate={{ scale: 1 }}
                 transition={{ type: "spring", delay: 0.1 }}
                 className="mb-4"
               >
                 <MascotEmotionState emotion="letsPlay" size="lg" />
               </motion.div>
 
               {/* Title */}
               <motion.h2
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.2 }}
                 className="font-display text-2xl sm:text-3xl font-bold text-foreground mb-2"
               >
                 Who's playing? 🎮
               </motion.h2>
 
               <motion.p
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.3 }}
                 className="text-muted-foreground mb-8"
               >
                 Choose your path to start the adventure!
               </motion.p>
 
               {/* Choice buttons */}
               <motion.div
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: 0.4 }}
                 className="grid grid-cols-2 gap-4"
               >
                 {/* Kid button */}
                 <motion.button
                   onClick={handleKidPath}
                   className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 border-2 border-primary/30 hover:border-primary/60 transition-all group"
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   <motion.span
                     className="text-5xl"
                     animate={{ rotate: [0, -10, 10, 0] }}
                     transition={{ duration: 2, repeat: Infinity }}
                   >
                     👧
                   </motion.span>
                   <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                     I'm a Kid!
                   </span>
                   <span className="text-xs text-muted-foreground">
                     Play games now
                   </span>
                 </motion.button>
 
                 {/* Parent button */}
                 <motion.button
                   onClick={handleParentPath}
                   className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-gradient-to-br from-accent/20 to-muted/20 border-2 border-accent/30 hover:border-accent/60 transition-all group"
                   whileHover={{ scale: 1.05 }}
                   whileTap={{ scale: 0.95 }}
                 >
                   <motion.span
                     className="text-5xl"
                     animate={{ scale: [1, 1.1, 1] }}
                     transition={{ duration: 2, repeat: Infinity }}
                   >
                     👨‍👩‍👧
                   </motion.span>
                   <span className="font-bold text-lg text-foreground group-hover:text-accent transition-colors">
                     I'm a Parent
                   </span>
                   <span className="text-xs text-muted-foreground">
                     Learn more & sign up
                   </span>
                 </motion.button>
               </motion.div>
 
               {/* Quick features for parents */}
               <motion.div
                 initial={{ opacity: 0 }}
                 animate={{ opacity: 1 }}
                 transition={{ delay: 0.6 }}
                 className="mt-6 flex flex-wrap justify-center gap-2 text-xs"
               >
                <span className="px-2 py-1 bg-accent/20 text-accent-foreground rounded-full font-medium">
                   ✅ Kid-Safe
                 </span>
                <span className="px-2 py-1 bg-destructive/10 text-destructive rounded-full font-medium">
                   🚫 No Ads
                 </span>
                <span className="px-2 py-1 bg-primary/10 text-primary rounded-full font-medium">
                   ⭐ Ages 3-9
                 </span>
               </motion.div>
             </div>
           </motion.div>
         </motion.div>
       )}
     </AnimatePresence>
   );
 };
 
 export default AdventureStartModal;