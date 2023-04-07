import axios, { AxiosInstance } from "axios";
import { JikanAnime, JikanAnimeGenres, JikanDays, JikanGenresMap, JikanOption, JikanResponse, JikanStatus } from "./types";

export default class Jikan {
  private readonly instance: AxiosInstance;
  constructor() {
    this.instance = axios.create({
      baseURL: "https://api.jikan.moe/v4",
      timeout: 5000,
      timeoutErrorMessage: "Jikan Request took too long!",
    });
  }

  async getTopAnimes(
    type: JikanOption["type"],
    filter: JikanOption["filter"],
    page = 1
  ): Promise<JikanResponse> {
    return (
      await this.instance.get(
        `/top/anime?type=${type}&filter=${filter}&page=${page}`
      )
    ).data;
  }
  async getAnimesByDay(day: JikanDays, page = 1): Promise<JikanResponse> {
    return (await this.instance.get(`/schedules?filter=${day}&page=${page}`))
      .data;
  }

  async search(q: string, status: JikanStatus | undefined, genres: JikanAnimeGenres[], page = 1): Promise<JikanResponse> {
    return (
      await this.instance.get(
        `/anime?q=${q.split(" ").join("+")}${status !== undefined ? `&status=${status}` : ''}&genres=${genres.map(genre => JikanGenresMap[genre]).join(',')}&page=${page}&sfw=true`
      )
    ).data;
  }

  async getAnime(mal_id: number): Promise<{ data: JikanAnime }> {
    return (await this.instance.get(`/anime/${mal_id}`)).data;
  }
}
