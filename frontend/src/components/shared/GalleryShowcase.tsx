import Image from "next/image";

const showcaseImages = [
  {
    src: "https://images.unsplash.com/photo-1549490349-8643362247b5?w=400&h=500&fit=crop",
    alt: "Full-Stack Development",
  },
  {
    src: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&h=500&fit=crop",
    alt: "AI Models",
  },
  {
    src: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=400&h=500&fit=crop",
    alt: "Cloud Infrastructure",
  },
  {
    src: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=400&h=500&fit=crop",
    alt: "Data Engineering",
  },
  {
    src: "https://images.unsplash.com/photo-1543946207-39bd91e70ca7?w=400&h=500&fit=crop",
    alt: "Autonomous Agents",
  },
];

export default function GalleryShowcase() {
  return (
    <section className="bg-gradient-to-b from-dark-bg to-dark-bg-lighter py-16 sm:py-24 px-4">
      <div className="max-w-7xl mx-auto text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-12 tracking-tight">
          Curated Visual Learning Paths
        </h2>

        <div className="flex gap-3 sm:gap-4 justify-center px-2 overflow-hidden">
          {showcaseImages.map((img, i) => (
            <div
              key={i}
              className="relative w-[120px] sm:w-[160px] lg:w-[200px] h-[160px] sm:h-[220px] lg:h-[280px] rounded-md overflow-hidden group cursor-pointer flex-shrink-0"
            >
              <Image
                src={img.src}
                alt={img.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-110"
                sizes="(max-width: 640px) 120px, (max-width: 1024px) 160px, 200px"
              />
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
