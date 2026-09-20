import rawTracks from "./tracks.json";

export interface TrackChart {
  demandTrend: { period: string; postings: number }[];
  salaryByLevel: { level: string; salary: number }[];
  topSkills: { skill: string; demand: number }[];
  regionalDemand: { region: string; share: number }[];
}

export interface TrackHelpStep {
  title: string;
  desc: string;
}

export interface Track {
  id: string;
  title: string;
  category: string;
  icon: string;
  badge: string;
  tagline: string;
  overview: string;
  stats: {
    activePostings: number;
    postingsYoY: number;
    medianSalary: number;
    growthForecast: number;
    entryLevelShare: number;
    remoteShare: number;
  };
  charts: TrackChart;
  keySkills: string[];
  helpSteps: TrackHelpStep[];
  ctaHeadline: string;
  ctaButton: string;
}

const tracks = rawTracks.roles as Track[];

export const tracksList: Track[] = tracks;

export const getTrack = (slug: string): Track | undefined =>
  tracks.find((track) => track.id === slug);

export const trackSlugs: string[] = tracks.map((track) => track.id);

export interface TrackNavItem {
  label: string;
  href: string;
}

export const trackNavLinks: TrackNavItem[] = tracks.map((track) => ({
  label: track.title,
  href: `/tracks/${track.id}`,
}));