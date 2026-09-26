'use client';

import React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';

// Common Easing Curves
export const TRANSITION_EASE = [0.22, 1, 0.36, 1] as const;

export const FADE_UP_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.08,
      duration: 0.45,
      ease: TRANSITION_EASE,
    },
  }),
};

export const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.05,
    },
  },
};

export const SCALE_IN_VARIANTS = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: TRANSITION_EASE },
  },
};

/**
 * Animated Section Wrapper with viewport scroll reveal
 */
export function MotionSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <section className={className}>{children}</section>;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: TRANSITION_EASE }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/**
 * Subtle Hover Scale Box
 */
export function MotionCard({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      whileHover={{ y: -3, transition: { duration: 0.2, ease: 'easeOut' } }}
      whileTap={{ scale: 0.99 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
