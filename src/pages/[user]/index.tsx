import useSWR from "swr";
import useSWRMutation, { MutationFetcher } from "swr/mutation";
import Image from "next/image";
import ProfileList from "@/components/profile-list";
import ProfileAnalytics from "@/components/profile-analytics";
import AnimeCover from "@/components/anime-cover";
import { uploadFile } from "@uploadcare/upload-client";

import { z } from "zod";
import { useRouter } from "next/router";
import { ArrowRight, Edit2, Loader2 } from "lucide-react";
import { ListType, ListRowSchema } from "@/lib/types";
import { FullScreen } from "@/components/full-screen";
import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { Textarea } from "@/components/ui/text-area";

const fetcher = async (
  url: string
): Promise<{
  watch: z.infer<typeof ListRowSchema>[];
  plan: z.infer<typeof ListRowSchema>[];
  rate: z.infer<typeof ListRowSchema>[];
  bio: string | null;
  image: string | undefined;
}> => fetch(url).then((res) => res.json());

const fetcherMutation = async (
  url: string,
  { arg }: { arg: { bio?: string; image?: string } }
) => {
  return fetch(url, {
    method: "PATCH",
    body: JSON.stringify(arg),
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export default function Profile() {
  const [nowEditable, setNowEditable] = useState(false);
  const [bio, setBio] = useState<string | undefined>(undefined);
  const [image, setImage] = useState<File | undefined>(undefined);
  const [validationError, setValidationError] = useState({
    profilePicError: "",
    bioError: "",
    generalError: "",
  });
  let imageUploadRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();
  const session = useSession();
  const { user } = router.query;
  const { data, error, isLoading } = useSWR(
    user !== undefined
      ? `/api/user/profile?username=${router.query.user}`
      : null,
    fetcher
  );
  const {
    trigger,
    isMutating,
    error: profileError,
  } = useSWRMutation(
    user !== undefined
      ? `/api/user/profile?username=${router.query.user}`
      : null,
    fetcherMutation
  );

  const canSaveChanges =
    validationError.bioError === "" && validationError.profilePicError === "";

  const viewQuery = z
    .union([z.literal("list"), z.literal("analytics")])
    .optional()
    .safeParse(router.query.view);

  const viewChanger = (
    option:
      | { view: "list"; list: Exclude<ListType, "delete"> }
      | { view: "analytics" }
  ) => {
    const url = new URL(window.location.href);
    url.searchParams.set("view", option.view);

    if (option.view === "list") {
      url.searchParams.set("list", option.list);
      url.searchParams.set("page", "1");

      router.push(url);
      return;
    }

    router.push(url);
  };

  const saveChanges = async () => {
    try {
      let imageUid: string | undefined = undefined;
      if (image !== undefined) {
        // upload image
        const result = await uploadFile(image, {
          publicKey: "5bf97c741b9939d6c42e",
          store: "auto",
        });
        imageUid = result.uuid;
      }

      const response = await trigger({
        bio,
        image: imageUid,
      });

      if (!response?.ok) {
        const validRes = z
          .object({ error: z.string() })
          .safeParse(await response?.json());

        if (validRes.success) {
          throw new Error(validRes.data.error);
        }
      }

      setNowEditable(false);
    } catch (error) {
      setValidationError((prev) => {
        return {
          ...prev,
          generalError: error instanceof Error ? error.message : String(error),
        };
      });
    }
  };

  const getProfilePic = () => {
    if (image !== undefined) {
      return URL.createObjectURL(image);
    }
    if (data !== undefined && data.image !== undefined) {
      if (data.image.includes("google") || data.image.includes("discord")) {
        return data.image;
      }

      return `https://ucarecdn.com/${data.image}/`;
    }

    return "/logo.png";
  };

  const showError = (): string => {
    if (validationError.bioError !== "") {
      return validationError.bioError;
    }
    if (validationError.profilePicError !== "") {
      return validationError.profilePicError;
    }
    if (validationError.generalError !== "") {
      return validationError.generalError;
    }
    if (profileError) {
      return profileError instanceof Error
        ? profileError.message
        : String(profileError);
    }

    return "";
  };

  if (!viewQuery.success) {
    return (
      <FullScreen>
        <h1 className="text-2xl font-bold">Invalid View Query.</h1>
      </FullScreen>
    );
  }

  if (error !== undefined) {
    return (
      <FullScreen>
        <h1 className="text-2xl font-bold">
          {error instanceof Error ? error.message : String(error)}{" "}
        </h1>
      </FullScreen>
    );
  }

  if (isLoading || data === undefined) {
    return (
      <FullScreen>
        <Loader2 className="w-20 h-20 animate-spin text-aa-2 dark:text-aa-3" />
      </FullScreen>
    );
  }

  return (
    <>
      {viewQuery.data === undefined && (
        <div>
          {/* validate to make sure it is valid */}
          <h1 className="text-center text-5xl lg:hidden">
            {router.query.user}
          </h1>
          <div className="flex flex-col gap-10 h-full md:flex-row">
            <div className="relative hidden lg:flex lg:flex-col w-[500px] h-[600px] self-center bg-aa-1 text-center ml-2 rounded p-2 dark:bg-aa-dark-1">
              {session.status === "authenticated" &&
                typeof user === "string" &&
                session.data?.user.username?.toLowerCase() ===
                  user.toLowerCase() && (
                  <Button
                    className="absolute right-1"
                    variant="ghost"
                    onClick={() => {
                      if (nowEditable) {
                        setBio("");
                        setImage(undefined);
                        setValidationError({
                          profilePicError: "",
                          bioError: "",
                          generalError: "",
                        });
                        setNowEditable(false);
                        return;
                      }

                      setNowEditable(true);
                    }}
                    disabled={isMutating}
                  >
                    <Edit2 />
                  </Button>
                )}

              <div className="flex flex-col gap-2">
                <div className="relative w-[150px] h-[150px] mx-auto">
                  <Image
                    className="w-full h-full rounded-full"
                    src={getProfilePic()}
                    alt="logo"
                    fill
                  />
                </div>
                {nowEditable && !isMutating && (
                  <Button
                    className="w-1/2 mx-auto"
                    variant="outline"
                    onClick={() => {
                      if (imageUploadRef.current === null) {
                        return;
                      }

                      imageUploadRef.current.click();
                    }}
                  >
                    Upload
                  </Button>
                )}
                <input
                  className="hidden"
                  ref={(ref) => {
                    imageUploadRef.current = ref;
                  }}
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const { files } = e.target;

                    if (files === null || files.length === 0) {
                      return;
                    }

                    const file = files[0];

                    if (file.size > 5_000_000) {
                      setValidationError((prev) => {
                        return {
                          ...prev,
                          profilePicError: "Image is bigger than 5MB",
                        };
                      });
                    }

                    const mime = file.type.split("/")[0].trim();
                    if (mime !== "image") {
                      setValidationError((prev) => {
                        return {
                          ...prev,
                          profilePicError: "This file isn't an image",
                        };
                      });
                    }

                    if (file.size <= 5_000_000 && mime === "image") {
                      if (validationError.profilePicError !== "") {
                        setValidationError((prev) => {
                          return { ...prev, profilePicError: "" };
                        });
                      }
                    }

                    setImage(file);
                  }}
                />
                <h1 className="text-center text-5xl font-semibold">{user}</h1>
              </div>

              {!nowEditable ? (
                <p className="my-auto text-center">{data.bio ?? "No Bio."}</p>
              ) : (
                <>
                  {isMutating ? (
                    <Loader2 className="w-20 h-20 m-auto animate-spin text-aa-2 dark:text-aa-3" />
                  ) : (
                    <Textarea
                      placeholder="Tell us a little bit about yourself"
                      maxLength={150}
                      className="my-auto text-center h-[120px] resize-none border-aa-dark-1 dark:border-aa-2"
                      value={bio === undefined ? data.bio ?? "" : bio}
                      onChange={(e) => {
                        const text = e.currentTarget.value;

                        setBio(text);

                        if (text.length > 150) {
                          setValidationError((prev) => {
                            return {
                              ...prev,
                              bioError: "Bio is greater than 150 characters.",
                            };
                          });
                        } else {
                          if (validationError.bioError !== "") {
                            setValidationError((prev) => {
                              return {
                                ...prev,
                                bioError: "",
                              };
                            });
                          }
                        }
                      }}
                    />
                  )}
                </>
              )}
              {showError() !== "" && (
                <p className="text-sm text-red-500">{showError()}</p>
              )}
              {nowEditable && (
                <Button
                  variant="outline"
                  className="mt-auto"
                  onClick={saveChanges}
                  disabled={!canSaveChanges || isMutating}
                >
                  Save Changes
                </Button>
              )}
            </div>
            <div className="w-full h-full grid auto-cols-fr md:grid-rows-3  p-2 gap-5 ">
              <div className="m-auto w-11/12">
                <div className="flex items-center">
                  <h1 className="text-xl">Watch List</h1>
                  <button
                    className="ml-auto flex gap-1 hover:text-aa-1 dark:hover:text-aa-2"
                    onClick={() => viewChanger({ view: "list", list: "watch" })}
                  >
                    Show
                    <ArrowRight />
                  </button>
                </div>

                {data.watch.length !== 0 && (
                  <div className="grid grid-cols-5 gap-2 md:grid-cols-5 lg:grid-cols-10 border-2 p-2 rounded border-black dark:border-aa-2">
                    {data.watch.map((watchAnime) => {
                      return (
                        <AnimeCover
                          key={watchAnime.id}
                          image={watchAnime.imageUrl}
                          name=""
                          dontShowName
                        />
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="m-auto w-11/12">
                <div className="flex items-center">
                  <h1 className="text-xl">Plan List</h1>
                  <button
                    className="ml-auto flex gap-1 hover:text-aa-1 dark:hover:text-aa-2"
                    onClick={() => viewChanger({ view: "list", list: "plan" })}
                  >
                    Show
                    <ArrowRight />
                  </button>
                </div>
                {data.plan.length !== 0 && (
                  <div className="grid grid-cols-5 gap-2 md:grid-cols-5 lg:grid-cols-10 border-2 p-2 rounded border-black dark:border-aa-2">
                    {data.plan.map((planAnime) => {
                      return (
                        <AnimeCover
                          key={planAnime.id}
                          image={planAnime.imageUrl}
                          dontShowName
                          name=""
                        />
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="m-auto w-11/12">
                <div className="flex items-center">
                  <h1 className="text-xl">Rate List</h1>
                  <button
                    className="ml-auto flex gap-1 hover:text-aa-1 dark:hover:text-aa-2"
                    onClick={() => viewChanger({ view: "list", list: "rate" })}
                  >
                    Show
                    <ArrowRight />
                  </button>
                </div>
                {data.rate.length !== 0 && (
                  <div className="grid grid-cols-5 gap-2 md:grid-cols-5 lg:grid-cols-10 border-2 p-2 rounded border-black dark:border-aa-2">
                    {data.rate.map((rateAnime) => {
                      return (
                        <AnimeCover
                          key={rateAnime.id}
                          image={rateAnime.imageUrl}
                          dontShowName
                          name=""
                        />
                      );
                    })}
                  </div>
                )}
              </div>
              <div className="mt-5 mx-auto w-11/12">
                <button
                  className="ml-auto md:mr-0 flex gap-1 hover:text-aa-1 dark:hover:text-aa-2"
                  onClick={() => viewChanger({ view: "analytics" })}
                >
                  Analytics
                  <ArrowRight />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* fix this later */}
      {viewQuery.data === "list" && (
        <ProfileList username={router.query.user as string} />
      )}
      {viewQuery.data === "analytics" && (
        <ProfileAnalytics username={router.query.user as string} />
      )}
    </>
  );
}
