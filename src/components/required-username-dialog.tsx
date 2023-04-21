import useSWRMutation from "swr/mutation";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { isValidUsername } from "@/types/validators";

async function updateUsername(url: string, { arg }: { arg: string }) {
	return fetch(url, {
		method: "POST",
		body: JSON.stringify({ username: arg }),
		headers: {
			"Content-Type": "application/json",
		},
	});
}

export default function UsernameDialog(props: { open: boolean; onClose: () => void }) {
	const { trigger, error: mutateError, data } = useSWRMutation("/api/user/username", updateUsername);
	const [username, setUsername] = useState("");
	const [error, setError] = useState("");

	const checkUsername = async () => {
		const isValid = isValidUsername(username.trim());
		if (!isValid.valid) {
			setError(isValid.reason);
			return;
		}

		// make api request to save username
		await trigger(username.trim());
	};

	useEffect(() => {
		const checkForErrors = async () => {
			// check the errors
			if (data !== undefined) {
				if (!data.ok) {
					const { error } = (await data.json()) as { error: string };
					setError(error);
				} else {
					props.onClose();
				}
			}

			if (mutateError !== undefined) {
				setError(mutateError instanceof Error ? mutateError.message : String(mutateError));
			}
		};

		checkForErrors();
	}, [mutateError, data]);

	return (
		<Dialog open={props.open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-center text-2xl font-bold">Finish Onboarding</DialogTitle>
					<DialogDescription className="text-center">
						To finish your account creation please give yourself a username.
					</DialogDescription>
				</DialogHeader>
				{error !== "" && <span className="text-red-700 text-sm font-bold text-center">{error}</span>}
				<div className="grid grid-rows-2 gap-2">
					<Input
						autoFocus
						className="text-center text-lg font-semibold"
						placeholder="Kaneki Ken"
						maxLength={15}
						minLength={3}
						value={username}
						onChange={(e) => setUsername(e.currentTarget.value)}
					/>
					<Button disabled={username === ""} variant="subtle" onClick={checkUsername}>
						Save Username
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
