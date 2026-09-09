"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getPublicProofGraph } from "@/src/lib/api/learner/proof-graph";
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";

export default function PublicProofGraphPage() {
  const params = useParams();
  const token = params?.token as string;

  const { data, isLoading, error } = useQuery({
    queryKey: ["publicProofGraph", token],
    queryFn: () => getPublicProofGraph(token),
    enabled: !!token,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          Verifying cryptographic proof credentials...
        </div>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="max-w-md w-full p-8 rounded-2xl border border-destructive/20 bg-card text-center shadow-lg">
          <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold mb-2">Invalid Verification Link</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {(error instanceof Error ? error.message : null) || "This proof verification token does not exist or has been revoked."}
          </p>
          <Link
            href="/"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Return to AI Pather
          </Link>
        </div>
      </main>
    );
  }

  const { verifiedCandidate, primarySkill, overallProofScore, nodes } = data;
  const verifiedNodes = nodes.filter((n) => n.status === "verified");

  return (
    <main className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        {/* Verification Header */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl border border-border bg-card shadow-sm">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-500 border border-green-500/20">
              <ShieldCheck className="w-4 h-4" />
              Verified Candidate Proof Graph
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground">
              {verifiedCandidate.targetRole}
            </h1>
            <p className="text-sm text-muted-foreground">
              Target Level: <span className="font-medium text-foreground">{verifiedCandidate.experienceLevel}</span> • Competency Area: <span className="font-medium text-foreground">{primarySkill}</span>
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1 p-4 rounded-2xl bg-card-soft border border-border/80 shrink-0">
            <span className="text-xs uppercase font-semibold tracking-wider text-muted-foreground">
              Overall Proof Score
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-primary">{overallProofScore}%</span>
            </div>
            <span className="text-[11px] text-muted-foreground">
              {verifiedNodes.length} Verified Competencies
            </span>
          </div>
        </header>

        {/* Security & Authenticity Notice */}
        <section className="flex items-center gap-3 p-4 rounded-xl border border-primary/20 bg-primary/5 text-xs text-muted-foreground">
          <Lock className="w-4 h-4 text-primary shrink-0" />
          <span>
            This public verification view displays authenticated competency artifacts only. Personal identifiers, emails, and private transcripts are protected and excluded.
          </span>
        </section>

        {/* Verified Nodes Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">Verified Evidence Nodes</h2>
            <span className="text-xs text-muted-foreground">{nodes.length} Total Nodes In Graph</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {nodes.map((node) => {
              const isVerified = node.status === "verified";
              return (
                <div
                  key={node.id}
                  className={`p-5 rounded-2xl border transition-all ${
                    isVerified
                      ? "border-green-500/30 bg-card/90"
                      : "border-border/70 bg-card/50"
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      {node.type}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                        isVerified
                          ? "bg-green-500/10 text-green-500 border-green-500/20"
                          : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                      }`}
                    >
                      {isVerified ? <CheckCircle2 className="w-3 h-3" /> : null}
                      {node.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-foreground mb-1">{node.title}</h3>
                  {node.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                      {node.description}
                    </p>
                  )}

                  {typeof node.score === "number" && (
                    <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                      <span className="text-muted-foreground">Mastery Score</span>
                      <span className="font-bold text-foreground">{node.score}%</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer */}
        <footer className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-4">
          <p>© {new Date().getFullYear()} AI Pather • Cryptographic Career Verification</p>
          <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1 font-medium">
            Learn more about AI Pather verification <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
