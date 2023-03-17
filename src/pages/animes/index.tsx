import AnimeResults from "@/components/anime-results";
import { JikanResponse } from "@/lib/jikan/types";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

export default function Animes() {
	const [data, setData] = useState<JikanResponse>();

    useEffect(() => {

    },[])

	if (data === undefined) {
		return <Loader2 className="w-4 h-4 animate-spin" />;
	}

	return (
		<div>
			<AnimeResults data={data.data} />
		</div>
	);
}
