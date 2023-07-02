import { Star } from "lucide-react";
import React, { useState, useEffect } from "react";
import { z } from "zod";

type RatingsProps = {
	readOnly?: true;
	value?: Rating;
	onRatingChanged?: (rating: Rating) => void;
};

export const ratingSchema = z.union([
	z.literal(0),
	z.literal(1),
	z.literal(2),
	z.literal(3),
	z.literal(4),
	z.literal(5),
]);
export type Rating = z.infer<typeof ratingSchema>;

export default function Ratings({ readOnly, value, onRatingChanged }: RatingsProps) {
	const [rating, setRating] = useState<Rating>(value ?? 0);

	useEffect(() => {
		if (!readOnly) {
			onRatingChanged?.(rating);
		}
	}, [onRatingChanged, rating, readOnly]);

	return (
		<div className="flex gap-x-1">
			{Array.from([1, 2, 3, 4, 5]).map((num) => {
				return (
					<Star
						id={`${num}`}
						key={num}
						className="text-yellow-400"
						onMouseOver={(e) => {
							if (readOnly) {
								return;
							}

							const { id } = e.currentTarget;

							const parsedId = ratingSchema.safeParse(Number(id));
							if (!parsedId.success) {
								return;
							}

							setRating(parsedId.data);
						}}
						onMouseLeave={(e) => {
							if (readOnly) {
								return;
							}

							const { left } = e.currentTarget.getBoundingClientRect();
							if (rating === 1 && e.clientX < left) {
								setRating(0);
							}
						}}
						fill={num <= rating ? "gold" : "transparent"}
					/>
				);
			})}
		</div>
	);
}
