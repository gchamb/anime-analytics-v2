import { Star } from "lucide-react";
import React, { useState } from "react";

type RatingsProps = {
	readOnly?: true;
	value?: number;
};

export default function Ratings({ readOnly, value }: RatingsProps) {
	const [rating, setRating] = useState(value ?? 0);
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
							setRating(Number(id));
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
