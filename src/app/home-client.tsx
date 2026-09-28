"use client";

import React from "react";
import SmoothScroll from "@/components/smooth-scroll";
import { cn } from "@/lib/utils";
import AnimatedBackground from "@/components/animated-background";
import SkillsSection from "@/components/sections/skills";
import ExperienceSection from "@/components/sections/experience";
import ProjectsSection from "@/components/sections/projects";
import ContactSection from "@/components/sections/contact";
import HeroSection from "@/components/sections/hero";
import type { CmsProject, HomeSettings } from "@/lib/cms/types";
import AdminToolbar from "@/components/admin/admin-toolbar";

export default function HomeClient({ projects, settings, isAdmin }: { projects: CmsProject[]; settings: HomeSettings; isAdmin: boolean }) {
  return (
    <SmoothScroll>
      {isAdmin && <AdminToolbar settings={settings} />}
      <AnimatedBackground />
      <main className={cn("bg-slate-100 dark:bg-transparent canvas-overlay-mode")}>
        <HeroSection intro={settings.heroIntro} author={settings.author} subtitle={settings.heroSubtitle} />
        <SkillsSection title={settings.skillsTitle} />
        <ExperienceSection title={settings.experienceTitle} description={settings.experienceDescription} />
        <ProjectsSection managedProjects={projects} title={settings.projectsTitle} isAdmin={isAdmin} />
        <ContactSection title={settings.contactTitle} />
      </main>
    </SmoothScroll>
  );
}
