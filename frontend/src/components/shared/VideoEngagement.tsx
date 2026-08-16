import Image from "next/image";

const thumbnails = [
  {
    src: "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=500&h=300&fit=crop",
    alt: "Video content creation",
  },
  {
    src: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=500&h=300&fit=crop",
    alt: "Studio recording",
  },
  {
    src: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=500&h=300&fit=crop",
    alt: "Video editing",
  },
];

export default function VideoEngagement() {
  return (
    <section className="bg-white py-20 sm:py-28 px-4">
      <div className="max-w-5xl mx-auto text-center">
        {/* Pill Label */}
        <div className="inline-flex items-center gap-2 bg-gray-100 text-text-muted text-xs font-medium px-4 py-1.5 rounded-full mb-6">
          <span>Stream</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full" />
          <span>Edit</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full" />
          <span>Amplify</span>
          <span className="w-1 h-1 bg-gray-400 rounded-full" />
          <span>Inspire</span>
        </div>

        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-dark mb-4 tracking-tight leading-tight">
          Engage Audiences
          <br />
          with Stunning Videos
        </h2>

        {/* Subtitle */}
        <p className="text-text-muted max-w-xl mx-auto mb-8 text-base sm:text-lg leading-relaxed">
          Scale your brand with video-first content. Drive views, increase engagement,
          and fuel creative growth. Our tools make it easy to grow your audience
          forward.
        </p>

        {/* Buttons */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <a
            href="#trial"
            className="bg-primary hover:bg-primary-hover text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
          >
            Start Free Trial
          </a>
          <button className="w-11 h-11 bg-dark-bg hover:bg-dark-bg-lighter text-white rounded-full flex items-center justify-center transition-colors">
            <svg
              className="w-5 h-5 ml-0.5"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>

        {/* Video Thumbnails */}
        <div className="relative">
          <div className="flex gap-4 justify-center">
            {thumbnails.map((thumb, i) => (
              <div
                key={i}
                className="relative rounded-md overflow-hidden group cursor-pointer w-[140px] sm:w-[200px] lg:w-[260px] h-[100px] sm:h-[140px] lg:h-[170px] flex-shrink-0"
              >
                <Image
                  src={thumb.src}
                  alt={thumb.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 140px, (max-width: 1024px) 200px, 260px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {i === 0 && (
                  <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-text-dark font-bold text-lg sm:text-xl px-3 py-1 rounded-sm">
                    78%
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
