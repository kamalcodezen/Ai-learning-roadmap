"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import {
  FiSend,
  FiUser,
  FiMail,
  FiMessageSquare,
  FiCheckCircle,
  FiHelpCircle,
  FiZap,
  FiShield,
  FiLayers,
  FiCode,
  FiEdit3,
} from "react-icons/fi";
import { Loader2 } from "lucide-react";
import { BorderBeam } from "@/src/components/ui/border-beam";

const categories = [
  { id: "general", label: "General Inquiry", icon: FiHelpCircle },
  { id: "roadmap", label: "Roadmap & AI Engine", icon: FiZap },
  { id: "diagnostic", label: "Skill Diagnostic & Proofs", icon: FiShield },
  { id: "enterprise", label: "Enterprise & Licensing", icon: FiLayers },
  { id: "bug", label: "Bug Report & Feedback", icon: FiCode },
  { id: "other", label: "Others", icon: FiEdit3 },
];

export default function ContactFormSection() {
  const shouldReduceMotion = useReducedMotion();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    category: "general",
    customCategory: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg("");
  };

  const handleCategorySelect = (categoryId: string) => {
    setFormData((prev) => ({ ...prev, category: categoryId }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMsg("Please fill in all required fields (Name, Email, Message).");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    // Simulate reliable submission delivery
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsSuccess(true);
    } catch {
      setErrorMsg("Failed to send your message. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: "",
      email: "",
      category: "general",
      customCategory: "",
      subject: "",
      message: "",
    });
    setIsSuccess(false);
    setErrorMsg("");
  };

  return (
    <section className="relative w-full pb-20 sm:pb-24">
      {/* Glow highlight */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="global-pos px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start max-w-6xl mx-auto">
          {/* Left Column: Context & What to Expect */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 flex flex-col justify-between space-y-8"
          >
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3.5 py-1.5 backdrop-blur-md mb-4">
                <FiMessageSquare className="size-3.5 text-primary" />
                <span className="font-poppins text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                  Direct Channel
                </span>
              </div>

              <h2 className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
                Send us a direct message
              </h2>

              <p className="mt-4 font-poppins text-sm sm:text-base text-muted-foreground leading-relaxed">
                Whether you need technical support, want to inquire about custom capability frameworks, or have feedback on AI Pather&apos;s trajectory algorithms, we want to hear from you.
              </p>
            </div>

            {/* What to expect box */}
            <div className="rounded-2xl border border-border/80 bg-card/60 p-6 backdrop-blur-md space-y-4">
              <h4 className="font-poppins text-sm font-bold uppercase tracking-wider text-foreground">
                What happens after you submit?
              </h4>
              <ul className="space-y-3 font-poppins text-xs sm:text-sm text-muted-foreground">
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[11px] mt-0.5">
                    1
                  </span>
                  <span>
                    Your inquiry is automatically routed to our specialized support or engineering triage.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[11px] mt-0.5">
                    2
                  </span>
                  <span>
                    If you have an active AI Pather account, your learning context helps us diagnose faster.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/20 text-primary font-bold text-[11px] mt-0.5">
                    3
                  </span>
                  <span>
                    You will receive a detailed, human-reviewed response in your inbox within 24 hours.
                  </span>
                </li>
              </ul>
            </div>

            {/* Security Notice */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground font-poppins px-1">
              <FiShield className="size-4 text-emerald-500 shrink-0" />
              <span>We never share your email or data with third parties.</span>
            </div>
          </motion.div>

          {/* Right Column: Contact Form Card */}
          <motion.div
            initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 relative rounded-3xl border border-border/80 bg-card/80 p-6 sm:p-10 backdrop-blur-xl overflow-hidden"
          >
            <BorderBeam duration={10} size={250} />

            <AnimatePresence mode="wait">
              {isSuccess ? (
                <motion.div
                  key="success-state"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4 }}
                  className="flex flex-col items-center justify-center text-center py-12 space-y-6"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-500">
                    <FiCheckCircle className="size-10" />
                  </div>

                  <div className="space-y-2 max-w-md">
                    <h3 className="font-poppins text-2xl font-bold text-foreground">
                      Message Received!
                    </h3>
                    <p className="font-poppins text-sm text-muted-foreground leading-relaxed">
                      Thank you, <span className="font-semibold text-foreground">{formData.name}</span>. We have received your inquiry and our team will get back to you at <span className="font-semibold text-foreground">{formData.email}</span> shortly.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleReset}
                    className="btn-primary inline-flex items-center gap-2 text-sm font-semibold !text-white px-6 py-2.5 rounded-xl cursor-pointer"
                  >
                    <span>Send Another Message</span>
                  </button>
                </motion.div>
              ) : (
                <form
                  key="form-state"
                  onSubmit={handleSubmit}
                  className="space-y-6"
                >
                  {/* Category Pill Selector */}
                  <div className="space-y-3">
                    <label className="font-poppins text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Inquiry Category
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {categories.map((cat) => {
                        const isSelected = formData.category === cat.id;
                        const CatIcon = cat.icon;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleCategorySelect(cat.id)}
                            className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium transition-all cursor-pointer border ${
                              isSelected
                                ? "bg-primary text-white border-primary"
                                : "bg-card/90 text-muted-foreground border-border/80 hover:border-primary/40 hover:text-foreground"
                            }`}
                          >
                            <CatIcon className="size-3.5" />
                            <span>{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Custom Problem / Topic Input when "Others" is selected */}
                    {formData.category === "other" && (
                      <motion.div
                        initial={shouldReduceMotion ? {} : { opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-1.5 pt-1"
                      >
                        <label
                          htmlFor="contact-custom-category"
                          className="font-poppins text-xs font-medium text-foreground/90"
                        >
                          Specify Your Topic / Problem
                        </label>
                        <div className="relative">
                          <FiEdit3 className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                          <input
                            id="contact-custom-category"
                            name="customCategory"
                            type="text"
                            value={formData.customCategory}
                            onChange={handleChange}
                            placeholder="e.g. Learning path custom request, API integration, Account issue..."
                            className="w-full rounded-xl border border-border/80 bg-card/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                          />
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* Name & Email Row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-name"
                        className="font-poppins text-xs font-medium text-foreground/90"
                      >
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Jane Doe"
                          className="w-full rounded-xl border border-border/80 bg-card/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label
                        htmlFor="contact-email"
                        className="font-poppins text-xs font-medium text-foreground/90"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="jane@example.com"
                          className="w-full rounded-xl border border-border/80 bg-card/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="contact-subject"
                      className="font-poppins text-xs font-medium text-foreground/90"
                    >
                      Subject (Optional)
                    </label>
                    <input
                      id="contact-subject"
                      name="subject"
                      type="text"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Question about my Full-Stack AI Engineer Roadmap"
                      className="w-full rounded-xl border border-border/80 bg-card/60 px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                  </div>

                  {/* Message */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        htmlFor="contact-message"
                        className="font-poppins text-xs font-medium text-foreground/90"
                      >
                        Message <span className="text-red-500">*</span>
                      </label>
                      <span className="font-mono text-[11px] text-muted-foreground">
                        {formData.message.length} / 2000
                      </span>
                    </div>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={5}
                      required
                      maxLength={2000}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Describe your question, issue, or partnership inquiry in detail..."
                      className="w-full rounded-xl border border-border/80 bg-card/60 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    />
                  </div>

                  {/* Error display */}
                  {errorMsg && (
                    <p className="font-poppins text-xs font-medium text-red-500">
                      {errorMsg}
                    </p>
                  )}

                  {/* Submit Button */}
                  <div className="flex items-center justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-primary inline-flex items-center gap-2.5 text-sm font-semibold !text-white px-7 py-3 rounded-xl cursor-pointer disabled:opacity-60 transition-all"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          <span>Sending message...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <FiSend className="size-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
