import { EXPERIENCE, SkillNames, SKILLS } from "@/data/constants";
import { SectionHeader } from "./section-header";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";
import SectionWrapper from "../ui/section-wrapper";
import { motion } from "motion/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, BookOpen, GraduationCap, Pencil } from "lucide-react";
import type { HomeSettings } from "@/lib/cms/types";

const ExperienceSection = ({ settings, isAdmin = false }: { settings: HomeSettings; isAdmin?: boolean }) => {
  return (
    <SectionWrapper className="flex min-h-screen flex-col items-center justify-center py-24">
      <div className="w-full max-w-6xl px-4 md:px-8 mx-auto">
        <SectionHeader
          id="experience"
          title={settings.experienceTitle}
          desc={settings.experienceDescription}
          className="static mb-12"
        />
        {isAdmin && <button onClick={() => window.dispatchEvent(new Event("open-homepage-editor"))} className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/40 bg-background/90 px-4 py-2 text-sm font-semibold text-primary"><Pencil className="size-4"/> Edit learning section</button>}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="md:col-span-2 border-primary/20 bg-card/80 backdrop-blur-md">
            <CardHeader><GraduationCap className="text-primary"/><p className="font-mono text-xs uppercase tracking-[.2em] text-primary">{settings.educationLabel}</p><CardTitle className="text-2xl md:text-3xl">{settings.educationTitle}</CardTitle></CardHeader>
            <CardContent className="space-y-2 text-muted-foreground"><p>{settings.educationInstitution}</p><p>{settings.educationPeriod}</p></CardContent>
          </Card>
          <Card className="border-primary/20 bg-card/80 backdrop-blur-md">
            <CardHeader><Award className="text-primary"/><p className="font-mono text-xs uppercase tracking-[.2em] text-primary">{settings.certificationsTitle}</p></CardHeader>
            <CardContent><ul className="space-y-3 text-sm text-muted-foreground">{settings.certifications.map(item => <li key={item} className="flex gap-3"><span className="text-primary">•</span>{item}</li>)}</ul></CardContent>
          </Card>
          <Card className="border-primary/20 bg-card/80 backdrop-blur-md">
            <CardHeader><BookOpen className="text-primary"/><p className="font-mono text-xs uppercase tracking-[.2em] text-primary">{settings.topicsTitle}</p></CardHeader>
            <CardContent><ul className="space-y-3 text-sm text-muted-foreground">{settings.topics.map(item => <li key={item} className="flex gap-3"><span className="text-primary">•</span>{item}</li>)}</ul></CardContent>
          </Card>
        </div>
      </div>
    </SectionWrapper>
  );
};

const ExperienceCard = ({
  experience,
  index,
}: {
  experience: (typeof EXPERIENCE)[0];
  index: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.1,
        ease: "easeOut",
      }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <Card
        className={cn(
          "bg-card text-card-foreground border-border",
          "hover:border-primary/20 transition-colors duration-300",
          "shadow-sm hover:shadow-md"
        )}
      >
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-1">
              <CardTitle className="text-xl font-bold tracking-tight">
                {experience.title}
              </CardTitle>
              <div className="text-base font-medium text-muted-foreground">
                {experience.company}
              </div>
            </div>
            <Badge variant="secondary" className="w-fit font-mono text-xs font-normal">
              {experience.startDate} - {experience.endDate}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <ul className="list-disc list-outside ml-4 space-y-2 text-base text-muted-foreground leading-relaxed">
            {experience.description.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>

          <div className="flex flex-wrap gap-2">
            {experience.skills.map((skillName) => {
              const skill = SKILLS[skillName as SkillNames];
              return (
                <Badge
                  key={skillName}
                  variant="outline"
                  className="gap-2 text-xs font-normal bg-secondary/30 hover:bg-secondary/50 transition-colors border-transparent"
                >
                  <img
                    src={skill.icon}
                    alt={skill.label}
                    className="w-3.5 h-3.5 object-contain opacity-80"
                  />
                  {skill.label}
                </Badge>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExperienceSection;
