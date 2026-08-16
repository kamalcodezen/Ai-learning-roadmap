"use client";

import Image from "next/image";
import Link from "next/link";

interface RoadmapCard {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
}

const ROW_1: RoadmapCard[] = [
  {
    id: "r1-1",
    title: "Generative AI & LLMs",
    category: "AI & Machine Learning",
    description: "Master Transformers, fine-tuning, RLHF, and open-source models with PyTorch.",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r1-2",
    title: "Python Data Science",
    category: "Programming Language",
    description: "Deep dive into NumPy, Pandas, Scikit-Learn, and mathematical ML foundations.",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r1-3",
    title: "AI Agent Workflows",
    category: "Agentic Systems",
    description: "Build autonomous multi-agent systems, tool execution chains, and cognitive agents.",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r1-4",
    title: "Modern Full-Stack",
    category: "Full-Stack Dev",
    description: "Build reactive, full-stack AI applications with Next.js 15, React 19, and Tailwind.",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r1-5",
    title: "Neural Networks",
    category: "Neural Architectures",
    description: "Convolutional, Recurrent, and Diffusion architectures from mathematical first principles.",
    image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r1-6",
    title: "TypeScript Mastery",
    category: "Core Language",
    description: "Advanced generic type systems, AST parsing, monorepos, and enterprise patterns.",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&auto=format&fit=crop&q=80",
  },
];

const ROW_2: RoadmapCard[] = [
  {
    id: "r2-1",
    title: "Rust System Safety",
    category: "Systems Programming",
    description: "High-performance systems programming, memory safety, and async Tokio.",
    image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r2-2",
    title: "Cloud & Kubernetes",
    category: "DevOps & Cloud",
    description: "Deploy production container clusters, Terraform IaC, and CI/CD pipelines.",
    image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r2-3",
    title: "Data Engineering",
    category: "Data & Metrics",
    description: "Architect scalable Big Data pipelines using Apache Spark, Kafka, and dbt.",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r2-4",
    title: "Distributed Systems",
    category: "Engineering Architecture",
    description: "Consensus algorithms, Raft, eventual consistency, and high-availability caching.",
    image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r2-5",
    title: "Mobile App AI",
    category: "Mobile Engineering",
    description: "On-device CoreML & TensorFlow Lite models integrated with Flutter.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r2-6",
    title: "Neural Security",
    category: "Security",
    description: "Defend against prompt injection, model extraction, and jailbreak vectors.",
    image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=800&auto=format&fit=crop&q=80",
  },
];

const ROW_3: RoadmapCard[] = [
  {
    id: "r3-1",
    title: "Golang Microservices",
    category: "Backend Engineering",
    description: "Design ultra fast gRPC APIs, concurrent microservices with goroutines.",
    image: "https://images.unsplash.com/photo-1607799279861-4dd421887fb3?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r3-2",
    title: "AI Infrastructure",
    category: "AI Infrastructure",
    description: "Scale distributed GPU clusters, Kubernetes inference servers, and vector search.",
    image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r3-3",
    title: "AI Product Roadmap",
    category: "Product & Strategy",
    description: "Turn AI research into viable products with rapid prototyping and evaluation metrics.",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r3-4",
    title: "Tech Lead Growth",
    category: "Mentorship",
    description: "Engineering leadership, code review etiquette, and cross-team roadmapping.",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r3-5",
    title: "Prompt Engineering",
    category: "AI Prompting",
    description: "System prompts, dynamic few-shot routing, and automated evaluation frameworks.",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
  },
  {
    id: "r3-6",
    title: "Creative AI Coding",
    category: "Frontend Design",
    description: "WebGL shaders, generative typography, and interactive canvas canvas experiences.",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=80",
  },
];

