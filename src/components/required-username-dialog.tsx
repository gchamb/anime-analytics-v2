"use client";
import useSWRMutation from "swr/mutation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { isValidUsername } from "../lib/types/validators";
import { Loader2 } from "lucide-react";

async function updateUsername(url: string, { arg }: { arg: string }) {
  return fetch(url, {
    method: "POST",
    body: JSON.stringify({ username: arg }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default function UsernameDialog() {
  const [open, setOpen] = useState(true);
  const { trigger, isMutating } = useSWRMutation(
    "/api/user/username",
    updateUsername
  );
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const checkUsername = async () => {
    const isValid = isValidUsername(username.trim());
    if (!isValid.valid) {
      setError(isValid.reason);
      return;
    }

    // make api request to save username
    const response = await trigger(username.trim());
    if (response !== undefined) {
      if (!response.ok) {
        const { error } = (await response.json()) as { error: string };
        setError(error);
      } else {
        setOpen(false);
        window.location.reload();
      }
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-white">
            Finish Onboarding
          </DialogTitle>
          <DialogDescription className="text-center text-white">
            To finish your account creation please give yourself a username.
          </DialogDescription>
        </DialogHeader>
        {error !== "" && (
          <span className="text-red-700 text-sm font-bold text-center">
            {error}
          </span>
        )}
        <div className="grid grid-rows-2 gap-2">
          <Input
            autoFocus
            className="text-center text-lg font-semibold text-white"
            placeholder="Kaneki Ken"
            maxLength={15}
            minLength={3}
            value={username}
            onChange={(e) => setUsername(e.currentTarget.value)}
          />
          <Button
            disabled={username === "" || isMutating}
            variant="subtle"
            onClick={checkUsername}
          >
            {isMutating && <Loader2 className="animate-spin" />}
            Save Username
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
