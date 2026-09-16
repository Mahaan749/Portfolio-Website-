"use client";

import React from "react";
import SmoothScroll from "@/components/smooth-scroll";
import AnimatedBackground from "@/components/animated-background";
import { cn } from "@/lib/utils";
import SkillsSection from "@/components/sections/skills";
import ExperienceSection from "@/components/sections/experience";
import ProjectsSection from "@/components/sections/projects";
import ContactSection from "@/components/sections/contact";
import HeroSection from "@/components/sections/hero";
import type { PortfolioContent } from "@/lib/portfolio-content";

function MainPage() {
  const [content, setContent] = React.useState<PortfolioContent>();
  React.useEffect(() => { fetch("/api/content").then((response) => response.ok ? response.json() : undefined).then(setContent).catch(() => undefined); }, []);
  return (
    <SmoothScroll>
      <AnimatedBackground />
      <main className={cn("relative z-20 bg-slate-100 dark:bg-transparent canvas-overlay-mode")}>
        <HeroSection />
        <SkillsSection />
        <ExperienceSection content={content} />
        <ProjectsSection content={content} />
        <ContactSection />
      </main>
    </SmoothScroll>
  );
}

export default MainPage;