function RoadmapCardComponent({ card }: { card: RoadmapCard }) {
  const words = card.title.split(" ");

  return (
    <div className="shrink-0 pr-8 sm:pr-10">
      <div className="group relative h-[290px] sm:h-[330px] md:h-[380px] w-[390px] sm:w-[460px] md:w-[500px] shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-white/[0.12] bg-[#0c0e14] transition-all duration-300 hover:scale-[1.02]">
        {/* Background Image */}
        <Image
          src={card.image}
          alt={card.title}
          fill
          sizes="500px"
          className="object-cover transition-transform duration-500 group-hover:scale-108"
        />

        {/* Pure White Inner Glow & Bezel Highlight */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl shadow-[inset_0_0_20px_rgba(255,255,255,0.22),inset_0_1px_4px_rgba(255,255,255,0.5),inset_0_0_40px_rgba(0,0,0,0.85)] z-20" />

        {/* Dark gradient backdrop */}
        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/25 transition-colors duration-300 z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent z-10" />

        {/* ── Resting State: Title with font-weight 400, Left-Aligned, Vertically Justified Center ── */}
        <div className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-center items-start z-20 transition-opacity duration-300 group-hover:opacity-0">
          <div className="flex flex-col gap-0.5">
            {words.map((word, i) => (
              <span
                key={i}
                className="text-3xl sm:text-4xl md:text-5xl font-normal text-white leading-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)]"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* ── Hover State: Centered 2xl Header, Base Details, sm Button with Flaticon icon ── */}
        <div className="absolute inset-0 bg-[#06080e]/92 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all duration-300 z-30 flex flex-col items-center justify-center p-6 sm:p-8 text-center">
          {/* 1. Header (2xl font-semibold with margin bottom) */}
          <h3 className="text-xl sm:text-2xl font-semibold text-white leading-snug mb-4 sm:mb-5">
            {card.title}
          </h3>

          {/* 2. Details (base size) */}
          <p className="text-sm sm:text-base text-gray-300 leading-relaxed max-w-sm">
            {card.description}
          </p>

          {/* 3. Borderless Rounded-Full Pill Button with sm text & icon */}
          <Link
            href="#generate"
            className="mt-5 rounded-full bg-white text-[#080a0f] text-sm font-semibold px-5 py-2.5 flex items-center justify-center gap-1.5 shadow-[0_4px_20px_rgba(255,255,255,0.2)] hover:bg-gray-100 transition-all duration-200"
          >
            <span className="leading-normal">Explore Path</span>
            <span className="inline-flex items-center justify-center w-3.5 h-3.5">
              <i className="fi fi-br-angle-small-right text-xs leading-none"></i>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DiagonalMarqueeSection() {
  return (
    <div className="relative w-full overflow-hidden bg-[#07080c] py-16 sm:py-24 flex flex-col items-center justify-center">
      {/* ── Background Glow & Nebula ── */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] pointer-events-none z-0"
        style={{
          background:
            "radial-gradient(circle, rgba(235,87,34,0.14) 0%, rgba(56,217,212,0.06) 40%, transparent 70%)",
          filter: "blur(90px)",
        }}
      />

      {/* ── Keyframe Animations for Diagonal Marquee ── */}
      <style jsx global>{`
        @keyframes marquee-diagonal-left {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(-50%, 0, 0);
          }
        }
        @keyframes marquee-diagonal-right {
          0% {
            transform: translate3d(-50%, 0, 0);
          }
          100% {
            transform: translate3d(0, 0, 0);
          }
        }
        .animate-diagonal-left {
          animation: marquee-diagonal-left var(--speed, 80s) linear infinite;
        }
        .animate-diagonal-right {
          animation: marquee-diagonal-right var(--speed, 70s) linear infinite;
        }
      `}</style>

      {/* ── Section Header ── */}
      <div className="relative z-20 max-w-4xl mx-auto px-4 text-center mb-14 sm:mb-20">
        <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.15]">
          Explore 50+ Curated <br className="hidden sm:inline" />
          Interactive Learning Roadmaps
        </h2>

        <p className="mt-4 text-gray-400 text-xs sm:text-sm md:text-base max-w-7xl mx-auto leading-relaxed">
          Learn the best AI frameworks, system architectures, programming languages
          with structured paths generated by AI.
        </p>
      </div>

      {/* ── Diagonal Angled Marquee Container ── */}
      <div className="relative w-full h-[750px] sm:h-[900px] md:h-[1050px] overflow-hidden flex items-center justify-center">
        {/* Rotated Canvas Wrapper (-20deg angle) */}
        <div
          className="absolute z-10 flex w-[260vw] flex-col gap-8 sm:gap-10 cursor-grab active:cursor-grabbing"
          style={{ transform: "rotate(-20deg)" }}
        >
          {/* ── Row 1: Marquee Left ── */}
          <div className="flex w-full overflow-hidden">
            <div
              className="flex shrink-0 hover:[animation-play-state:paused] animate-diagonal-left"
              style={{ "--speed": "80s" } as React.CSSProperties}
            >
              {[...ROW_1, ...ROW_1].map((card, idx) => (
                <RoadmapCardComponent
                  key={`${card.id}-${idx}`}
                  card={card}
                />
              ))}
            </div>
          </div>

          {/* ── Row 2: Marquee Right ── */}
          <div className="flex w-full overflow-hidden">
            <div
              className="flex shrink-0 hover:[animation-play-state:paused] animate-diagonal-right"
              style={{ "--speed": "70s" } as React.CSSProperties}
            >
              {[...ROW_2, ...ROW_2].map((card, idx) => (
                <RoadmapCardComponent
                  key={`${card.id}-${idx}`}
                  card={card}
                />
              ))}
            </div>
          </div>

          {/* ── Row 3: Marquee Left ── */}
          <div className="flex w-full overflow-hidden">
            <div
              className="flex shrink-0 hover:[animation-play-state:paused] animate-diagonal-left"
              style={{ "--speed": "90s" } as React.CSSProperties}
            >
              {[...ROW_3, ...ROW_3].map((card, idx) => (
                <RoadmapCardComponent
                  key={`${card.id}-${idx}`}
                  card={card}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ── Top & Bottom Atmospheric Gradient Masks ── */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-40 bg-gradient-to-b from-[#07080c] via-[#07080c]/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-40 bg-gradient-to-t from-[#07080c] via-[#07080c]/80 to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 w-28 bg-gradient-to-r from-[#07080c] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 w-28 bg-gradient-to-l from-[#07080c] to-transparent" />
      </div>
    </div>
  );
}
