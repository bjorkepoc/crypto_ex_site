"use client";

interface StarRatingProps {
  stars: 0 | 1 | 2 | 3;
  size?: "sm" | "md";
}

export default function StarRating({ stars, size = "md" }: StarRatingProps) {
  const sizeClass = size === "sm" ? "text-sm" : "text-lg";
  return (
    <span className={`inline-flex gap-0.5 ${sizeClass}`} aria-label={`${stars} of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className={`inline-block ${i <= stars ? "text-th-warning anim-star-pop" : "text-th-text-faint opacity-30"}`}
          style={i <= stars ? { animationDelay: `${(i - 1) * 150}ms` } : undefined}
        >
          {i <= stars ? "\u2605" : "\u2606"}
        </span>
      ))}
    </span>
  );
}
