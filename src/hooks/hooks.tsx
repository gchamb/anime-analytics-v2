import Jikan from "@/lib/jikan";
import { getSection } from "@/lib/jikan/helpers";
import { JikanResponse } from "@/lib/jikan/types";
import { isSection } from "@/lib/types";
import { AxiosError } from "axios";
import { useCallback, useEffect, useState } from "react";

const jikan = new Jikan();

type useAnimesReturn = {
  loading: boolean;
  error: string;
  data: JikanResponse | undefined;
};

export function useAnimes(
  query: string | undefined,
  page: number
): useAnimesReturn {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<JikanResponse | undefined>();
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnimes = async () => {
      const url = new URL(window.location.href);
      const type = url.searchParams.get("type");

      let jikanResponse: JikanResponse;
      try {
        setLoading(true);

        console.log(type);
        // if the type parameter is null then search
        if (type === null) {
          // if there's a query is provided then use it
          if (query !== undefined) {
            jikanResponse = await jikan.search(query, page);
          } else {
            jikanResponse = await jikan.search("", page);
          }
        } else {
          // make sure the type is valid
          if (!isSection(type)) {
            setError("Unavailable Anime Type.");
            return;
          }

          jikanResponse = await getSection(type, page);
        }

        setData(jikanResponse);
      } catch (err) {
        if (err instanceof AxiosError) {
          setError(err.message);
        } else {
          setError(String(err));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAnimes();
  }, [page]);

  return { loading, error, data };
}
