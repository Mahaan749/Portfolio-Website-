"use client";

import { motion } from "motion/react";

import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface BlurIntProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  variant?: {
    hidden: { filter: string; opacity: number };
    visible: { filter: string; opacity: number };
  };
  duration?: number;
}
export const BlurIn = ({
  children,
  className,
  variant,
  delay = 0,
  duration = 1,
}: BlurIntProps) => {
  return <div className={cn(className)}>{children}</div>;
};

interface BoxRevealProps {
  children: React.JSX.Element;
  width?: "fit-content" | "100%";
  boxColor?: string;
  duration?: number;
  delay?: number;
  once?: boolean;
}
export const BoxReveal = ({
  children,
  width = "fit-content",
  boxColor,
  duration,
  delay,
  once = true,
}: BoxRevealProps) => {
  return <div style={{ width }}>{children}</div>;
};

interface RevealAnimationProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export default function RevealAnimation({
  children,
  delay = 0,
  duration = 0.5,
  className,
}: RevealAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
