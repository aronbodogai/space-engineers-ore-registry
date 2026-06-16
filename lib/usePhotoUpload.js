"use client";

import { useState } from "react";
import { createClient } from "./supabase/client";
import { PHOTO_BUCKET } from "./constants";

/**
 * Browser-side photo upload to the Supabase Storage bucket, shared by the submit
 * and edit forms. Returns the upload state plus an `<input type="file">` change
 * handler. `initialUrl` seeds an existing photo (edit form); `failureHint` is
 * appended to the error message so each form can phrase the fallback its own way.
 *
 * On a failed re-upload the last good URL is kept (you don't lose an accepted
 * photo because a retry failed).
 */
export function usePhotoUpload({ initialUrl = "", failureHint = "" } = {}) {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialUrl);
  const [imageError, setImageError] = useState("");

  async function handleImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageError("");
    setUploading(true);
    try {
      const supabase = createClient();
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (error) throw error;
      const { data } = supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path);
      setImageUrl(data.publicUrl);
    } catch (err) {
      setImageError((err?.message || "Upload failed") + failureHint);
    } finally {
      setUploading(false);
    }
  }

  return { uploading, imageUrl, imageError, handleImage };
}
