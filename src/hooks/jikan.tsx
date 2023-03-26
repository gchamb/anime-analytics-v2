import { getSection } from "@/lib/jikan/helpers";
import { JikanResponse } from "@/lib/jikan/types";
import { isSection } from "@/lib/types";
import { AxiosError } from "axios";
import { useEffect, useState } from "react";

export type FetchHookReturn<T> = {
	loading: boolean;
	error: string;
	data: T;
};

export function useSectionAnimes(type: string | undefined, page: number): FetchHookReturn<JikanResponse | undefined> {
	const [loading, setLoading] = useState(false);
	const [data, setData] = useState<JikanResponse | undefined>();
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchAnimes = async () => {
			try {
				setLoading(true);

				if (type !== undefined) {
					// make sure the type is valid
					if (!isSection(type)) {
						throw new Error("Unacceptable anime type.");
					}

					const jikanResponse = await getSection(type, page);
					setData(jikanResponse);
					setError("");
				} else {
					throw new Error("You need an anime type.");
				}
			} catch (err) {
				if (err instanceof AxiosError || err instanceof Error) {
					setError(err.message);
				} else {
					setError(String(err));
				}
			} finally {
				setLoading(false);
			}
		};

		fetchAnimes();
	}, [page, type]);

	return { loading, error, data };
}
