"use client";

type Props = {
  progress?: number; // 0–100
};

export default function OverallProgress({ progress = 76 }: Props) {
  const totalDots = 25;
  const filledDots = Math.round((progress / 100) * totalDots);

  return (
    <div className="w-full max-w-md mx-auto rounded-2xl p-8 shadow-sm">
      
      {/* semicircle */}
      <div className="relative h-40 flex items-end justify-center mb-6">
        <div className="absolute bottom-0 flex gap-2 flex-wrap w-full justify-center">
          {Array.from({ length: totalDots }).map((_, i) => {
            const angle = (i / (totalDots - 1)) * Math.PI;
            const radius = 140;

            const x = Math.cos(Math.PI - angle) * radius;
            const y = Math.sin(Math.PI - angle) * radius;

            const filled = i < filledDots;

            return (
              <span
                key={i}
                className={`absolute h-3 w-3 rounded-full transition ${
                  filled
                    ? "bg-orange-400"
                    : "bg-orange-200/60 dark:bg-white/10"
                }`}
                style={{
                  transform: `translate(${x}px, ${-y}px)`,
                }}
              />
            );
          })}
        </div>

        {/* center text */}
        <div className="text-center">
          <div className="text-4xl font-bold">{progress}%</div>
          <div className="text-sm dark:text-gray-400">
            Total progress
          </div>
        </div>
      </div>
    </div>
  );
}