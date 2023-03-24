import AnimeResults from "@/components/anime-results";
import { useAnimes } from "@/hooks/hooks";
import { isSection } from "@/lib/types";

// import { JikanResponse } from "@/lib/jikan/types";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import { useState } from "react";
// import { useEffect, useState } from "react";

export default function Animes() {
  const [query, setQuery] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  const { loading, data, error } = useAnimes({
    query,
    page,
  });

  if (error !== "") {
    return <p>{error}</p>;
  }

  if (loading || data === undefined) {
    return <Loader2 className="w-4 h-4 animate-spin" />;
  }

  return (
    <div>
      <AnimeResults data={data.data} />
    </div>
  );
}
