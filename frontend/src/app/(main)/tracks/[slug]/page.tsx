import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TrackHero from "@/src/components/tracks/TrackHero";
import TrackCharts from "@/src/components/tracks/TrackCharts";
import TrackHelp from "@/src/components/tracks/TrackHelp";
import TrackCta from "@/src/components/tracks/TrackCta";
import { getTrack, trackSlugs } from "@/src/data/tracks";

export const dynamicParams = false;

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "https://aipather.com";

const formatSalary = (value: number) =>
  `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}K`;

export function generateStaticParams() {
  return trackSlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const track = getTrack(slug);

  if (!track) {
    return { title: "Track Not Found" };
  }

  const title = `${track.title} Career Track`;
  const fullTitle = `${track.title} Career Track | AI Pather`;
  const description = `Master ${track.title} skills with AI Pather. Explore ${track.stats.activePostings.toLocaleString()}+ active job postings, ${formatSalary(
    track.stats.medianSalary,
  )} median salary, ${track.stats.growthForecast}% industry growth, personalized learning paths, and AI mock interview prep.`;
  const canonicalUrl = `${siteUrl}/tracks/${track.id}`;
  const keywords = [
    `${track.title} career`,
    `${track.title} roadmap`,
    `${track.title} salary`,
    `${track.title} skills`,
    track.category,
    ...track.keySkills,
    "AI career growth",
    "AI Pather",
  ];

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: `/tracks/${track.id}`,
    },
    robots: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: "AI Pather",
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
  };
}

export default async function TrackPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const track = getTrack(slug);

  if (!track) {
    notFound();
  }

  const pageUrl = `${siteUrl}/tracks/${track.id}`;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "AI Career Tracks",
        item: `${siteUrl}/tracks/ai-engineer`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: track.title,
        item: pageUrl,
      },
    ],
  };

  const skillsJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Most requested ${track.title} skills`,
    url: pageUrl,
    numberOfItems: track.keySkills.length,
    itemListElement: track.keySkills.map((skill, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: skill,
    })),
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: track.helpSteps.map((step) => ({
      "@type": "Question",
      name: `${step.title}?`,
      acceptedAnswer: {
        "@type": "Answer",
        text: step.desc,
      },
    })),
  };

  return (
    <div className="min-h-screen w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(skillsJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <TrackHero track={track} />
      <TrackCharts track={track} />
      <TrackHelp track={track} />
      <TrackCta track={track} />
    </div>
  );
}