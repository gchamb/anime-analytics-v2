"use client";

import { Star } from "lucide-react";
import React, { useState } from "react";

type RatingsProps = {
  readOnly?: true;
  value?: number;
  onRatingChanged?: (rating: number) => void;
  size?: number;
};

export default function Ratings({
  readOnly,
  value,
  onRatingChanged,
  size,
}: RatingsProps) {
  const [rating, setRating] = useState<number>(value ?? 0);

  return (
    <div className="flex gap-x-1">
      {Array.from([1, 2, 3, 4, 5]).map((num) => {
        return (
          <Star
            id={`${num}`}
            key={num}
            className={`text-yellow-400 ${
              size ? `w-[${size}px] md:w-[${size}px]` : "w-[16px] md:w-[20px]"
            }`}
            onMouseOver={(e) => {
              if (readOnly) {
                return;
              }

              const { id } = e.currentTarget;

              let convertedId = parseInt(id);
              if (convertedId > 5 || convertedId < 0) {
                return;
              }

              if (!readOnly) {
                onRatingChanged?.(convertedId);
              }

              setRating(convertedId);
            }}
            onMouseLeave={(e) => {
              if (readOnly) {
                return;
              }

              const { left } = e.currentTarget.getBoundingClientRect();
              if (rating === 1 && e.clientX < left) {
                setRating(0);
                if (!readOnly) {
                  onRatingChanged?.(0);
                }
              }
            }}
            fill={num <= rating ? "gold" : "transparent"}
          />
        );
      })}
    </div>
  );
}
