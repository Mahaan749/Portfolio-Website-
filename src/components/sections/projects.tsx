"use client";
import React from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogTrigger,
} from "../ui/responsive-dialog";
import { FloatingDock } from "../ui/floating-dock";
import { ScrollArea } from "../ui/scroll-area";
import Link from "next/link";
import { ArrowUpRight, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { HomeSettings } from "@/lib/cms/types";
import { motion } from "motion/react";

import projects, { Project } from "@/data/projects";
import { SectionHeader } from "./section-header";

import SectionWrapper from "../ui/section-wrapper";
import ScrollingPreview from "../scrolling-preview";
import type { CmsProject } from "@/lib/cms/types";
import { TypographyP } from "../ui/typography";
import InlineProjectEditor from "../admin/inline-project-editor";

const ProjectsSection = ({ managedProjects = [], title = "Projects", isAdmin = false, settings }: { managedProjects?: CmsProject[]; title?: string; isAdmin?: boolean; settings: HomeSettings }) => {
  const cmsProjects: Project[] = managedProjects.map((project) => ({
    id: project.id,
    title: project.title,
    category: project.category,
    src: project.image_url ?? "",
    screenshots: [],
    skills: { frontend: [], backend: [] },
    live: project.live_url ?? "",
    github: project.github_url ?? undefined,
    content: <TypographyP className="font-sans text-lg whitespace-pre-wrap">{project.summary}</TypographyP>,
  }));
  const allProjects = [...cmsProjects, ...projects.filter(project => !settings.hiddenProjectIds.includes(project.id))];

  return (
    <SectionWrapper id="projects" className="max-w-7xl mx-auto md:min-h-[130vh] px-4">
      <div className="relative">
        <SectionHeader id="projects" title={title} />
        {isAdmin && <div className="pointer-events-auto absolute right-0 top-0 z-40"><InlineProjectEditor /></div>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {allProjects.map((project) => (
          <ProjectCard key={project.id} project={project} managedProject={managedProjects.find(item => item.id === project.id)} isAdmin={isAdmin} settings={settings} />
        ))}
      </div>
    </SectionWrapper>
  );
};

const ProjectCard = ({ project, managedProject, isAdmin, settings }: { project: Project; managedProject?: CmsProject; isAdmin?: boolean; settings: HomeSettings }) => {
  const router = useRouter();
  async function hideBuiltInProject(event: React.MouseEvent) {
    event.preventDefault(); event.stopPropagation();
    if (!window.confirm(`Remove “${project.title}” from the website?`)) return;
    const response = await fetch("/api/admin/content", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "hide-project", id: project.id }) });
    const result = await response.json();
    if (!response.ok) return window.alert(result.error || "Unable to delete project.");
    router.refresh();
  }
  return (
    <div className="relative flex items-center justify-center">
      {isAdmin && managedProject && <div className="pointer-events-auto absolute right-2 top-2 z-40"><InlineProjectEditor project={managedProject} /></div>}
      {isAdmin && !managedProject && <button onClick={hideBuiltInProject} className="pointer-events-auto absolute right-2 top-2 z-40 flex items-center gap-1 rounded-full border border-red-500/50 bg-background/95 px-3 py-2 text-xs font-semibold text-red-400 shadow-lg"><Trash2 className="size-3.5"/> Delete</button>}
      <ResponsiveDialog>
        <ResponsiveDialogTrigger className="bg-transparent flex justify-center w-full">
          <div
            className="group relative w-full max-w-[400px] h-auto rounded-lg overflow-hidden ring-1 ring-white/5"
            style={{ aspectRatio: "3/2" }}
          >
            {/* `src` can be any aspect ratio (tall pages pan, normal ones fit);
                the wallpaper is an optional /assets/backgrounds/<id>.jpg. */}
            {project.src && (
              <ScrollingPreview
                src={project.src}
                alt={project.title}
                bg={`/assets/backgrounds/${project.id}.jpg`}
              />
            )}
            <div className="absolute w-full h-24 bottom-0 left-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-10">
              <div className="flex flex-col h-full items-start justify-end p-4">
                <div className="text-lg text-left [text-shadow:0_1px_4px_rgba(0,0,0,0.6)]">
                  {project.title}
                </div>
                <div className="text-xs bg-primary text-primary-foreground rounded-lg w-fit px-2">
                  {project.category}
                </div>
              </div>
            </div>
          </div>
        </ResponsiveDialogTrigger>

        <ResponsiveDialogContent className="md:max-w-4xl md:h-[85vh] md:!flex md:flex-col md:overflow-hidden md:p-0 md:gap-0">
          {/* Sticky header */}
          <div className="shrink-0 border-b border-border bg-background/80 backdrop-blur-sm px-8 py-5">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <h4 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight truncate">
                  {project.title}
                </h4>
                <span className="shrink-0 text-[11px] uppercase tracking-widest text-muted-foreground border border-border rounded-full px-3 py-0.5">
                  {project.category}
                </span>
              </div>
              <div className="shrink-0 flex items-center gap-4">
                {project.github && project.github !== "#" && (
                  <Link
                    href={project.github}
                    target="_blank"
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors underline underline-offset-2"
                  >
                    Source
                  </Link>
                )}
                {project.live && project.live !== "#" && (
                  <Link href={project.live} target="_blank">
                    <button className="group flex items-center gap-2 bg-primary text-primary-foreground text-sm font-medium px-4 py-1.5 rounded-full hover:bg-primary/80 transition-colors">
                      Visit
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable content */}
          <ScrollArea className="flex-1" type="always" data-lenis-prevent>
            <div className="px-8 py-8">
              {/* Tech stack */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="flex flex-col md:flex-row gap-6 md:gap-10 mb-10"
              >
                {project.skills.frontend?.length > 0 && (
                  <div className="flex flex-col items-center md:items-start gap-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                      Frontend
                    </span>
                    <FloatingDock items={project.skills.frontend} />
                  </div>
                )}
                {project.skills.backend?.length > 0 && (
                  <div className="flex flex-col items-center md:items-start gap-2">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                      Backend
                    </span>
                    <FloatingDock items={project.skills.backend} />
                  </div>
                )}
              </motion.div>

              {/* Divider */}
              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent mb-10" />

              {/* Project content */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                {project.content}
              </motion.div>
            </div>
          </ScrollArea>

        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </div>
  );
};

export default ProjectsSection;
