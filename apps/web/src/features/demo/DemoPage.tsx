import { useTheme } from "@/providers/theme";

export function DemoPage() {
  const { theme } = useTheme();
  const videoSrc = theme === "dark" ? "/demo/demo-dark.mp4" : "/demo/demo-light.mp4";
  return (
    <section
      className="
        rounded-xl border bg-muted dark:bg-muted
        p-3 m-2 mb-4
        flex flex-col
        items-center justify-center
      "
      aria-labelledby="demo-heading"
    >
      <h1 id="demo-heading" className="sr-only">
        Demo
      </h1>

      <header className="mb-2">
        <h2 className="text-base font-semibold leading-6 text-center">
          ChatWar lets you vote for your favorite AI
        </h2>
      </header>

      <div
        className="
          w-full
          border rounded-xl bg-background
          aspect-video overflow-hidden
        "
      >
        <video
          key={videoSrc}
          autoPlay
          muted
          loop
          playsInline
          controls
          preload="metadata"
          className="w-full h-full object-cover"
          aria-label="ChatWar demo showing AI responses and voting"
        >
          <source src={videoSrc} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      </div>
    </section>
  );
}
