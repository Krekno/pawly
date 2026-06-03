"use server";

import crypto from "crypto";

export async function getCloudinarySignature() {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  
  if (!apiSecret) {
    throw new Error("CLOUDINARY_API_SECRET is not set in environment variables");
  }

  const stringToSign = `timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(stringToSign).digest("hex");

  return { timestamp, signature };
}
