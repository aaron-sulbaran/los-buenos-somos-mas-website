"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useSyncExternalStore, type ReactNode } from "react";

/** True only after hydration on the client; false on the server and first paint. */
function useMounted(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

/**
 * A gentle scroll-in fade and rise. The default is always the fully visible
 * content: before hydration, without JS, and under reduced-motion it renders a
 * plain element, so nothing is ever gated behind a transition that might not
 * fire. Motion only layers on once mounted on a motion-friendly client.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const reduceMotion = useReducedMotion();
  const mounted = useMounted();

  if (!mounted || reduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}
