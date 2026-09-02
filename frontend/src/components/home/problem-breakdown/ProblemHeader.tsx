"use client";

export default function ProblemHeader() {
  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col items-center pb-0 text-center lg:pb-10">
      <h2 className="font-poppins text-3xl font-extrabold leading-[1.05] tracking-tight text-foreground md:text-4xl">
        Why Static Roadmaps{" "}
        <span className="text-brand">
          Break Down
        </span>
      </h2>
      <p className="section-description mt-4 max-w-[95%] px-4 font-poppins text-lg text-muted-foreground md:max-w-xl">
        Completing lessons is not the same as becoming job-ready.
      </p>
    </div>
  );
}
