"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Zap,
  BarChart3,
  RefreshCw,
  Search,
  ArrowRight,
  Loader2,
  X,
  Target,
} from "lucide-react";
import {
  uploadAndScanResume,
  UploadedResumeScanResult,
} from "@/src/lib/actions/learner/resume";

interface ResumeUploadScannerProps {
  targetRole?: string;
  onScanComplete?: (result: UploadedResumeScanResult) => void;
}

export function ResumeUploadScanner({
  targetRole = "Software Engineer",
  onScanComplete,
}: ResumeUploadScannerProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [evaluatingRole, setEvaluatingRole] = useState(targetRole);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [inputMode, setInputMode] = useState<"file" | "paste">("file");
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState<string>("");
  const [scanResult, setScanResult] = useState<UploadedResumeScanResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Handle Drag & Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setErrorMessage("");
    const validExtensions = [".pdf", ".txt", ".docx", ".doc", ".md"];
    const ext = "." + file.name.split(".").pop()?.toLowerCase();
    if (!validExtensions.includes(ext)) {
      setErrorMessage("Please upload a supported resume format (.pdf, .txt, .docx, .md).");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("File size exceeds 10MB limit. Please upload a smaller file.");
      return;
    }
    setSelectedFile(file);
  };

  // Convert file and send to stateless AI scanner
  const handleStartScan = async () => {
    setErrorMessage("");
    let textContent = "";
    let base64Pdf = "";

    if (inputMode === "paste") {
      if (!pastedText.trim() || pastedText.trim().length < 30) {
        setErrorMessage("Please paste at least a few sentences of your resume text.");
        return;
      }
      textContent = pastedText.trim();
    } else {
      if (!selectedFile) {
        setErrorMessage("Please select or drop a resume file first.");
        return;
      }

      setIsScanning(true);
      setScanStep("Reading uploaded resume file...");

      try {
        if (selectedFile.name.endsWith(".txt") || selectedFile.name.endsWith(".md")) {
          textContent = await selectedFile.text();
        } else {
          // Read as Base64 data URL
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(selectedFile);
          });
          const base64Index = dataUrl.indexOf(";base64,");
          if (base64Index !== -1) {
            base64Pdf = dataUrl.substring(base64Index + 8);
          } else {
            base64Pdf = dataUrl;
          }
          // Also extract plain text snippet if available
          try {
            const raw = await selectedFile.text();
            if (raw && raw.length > 50) {
              textContent = raw.slice(0, 5000);
            }
          } catch {
            // Binary fallback
          }
        }
      } catch {
        setIsScanning(false);
        setErrorMessage("Failed to read the uploaded file. Please try again or paste text.");
        return;
      }
    }

    setIsScanning(true);
    setScanStep("Auditing ATS structure & technical keywords...");

    setTimeout(() => {
      setScanStep("Evaluating quantifiable impact & X-Y-Z metrics...");
    }, 1200);

    try {
      const response = await uploadAndScanResume({
        textContent: textContent || undefined,
        base64Pdf: base64Pdf || undefined,
        targetRole: evaluatingRole.trim() || undefined,
      });

      if (response?.data) {
        setScanResult(response.data as UploadedResumeScanResult);
        if (onScanComplete) {
          onScanComplete(response.data as UploadedResumeScanResult);
        }
      } else {
        throw new Error(response?.message || "Failed to scan resume.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Could not complete ATS scan. Please check your file and try again.";
      setErrorMessage(message);
    } finally {
      setIsScanning(false);
      setScanStep("");
    }
  };

  const handleResetScan = () => {
    setSelectedFile(null);
    setPastedText("");
    setScanResult(null);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 dashboard-card">
      {/* ── Scan Result View (Stateless Display) ── */}
      {scanResult ? (
        <div className="space-y-6">
          {/* Hero ATS Score Header */}
          <div className="p-6 sm:p-8 rounded-lg bg-card border border-border shadow-lg relative overflow-hidden dashboard-card">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 ">
              <div className="space-y-2 text-center md:text-left ">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 ">
                  <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" /> Instant ATS Audit
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border">
                    {scanResult.atsScore >= 80
                      ? "ATS Optimized • High Pass Rate"
                      : scanResult.atsScore >= 60
                      ? "Moderate • Optimization Recommended"
                      : "Needs Critical Keywords & Metrics"}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground pt-1">
                  <span>Candidate: <strong className="text-foreground">{scanResult.detectedName}</strong></span>
                  <span>•</span>
                  <span>Target Evaluated: <strong className="text-primary">{evaluatingRole}</strong></span>
                  <span>•</span>
                  <span>Detected Role: <strong className="text-foreground">{scanResult.detectedRole}</strong> ({scanResult.detectedExperienceLevel})</span>
                </div>

                <p className="text-xs text-muted-foreground pt-1 leading-relaxed">
                  {scanResult.summaryFeedback}
                </p>

                {/* Privacy Badge */}
                <div className="pt-2 text-[11px] text-muted-foreground flex items-center gap-1.5 justify-center md:justify-start">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  <span>Stateless In-Memory Scan: Your file was analyzed securely and not saved to the database.</span>
                </div>
              </div>

              {/* Glowing Score Dial */}
              <div className="flex flex-col items-center justify-center p-6 rounded-lg bg-card-soft border border-border shadow-inner min-w-[170px]">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  ATS Score
                </span>
                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-5xl font-black text-primary">
                    {scanResult.atsScore}
                  </span>
                  <span className="text-sm font-bold text-muted-foreground">%</span>
                </div>
                <button
                  type="button"
                  onClick={handleResetScan}
                  className="mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-bold transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3 h-3" />
                  <span>Scan Another File</span>
                </button>
              </div>
            </div>
          </div>

          {/* 4-Pillar Score Breakdown */}
          <div className="p-6 rounded-lg bg-card border border-border space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-primary" />
              <span>4-Pillar ATS Breakdown</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Formatting & Structure", value: scanResult.breakdown.formatting },
                { label: "Keyword & Tech Stack Match", value: scanResult.breakdown.keywords },
                { label: "Impact Verbs & Scale Metrics", value: scanResult.breakdown.impactMetrics },
                { label: "Target Role Relevance", value: scanResult.breakdown.relevance },
              ].map((pillar) => (
                <div key={pillar.label} className="p-3.5 rounded-lg bg-muted/40 border border-border space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-medium text-foreground">{pillar.label}</span>
                    <span className="font-bold text-primary">{pillar.value}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-700 rounded-full"
                      style={{ width: `${pillar.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Missing vs Matched Keywords */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Matched Keywords */}
            <div className="p-5 rounded-lg bg-card border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                <span>Detected Keywords ({scanResult.matchedKeywords.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {scanResult.matchedKeywords.length > 0 ? (
                  scanResult.matchedKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                    >
                      {kw} ✓
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">No standard technical keywords identified.</p>
                )}
              </div>
            </div>

            {/* Missing Critical Keywords */}
            <div className="p-5 rounded-lg bg-card border border-border space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-primary" />
                  <span>Missing Recommended Keywords ({scanResult.missingKeywords.length})</span>
                </h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {scanResult.missingKeywords.length > 0 ? (
                  scanResult.missingKeywords.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-muted text-foreground border border-border"
                    >
                      + {kw}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground">Excellent keyword coverage for this role.</p>
                )}
              </div>
            </div>
          </div>

          {/* Strengths & Red Flags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Strengths */}
            <div className="p-5 rounded-lg bg-card border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span>Resume Highlights</span>
              </h4>
              <ul className="space-y-2">
                {scanResult.strengths.map((s, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Red Flags */}
            <div className="p-5 rounded-lg bg-card border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <span>Potential ATS Red Flags</span>
              </h4>
              <ul className="space-y-2">
                {scanResult.redFlags.map((rf, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <span>{rf}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Actionable Recruiter Checklist */}
          {scanResult.suggestions && scanResult.suggestions.length > 0 && (
            <div className="p-6 rounded-lg bg-card border border-border space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>Recruiter Recommendations to Boost Your Score</span>
              </h4>
              <ul className="space-y-2">
                {scanResult.suggestions.map((sug, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2.5">
                    <ArrowRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{sug}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        /* ── File Upload / Dropzone View ── */
        <div className="p-6 sm:p-8 rounded-lg bg-card border border-border shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  Instant ATS Scanner
                </span>
                <span className="text-xs font-medium text-muted-foreground">
                  Stateless & Private
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-foreground">
                Upload Resume for Instant ATS Audit
              </h2>
              <p className="text-xs text-muted-foreground">
                Upload your existing resume file to instantly see your ATS score, 4-pillar breakdown, and missing keywords.
              </p>
            </div>

            {/* Input Mode Toggle */}
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted border border-border self-start sm:self-auto">
              <button
                type="button"
                onClick={() => { setInputMode("file"); setErrorMessage(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  inputMode === "file"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Upload File
              </button>
              <button
                type="button"
                onClick={() => { setInputMode("paste"); setErrorMessage(""); }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  inputMode === "paste"
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Paste Text
              </button>
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-lg bg-card-soft border border-border text-xs text-foreground flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-primary" />
                <span>{errorMessage}</span>
              </div>
              <button
                type="button"
                onClick={() => setErrorMessage("")}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Target Role Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-lg bg-card-soft border border-border">
            <div className="space-y-0.5">
              <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Target className="w-3.5 h-3.5 text-primary" /> Target Role for ATS Compatibility:
              </label>
              <p className="text-[11px] text-muted-foreground">
                ATS scoring evaluates your resume strictly against tech industry expectations for this specific role.
              </p>
            </div>
            <input
              type="text"
              value={evaluatingRole}
              onChange={(e) => setEvaluatingRole(e.target.value)}
              placeholder="e.g. Full Stack Engineer, DevOps, Frontend..."
              className="px-3.5 py-2 rounded-lg bg-background border border-border text-xs font-bold text-foreground focus:border-primary focus:outline-none w-full sm:w-64"
            />
          </div>

          {/* Mode 1: Drag & Drop File Zone */}
          {inputMode === "file" ? (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-8 sm:p-12 rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center text-center cursor-pointer ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : selectedFile
                  ? "border-primary/40 bg-card-soft"
                  : "border-border hover:border-primary/50 bg-background"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.docx,.doc,.md"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileSelected(e.target.files[0]);
                  }
                }}
                className="hidden"
              />

              {selectedFile ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                    <FileText className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-foreground">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop another to replace
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-14 h-14 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto text-primary">
                    <UploadCloud className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      Drag & Drop your resume here, or <span className="text-primary hover:underline">browse file</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Supports PDF, TXT, DOCX up to 10MB
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Mode 2: Paste Raw Resume Text */
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground block">
                Paste your resume text below:
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                rows={8}
                placeholder="Paste your resume sections, experience bullets, and skills here..."
                className="w-full p-4 rounded-lg bg-background border border-border text-xs leading-relaxed focus:border-primary focus:outline-none text-foreground"
              />
            </div>
          )}

          {/* Action Trigger Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              ⚡ Evaluates your resume against top tech company ATS screeners in real time.
            </p>

            <button
              type="button"
              onClick={handleStartScan}
              disabled={isScanning || (inputMode === "file" && !selectedFile) || (inputMode === "paste" && !pastedText.trim())}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-xs shadow-md shadow-primary/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{scanStep || "Scanning ATS Score..."}</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Scan Resume ATS Score</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
