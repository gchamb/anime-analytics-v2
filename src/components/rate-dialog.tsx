import Ratings, { Rating, ratingSchema } from "./ui/ratings";

import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

type RateDialogProps = {
	open: boolean;
	animeName: string;
	onClose: () => void;
	onSubmit: (rate: Rating, date: Date) => void;
};

export default function RateDialog({ open, animeName, onClose, onSubmit }: RateDialogProps) {
	const [hideCalendar, setHideCalendar] = useState(true);
	const [date, setDate] = useState<Date | undefined>(new Date());
	const [rate, setRate] = useState<Rating>(0);
	const [error, setError] = useState("");

	return (
		<Dialog
			open={open}
			onOpenChange={(open) => {
				if (!open) {
					onClose();
				}
			}}
		>
			<DialogContent showX>
				<DialogHeader>
					<DialogTitle className="text-center">Rate {animeName}</DialogTitle>
				</DialogHeader>
				<div className="flex flex-col items-center gap-2">
					{error && <span className="text-center text-red-800 font-bold text-sm">{error}</span>}
					<Ratings onRatingChanged={(rate) => setRate(rate)} size={30} />
					<div className="flex flex-col gap-2">
						{!hideCalendar && (
							<Calendar
								mode="single"
								selected={date}
								onSelect={(selectedDate) => {
									setHideCalendar(true);
									setDate(selectedDate);
								}}
								toDate={new Date()}
								initialFocus
							/>
						)}
						<Button variant="outline" onClick={() => setHideCalendar(!hideCalendar)}>
							<CalendarIcon className="mr-2 h-4 w-4" />
							{date ? format(date, "PPP") : <span>Pick a date</span>}
						</Button>
					</div>

					<Button
						variant="subtle"
						onClick={() => {
							// error check
							const parsedRating = ratingSchema.safeParse(rate);
							const parsedDate = z.date().safeParse(date);

							if (!parsedRating.success) {
								setError("You must submit a valid rate.");
								return;
							}

							if (!parsedDate.success) {
								setError("You must submit a date.");
								return;
							}

							// lift rate object
							onSubmit(rate, date!);
						}}
					>
						Save
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
