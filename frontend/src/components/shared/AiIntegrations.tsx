const integrations = [
  { name: "ChatGPT", color: "bg-emerald-100 text-emerald-700" },
  { name: "Gemini", color: "bg-blue-100 text-blue-700" },
  { name: "Claude", color: "bg-amber-100 text-amber-700" },
  { name: "Midjourney", color: "bg-purple-100 text-purple-700" },
  { name: "Whisper", color: "bg-rose-100 text-rose-700" },
  { name: "Stable Diffusion", color: "bg-indigo-100 text-indigo-700" },
  { name: "ElevenLabs", color: "bg-cyan-100 text-cyan-700" },
  { name: "RunwayML", color: "bg-pink-100 text-pink-700" },
];

export default function AiIntegrations() {
  return (
    <section className="bg-white py-20 sm:py-28 px-4">
      <div className="max-w-5xl mx-auto text-center">
        {/* Heading */}
        <h2 className="text-3xl sm:text-4xl font-bold text-text-dark mb-4 tracking-tight leading-tight">
          Power Up Your Content
          <br />
          with AI Integrations
        </h2>

        {/* Subtitle */}
        <p className="text-text-muted max-w-xl mx-auto mb-8 text-base leading-relaxed">
          Seamlessly connect to the most powerful AI tools. Create, edit, and optimize
          your content with integrations that supercharge your workflow.
        </p>

        {/* Button */}
        <a
          href="#integrations"
          className="inline-flex items-center gap-2 bg-accent-green hover:bg-accent-green-hover text-white font-medium text-sm px-6 py-2.5 rounded-full transition-colors mb-14"
        >
          Explore All
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

        {/* Integration Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {integrations.map((item, i) => (
            <div
              key={i}
              className="group rounded-sm border border-border-light bg-white p-5 hover:shadow-md hover:border-transparent transition-all duration-300 cursor-pointer"
            >
              <div
                className={`w-12 h-12 rounded-full ${item.color} flex items-center justify-center mx-auto mb-3 text-lg font-bold group-hover:scale-110 transition-transform`}
              >
                {item.name.charAt(0)}
              </div>
              <p className="text-sm font-medium text-text-dark">{item.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
