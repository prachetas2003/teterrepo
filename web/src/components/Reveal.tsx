import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
export default function Reveal({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();
  return (
    <motion.div
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reduced ? 0 : 1.1, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
