import AnimeCover from "@/components/anime-cover";
import Chip from "@/components/ui/chip";
import ListButton from "@/components/ui/list-button";
import Ratings from "@/components/ui/ratings";

import { jikan } from "@/lib/jikan";
import { getGenres } from "@/lib/utils";
import { cache } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { Metadata, ResolvingMetadata } from "next";

export async function generateMetadata(
  { params }: { params: { id: string } },
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { data } = await fetchAnime(parseInt(params.id));

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: data.title,
    openGraph: {
      description: data.synopsis ?? "",
      images: [data.images.jpg.image_url, ...previousImages],
    },
    twitter: {
      description: data.synopsis ?? "",
      images: [data.images.jpg.image_url, ...previousImages],
    },
  };
}

const fetchAnime = cache((malId: number) => {
  return jikan.getAnime(malId);
});

export default async function Anime({ params }: { params: { id: string } }) {
  if (params === undefined) {
    return (
      <div className="flex justify-center items-center w-full h-4/5">
        <h1 className="text-2xl font-semibold">Invalid Request.</h1>
      </div>
    );
  }

  const malId = Number(params.id);
  if (isNaN(malId) || (!isNaN(malId) && malId < 1)) {
    return (
      <div className="flex justify-center items-center w-full h-4/5">
        <h1 className="text-2xl font-semibold">Invalid Request.</h1>
      </div>
    );
  }

  const session = await getServerSession(authOptions);

  const { data: anime } = await fetchAnime(malId);

  const configureRating = () => {
    const rating = anime.score ? Math.floor(anime.score / 2) : 0;
    if (rating > 5 || rating < 0) {
      return 0;
    }

    return rating;
  };

  return (
    <>
      <div className="w-11/12 h-max m-auto flex flex-col items-center pt-3 gap-5 lg:flex-row">
        <div className="flex flex-col gap-y-4 items-center text-center lg:w-1/2 lg:m-auto">
          <div className="w-[200px] xl:w-[250px]">
            <AnimeCover
              image={anime.images.webp.image_url}
              name={anime.title}
              animeView
            />
          </div>

          {anime.score !== null && (
            <div>
              <h3>Community Rating</h3>
              <Ratings value={configureRating()} readOnly size={25} />
            </div>
          )}

          {session && <ListButton anime={anime} />}

          <div className="grid grid-flow-col auto-cols-fr justify-between gap-2">
            {getGenres(anime).length > 0 && (
              <div className="flex flex-col items-center">
                <h4>Genres</h4>
                <div className="flex gap-1 flex-wrap justify-center">
                  {getGenres(anime).map((genre, idx) => {
                    return <Chip size="sm" key={idx} text={genre} />;
                  })}
                </div>
              </div>
            )}

            {anime.studios.length > 0 && (
              <div>
                <h4>Studios</h4>
                <div className="flex gap-1 flex-wrap justify-center">
                  {anime.studios.map((studio, idx) => {
                    return <Chip size="sm" key={idx} text={studio.name} />;
                  })}
                </div>
              </div>
            )}

            <div>
              <h4>Aired In</h4>
              <div className="flex gap-1 flex-wrap justify-center">
                <Chip size="sm" text={anime.year?.toString() ?? "N/A"} />
              </div>
            </div>
          </div>
        </div>

        <div
          className={`flex flex-col gap-y-2 text-center lg:w-1/2 lg:m-auto ${
            anime.trailer.embed_url === null && anime.synopsis === null
              ? "hidden"
              : ""
          }`}
        >
          {anime.trailer.embed_url !== null && (
            <div className="hidden aspect-video md:block">
              <iframe
                className="w-full h-full object-cover"
                src={anime.trailer.embed_url}
              />
            </div>
          )}

          {anime.synopsis !== null && (
            <div>
              <h2 className="text-2xl underline underline-offset-4">
                Synopsis
              </h2>
              <p>{anime.synopsis}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
