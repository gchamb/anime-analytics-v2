"use client";
import Ratings from "./ui/ratings";

import { Calendar } from "./ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { useState } from "react";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { z } from "zod";

type RateDialogProps = {
  open: boolean;
  animeName: string;
  onClose: () => void;
  onSubmit: (rate: 0 | 1 | 2 | 3 | 4 | 5, date: Date) => void;
};

export default function RateDialog({
  open,
  animeName,
  onClose,
  onSubmit,
}: RateDialogProps) {
  const [hideCalendar, setHideCalendar] = useState(true);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [rate, setRate] = useState<0 | 1 | 2 | 3 | 4 | 5>(0);
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
          {error && (
            <span className="text-center text-red-800 font-bold text-sm">
              {error}
            </span>
          )}
          <Ratings
            onRatingChanged={(rate) => {
              if (rate > 5 || rate < 0) {
                return;
              }

              setRate(rate as 0 | 1 | 2 | 3 | 4 | 5);
            }}
            size={30}
          />
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
            <Button
              variant="outline"
              onClick={() => setHideCalendar(!hideCalendar)}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </div>

          <Button
            variant="subtle"
            onClick={() => {
              // error check
              if (rate > 5 || rate < 0) {
                setError("You must submit a valid rate.");
                return;
              }

              const parsedDate = z.date().safeParse(date);

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
