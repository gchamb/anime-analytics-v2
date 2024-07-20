"use client";

import { Button } from "@/components/ui/button";
import { Edit2, Loader2 } from "lucide-react";

import { useState, useRef } from "react";
import useSWRMutation from "swr/mutation";
import { uploadFile } from "@uploadcare/upload-client";
import { z } from "zod";
import { Textarea } from "@/components/ui/text-area";

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

export default function ProfileDetails({
  profileBio,
  isOwner,
  username,
  profileImage,
}: {
  profileBio: string | null;
  isOwner: boolean;
  username: string;
  profileImage: string | null;
}) {
  const [nowEditable, setNowEditable] = useState(false);
  const [bio, setBio] = useState<string | undefined>(profileBio ?? "No Bio");
  const [image, setImage] = useState<File | undefined>(undefined);
  const [validationError, setValidationError] = useState({
    profilePicError: "",
    bioError: "",
    generalError: "",
  });
  const [loading, setLoading] = useState(false);
  let imageUploadRef = useRef<HTMLInputElement | null>(null);

  const {
    trigger,
    isMutating,
    error: profileError,
  } = useSWRMutation(`/api/user/profile?username=${username}`, fetcherMutation);

  const canSaveChanges =
    validationError.bioError === "" && validationError.profilePicError === "";

  const saveChanges = async () => {
    try {
      setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };
  const getProfilePic = () => {
    if (image !== undefined) {
      return URL.createObjectURL(image);
    }
    if (profileImage !== null) {
      if (profileImage.includes("google") || profileImage.includes("discord")) {
        return profileImage;
      }

      return `https://ucarecdn.com/${profileImage}/`;
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

  return (
    <div className="relative hidden lg:flex lg:flex-col w-[500px] h-[600px] self-center  text-center ml-2 rounded p-2 bg-aa-dark-1">
      {isOwner && (
        <Button
          className="absolute right-1"
          variant="ghost"
          onClick={() => {
            if (nowEditable) {
              setBio(profileBio ?? "");
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
          <img
            className="w-full h-full rounded-full object-cover"
            src={getProfilePic()}
            alt="profile pic"
          />
        </div>
        {nowEditable && !isMutating && (
          <Button
            className="w-1/2 mx-auto"
            variant="outline"
            disabled={loading}
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
          disabled={loading || isMutating}
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
        <h1 className="text-center text-5xl font-semibold">{username}</h1>
      </div>

      {!nowEditable ? (
        <p className="my-auto text-center">
          {bio === undefined || bio === "" ? "No Bio" : bio}
        </p>
      ) : (
        <>
          {isMutating || loading ? (
            <Loader2 className="w-20 h-20 m-auto animate-spin text-aa-3" />
          ) : (
            <Textarea
              placeholder="Tell us a little bit about yourself"
              maxLength={150}
              className="my-auto text-center h-[120px] resize-none border-aa-dark-1 dark:border-aa-2"
              value={bio === undefined ? profileBio ?? "" : bio}
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
          disabled={!canSaveChanges || isMutating || loading}
        >
          Save Changes
        </Button>
      )}
    </div>
  );
}
