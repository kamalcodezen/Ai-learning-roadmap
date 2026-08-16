export default function CtaSection() {
  return (
    <section className="bg-white py-12 sm:py-16 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="bg-gradient-to-br from-dark-bg to-dark-bg-lighter rounded-md p-10 sm:p-16 text-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-accent-green/5 rounded-full translate-x-1/3 translate-y-1/3" />

          <div className="relative z-10">
            {/* Heading */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight leading-tight">
              <span className="text-primary">Automate</span> Smarter
              <br />
              Work Faster 🚀
            </h2>

            {/* Subtitle */}
            <p className="text-gray-400 max-w-md mx-auto mb-8 text-base leading-relaxed">
              Join growing teams who use BrightHub to streamline content creation,
              boost engagement, and scale faster than ever.
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <a
                href="#demo"
                className="inline-flex items-center gap-2.5 bg-white/10 hover:bg-white/15 border border-white/20 text-white font-medium text-sm px-6 py-3 rounded-full transition-colors backdrop-blur-sm"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15.91 11.672a.375.375 0 010 .656l-5.603 3.113a.375.375 0 01-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112z"
                  />
                </svg>
                Watch Demo
              </a>

              {/* Play circle */}
              <button className="w-12 h-12 bg-white text-dark-bg rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg">
                <svg
                  className="w-5 h-5 ml-0.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>

              <a
                href="#pricing"
                className="inline-flex items-center gap-2 text-gray-300 hover:text-white font-medium text-sm px-4 py-3 transition-colors"
              >
                Explore Plans
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
