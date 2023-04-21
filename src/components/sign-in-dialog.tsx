import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";

type SignInProps = {
	children: React.ReactNode;
};

export default function SignIn(props: SignInProps) {
	const [error, setError] = useState("");

	return (
		<Dialog>
			<DialogTrigger>{props.children}</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="text-center text-2xl font-bold">Sign in</DialogTitle>
				</DialogHeader>
				{error !== "" && <span className="text-red-700 text-sm font-bold text-center">{error}</span>}
				<div className="grid grid-rows-2 gap-2">
					<Button
						variant="subtle"
						onClick={async () => {
							const res = await signIn("google", { redirect: false });

							if (res === undefined) {
								return;
							}

							if (res.error !== undefined) {
								setError(res.error);
							}
						}}
					>
						Sign in with Google
					</Button>
					<Button
						variant="subtle"
						onClick={async () => {
							const res = await signIn("discord", { redirect: false });
							if (res === undefined) {
								return;
							}

							if (res.error !== undefined) {
								setError(res.error);
							}
						}}
					>
						Sign in with Discord
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
