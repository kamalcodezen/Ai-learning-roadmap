"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BrainCircuit, AlertTriangle, CheckCircle2, ChevronRight, Briefcase } from "lucide-react";
import { fetchCareerAnalysis, triggerCareerAnalysis } from "@/src/lib/actions/learner/career-analysis";

export default function CareerGoalAnalysis() {
  const queryClient = useQueryClient();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["careerAnalysis"],
    queryFn: async () => {
      const res = await fetchCareerAnalysis();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await triggerCareerAnalysis();
      if (!res.success) throw new Error(res.message);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["careerAnalysis"] });
    },
  });

  const analysis = data;

  if (isLoading) {
    return (
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-red-100 dark:border-red-900/30">
        <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
          <AlertTriangle className="w-5 h-5" />
          <h3 className="font-semibold text-lg">Analysis Unavailable</h3>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-400 text-sm">
          {error instanceof Error ? error.message : "Failed to load career analysis."}
        </p>
        <button
          onClick={() => generateMutation.mutate()}
          className="mt-4 px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="mt-8 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/20 dark:to-purple-950/20 rounded-xl p-6 shadow-sm border border-indigo-100 dark:border-indigo-900/30 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg text-indigo-900 dark:text-indigo-100 flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Career Goal Analysis
          </h3>
          <p className="mt-1 text-indigo-700/80 dark:text-indigo-300/80 text-sm">
            Unlock AI-powered insights into required skills and expectations for your target role.
          </p>
        </div>
        <button
          onClick={() => generateMutation.mutate()}
          disabled={generateMutation.isPending}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {generateMutation.isPending ? "Analyzing..." : "Analyze Career Goal"}
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-indigo-500" />
            Career Intelligence: {analysis.role}
          </h3>
          <button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            <BrainCircuit className="w-3.5 h-3.5 text-indigo-500" />
            {generateMutation.isPending ? "Re-analyzing..." : "Re-analyze"}
          </button>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
          {analysis.summary}
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Core Skills</h4>
            <div className="space-y-3">
              {analysis.coreSkills.map((skill, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-750 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-gray-100 text-sm">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    {skill.name}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-6">{skill.reason}</p>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Supporting Skills</h4>
            <div className="space-y-3">
              {analysis.supportingSkills.map((skill, i) => (
                <div key={i} className="bg-gray-50 dark:bg-gray-750 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                    <ChevronRight className="w-4 h-4 text-indigo-400" />
                    {skill.name}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 ml-6">{skill.reason}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider">Practical Expectations</h4>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-300">
            {analysis.practicalCompetencies.map((comp, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-500 mt-0.5">•</span> {comp}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
