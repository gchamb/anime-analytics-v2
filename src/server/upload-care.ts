import { UploadcareSimpleAuthSchema } from "@uploadcare/rest-client";

export const uploadcareSimpleAuthSchema = new UploadcareSimpleAuthSchema({
  publicKey: "5bf97c741b9939d6c42e",
  secretKey: process.env.UPLOAD_CARE_SECRET as string,
});
