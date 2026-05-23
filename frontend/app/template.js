"use client";

import { motion, AnimatePresence } from "framer-motion";

export default function Template({ children }) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -20, opacity: 0 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        className="flex flex-col flex-grow"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
