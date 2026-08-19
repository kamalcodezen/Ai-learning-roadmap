

const testimonials = [
  {
    name: "Alena Zhukova",
    profession: "Software Engineer",
    description: "AI Pather is the perfect tool for building my career. It's easy to use and the Career Twin feature is amazing. I've been using it for a while now and I'm really happy with the results.",
    avatar: "https://assets.basehub.com/fa068a12/uXVXN7g1Fc2EjO8OWn0HG/09.png?width=64&quality=90&format=auto",
    image: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715881430/vercel_wordmark_dark_mhv8u8.svg",
  },
  {
    name: "Aiko",
    profession: "Design Engineer",
    description: "The Skill Proof Graph completely changed how I present myself to recruiters. No more just saying I know React, I can actually prove it with verified evidence.",
    avatar: "https://assets.basehub.com/fa068a12/uXVXN7g1Fc2EjO8OWn0HG/09.png?width=64&quality=90&format=auto",
    image: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715881430/vercel_wordmark_dark_mhv8u8.svg",
  },
  {
    name: "Kinpe Zhukova",
    profession: "Software Engineer",
    description: "Learning debt was holding me back without me even realizing it. AI Pather diagnosed my gaps and helped me unblock myself. Best career investment ever.",
    avatar: "https://assets.basehub.com/fa068a12/uXVXN7g1Fc2EjO8OWn0HG/09.png?width=64&quality=90&format=auto",
    image: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715881430/vercel_wordmark_dark_mhv8u8.svg",
  },
  {
    name: "Lisa Kemp",
    profession: "Frontend Developer",
    description: "The Job Reality Check feature saved me so much time. I knew exactly what skills I was missing for the roles I wanted, and I didn't get rejected for being unprepared.",
    avatar: "https://assets.basehub.com/fa068a12/uXVXN7g1Fc2EjO8OWn0HG/09.png?width=64&quality=90&format=auto",
    image: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715881430/vercel_wordmark_dark_mhv8u8.svg",
  },
  {
    name: "Saud",
    profession: "Game Developer",
    description: "Adaptive recovery is a game-changer. Whenever I fall behind because of a busy week, I don't feel guilty. The 4-day catch-up plan gets me right back on track.",
    avatar: "https://assets.basehub.com/fa068a12/uXVXN7g1Fc2EjO8OWn0HG/09.png?width=64&quality=90&format=auto",
    image: "https://res.cloudinary.com/dfhp33ufc/image/upload/v1715881430/vercel_wordmark_dark_mhv8u8.svg",
  },
];

const duplicatedTestimonials = [...testimonials, ...testimonials];

const TestimonialSection = () => {
  return (
    <section className="py-10 md:py-16 bg-background relative overflow-hidden border-t border-border/40">
      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 md:mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
            What our learners say
          </h2>
          <p className="mt-3 md:mt-4 max-w-xl mx-auto text-base md:text-xl text-muted-foreground">
            Join thousands of professionals who have eliminated their learning debt and built a verifiable career profile.
          </p>
        </div>

        <div
          style={{
            maskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)',
          }}
          className="flex relative overflow-hidden w-full max-w-7xl mx-auto"
        >
          <div className="flex animate-x-slider gap-5 w-max hover:pause-animation">
            {duplicatedTestimonials.map((testimonial, indx) => {
              return (
                <div 
                  key={indx} 
                  className="border flex flex-col bg-card border-border/60 rounded-xl shrink-0 grow-0 w-[65vw] sm:w-[400px] md:w-[500px] h-full shadow-sm hover:border-primary/50 transition-colors"
                >
                  <p className="px-4 py-4 sm:px-6 sm:py-6 text-sm sm:text-xl font-medium text-foreground tracking-tight flex-1">
                    &quot;{testimonial.description}&quot;
                  </p>
                  <div className="border-t border-border/40 w-full flex gap-1 overflow-hidden bg-muted/30 mt-auto rounded-b-xl">
                    <div className="w-full flex gap-2 sm:gap-4 items-center px-4 py-3 sm:px-6 sm:py-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={testimonial.avatar} alt="avatar" className="w-8 h-8 sm:w-12 sm:h-12 rounded-full object-cover border border-border" />
                      <div className="flex flex-col flex-1 justify-center">
                        <h5 className="text-sm sm:text-base font-semibold text-foreground">{testimonial.name}</h5>
                        <p className="text-xs sm:text-sm text-muted-foreground">{testimonial.profession}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex self-center pr-6">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={testimonial.image} 
                        className="h-8 w-auto brightness-0 dark:invert opacity-70" 
                        alt="company_logo" 
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
