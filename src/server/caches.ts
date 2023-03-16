import { JikanResponse } from "@/lib/jikan/types";
import redis from "./redis";

export async function getCachedSections(page = 1): Promise<
  | {
      airingAnimes: JikanResponse;
      popularAnimes: JikanResponse;
      upcomingAnimes: JikanResponse;
    }
  | undefined
> {
  // we only cache up to the 3 pages
  if (page > 3) {
    return;
  }

  // check if the cache is there
  const sectionsData = await redis.get(`sections-${page}`);
  if (sectionsData == null) {
    return;
  }
  // return top animes this season, top popular animes, upcoming animes
  const sections = JSON.parse(sectionsData) as {
    airingAnimes: JikanResponse;
    popularAnimes: JikanResponse;
    upcomingAnimes: JikanResponse;
  };

  return sections;
  //     } else {
  //       // check if the cache is there
  //       const sectionData = await redis.get(`${section}-${page}`);
  //       if (sectionData == null) {
  //         return;
  //       }
  //       // return the data of the section data
  //       return res.send(JSON.parse(sectionData));
  //     }
}
