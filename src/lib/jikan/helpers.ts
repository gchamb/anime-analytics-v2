import Jikan from ".";
import { Sections } from "../types";
import { JikanResponse } from "./types";

const jikan = new Jikan();

export function getSection(
  sectionKey: keyof typeof Sections,
  page: number
): Promise<JikanResponse> {
  const section = Sections[sectionKey];
  return jikan.getTopAnimes("tv", section, page);
}
