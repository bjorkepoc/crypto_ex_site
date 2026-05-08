"use client";

export default function XpToast({ amount, id }: { amount: number; id: string }) {
  return (
    <span
      key={id}
      className="absolute -top-2 right-0 text-xs font-bold text-th-text-accent anim-float-up pointer-events-none"
    >
      +{amount} XP
    </span>
  );
}
