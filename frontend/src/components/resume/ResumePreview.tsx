"use client";

import React from "react";
import {
  Printer,
  ExternalLink,
  Code2,
  Link2,
  Mail,
  Phone,
  MapPin,
  Globe,
  FileText,
} from "lucide-react";
import type { ResumeData } from "@/src/lib/actions/learner/resume";

interface ResumePreviewProps {
  resumeData: ResumeData;
  onPrint?: () => void;
}

export function ResumePreview({ resumeData, onPrint }: ResumePreviewProps) {
  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* ── Top Bar Controls (Hidden during print) ── */}
      <div className="print:hidden flex flex-wrap items-center justify-between gap-4 p-5 rounded-lg bg-card border border-border shadow-sm dashboard-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">ATS Recruiter Preview Sheet</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                Print & Export Ready
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Standardized single-column typography optimized for top tech ATS parsers & recruiter screens
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Export PDF</span>
          </button>
        </div>
      </div>

      {/* ── Printable Resume Sheet ── */}
      <div
        id="resume-printable-sheet"
        className="mx-auto w-full max-w-[850px] bg-card text-foreground p-8 sm:p-12 rounded-lg shadow-xl border border-border print:bg-white print:text-black print:shadow-none print:border-none print:p-0 print:m-0 print:max-w-none text-left font-sans leading-relaxed dashboard-card"
      >
        {/* Header Section */}
        <header className="border-b border-border print:border-neutral-300 pb-5 mb-6 text-center">
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground print:text-black uppercase">
            {resumeData.fullName || "Candidate Name"}
          </h1>
          <p className="text-sm sm:text-base font-bold text-primary print:text-neutral-800 mt-1">
            {resumeData.targetRole || "Software Engineer"}
          </p>

          {/* Contact Bar */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground print:text-neutral-700 mt-3">
            {resumeData.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-primary print:text-neutral-600" />
                <a href={`mailto:${resumeData.email}`} className="hover:underline">
                  {resumeData.email}
                </a>
              </span>
            )}
            {resumeData.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-primary print:text-neutral-600" />
                <span>{resumeData.phone}</span>
              </span>
            )}
            {resumeData.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-primary print:text-neutral-600" />
                <span>{resumeData.location}</span>
              </span>
            )}
            {resumeData.github && (
              <span className="flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-primary print:text-neutral-600" />
                <a
                  href={resumeData.github.startsWith("http") ? resumeData.github : `https://${resumeData.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  GitHub
                </a>
              </span>
            )}
            {resumeData.linkedin && (
              <span className="flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5 text-primary print:text-neutral-600" />
                <a
                  href={resumeData.linkedin.startsWith("http") ? resumeData.linkedin : `https://${resumeData.linkedin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  LinkedIn
                </a>
              </span>
            )}
            {resumeData.website && (
              <span className="flex items-center gap-1">
                <Globe className="w-3.5 h-3.5 text-primary print:text-neutral-600" />
                <a
                  href={resumeData.website.startsWith("http") ? resumeData.website : `https://${resumeData.website}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  Portfolio
                </a>
              </span>
            )}
          </div>
        </header>

        {/* Professional Summary */}
        {resumeData.summary && (
          <section className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-foreground print:text-black border-b border-border print:border-neutral-300 pb-1 mb-2.5">
              Professional Summary
            </h2>
            <p className="text-xs text-muted-foreground print:text-neutral-800 leading-relaxed">
              {resumeData.summary}
            </p>
          </section>
        )}

        {/* Technical Skills */}
        {resumeData.skills && resumeData.skills.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-foreground print:text-black border-b border-border print:border-neutral-300 pb-1 mb-2.5">
              Technical Skills & Proficiencies
            </h2>
            <div className="space-y-1.5 text-xs">
              {resumeData.skills.map((cat, i) => (
                <div key={i} className="flex items-start">
                  <span className="font-bold text-foreground print:text-black min-w-[150px] shrink-0">
                    {cat.category}:
                  </span>
                  <span className="text-muted-foreground print:text-neutral-800">
                    {Array.isArray(cat.items) ? cat.items.join(" • ") : String(cat.items)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Professional Experience */}
        {resumeData.experience && resumeData.experience.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-foreground print:text-black border-b border-border print:border-neutral-300 pb-1 mb-3">
              Work Experience
            </h2>
            <div className="space-y-4">
              {resumeData.experience.map((exp, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                    <div>
                      <span className="font-bold text-foreground print:text-black">{exp.role}</span>
                      <span className="text-muted-foreground print:text-neutral-700"> — {exp.company}</span>
                    </div>
                    <div className="text-muted-foreground print:text-neutral-600 font-medium text-[11px]">
                      {exp.duration} {exp.location ? `• ${exp.location}` : ""}
                    </div>
                  </div>

                  <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-muted-foreground print:text-neutral-800">
                    {exp.bullets.map((b, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {resumeData.projects && resumeData.projects.length > 0 && (
          <section className="mb-6">
            <h2 className="text-xs font-black uppercase tracking-wider text-foreground print:text-black border-b border-border print:border-neutral-300 pb-1 mb-3">
              Key Engineering Projects
            </h2>
            <div className="space-y-4">
              {resumeData.projects.map((proj, i) => (
                <div key={i} className="space-y-1.5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground print:text-black">{proj.title}</span>
                      {proj.techStack && proj.techStack.length > 0 && (
                        <span className="text-[11px] text-muted-foreground print:text-neutral-600">
                          | {Array.isArray(proj.techStack) ? proj.techStack.join(", ") : String(proj.techStack)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2.5 text-[11px] text-muted-foreground print:text-neutral-600">
                      {proj.liveUrl && (
                        <a
                          href={proj.liveUrl.startsWith("http") ? proj.liveUrl : `https://${proj.liveUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-0.5 text-primary print:text-black"
                        >
                          Live Demo <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                      {proj.githubUrl && (
                        <a
                          href={proj.githubUrl.startsWith("http") ? proj.githubUrl : `https://${proj.githubUrl}`}
                          target="_blank"
                          rel="noreferrer"
                          className="hover:underline flex items-center gap-0.5 text-primary print:text-black"
                        >
                          GitHub <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </div>

                  {proj.description && (
                    <p className="text-[11px] text-muted-foreground print:text-neutral-700 italic">
                      {proj.description}
                    </p>
                  )}

                  <ul className="list-disc list-outside pl-4 space-y-1 text-xs text-muted-foreground print:text-neutral-800">
                    {proj.bullets.map((b, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Certifications */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {resumeData.education && resumeData.education.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground print:text-black border-b border-border print:border-neutral-300 pb-1 mb-2.5">
                Education
              </h2>
              <div className="space-y-2">
                {resumeData.education.map((edu, i) => (
                  <div key={i} className="text-xs">
                    <p className="font-bold text-foreground print:text-black">{edu.degree}</p>
                    <p className="text-muted-foreground print:text-neutral-700">{edu.institution} ({edu.year})</p>
                    {edu.gpa && <p className="text-[11px] text-muted-foreground print:text-neutral-600">GPA: {edu.gpa}</p>}
                  </div>
                ))}
              </div>
            </section>
          )}

          {resumeData.certifications && resumeData.certifications.length > 0 && (
            <section>
              <h2 className="text-xs font-black uppercase tracking-wider text-foreground print:text-black border-b border-border print:border-neutral-300 pb-1 mb-2.5">
                Certifications
              </h2>
              <div className="space-y-2">
                {resumeData.certifications.map((cert, i) => (
                  <div key={i} className="text-xs">
                    <p className="font-bold text-foreground print:text-black">{cert.name}</p>
                    <p className="text-muted-foreground print:text-neutral-700">{cert.issuer} • {cert.year}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
