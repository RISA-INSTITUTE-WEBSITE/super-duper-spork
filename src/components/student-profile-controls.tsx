"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";

const maxPhotoBytes = 2 * 1024 * 1024;
const acceptedPhotoTypes = ["image/jpeg", "image/png", "image/webp"];

export function ProfilePhotoField({
  currentSrc,
  initials,
}: {
  currentSrc: string | null;
  initials: string;
}) {
  const [photo, setPhoto] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  return (
    <div className="flex flex-wrap items-center gap-5 rounded-[1.5rem] border border-white/90 bg-white/60 p-5">
      <div className="flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#38b6ff] via-[#155DFC] to-[#123e8a] text-3xl font-bold text-white shadow-md">
        {preview || currentSrc ? (
          <Image
            src={preview ?? currentSrc ?? ""}
            alt={preview ? "Selected new profile picture" : "Current profile picture"}
            width={96}
            height={96}
            unoptimized
            className="size-full object-cover"
          />
        ) : (
          <span aria-hidden="true">{initials}</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <label
          htmlFor="student-avatar"
          className="block text-sm font-semibold text-slate-900"
        >
          Profile picture
        </label>
        <p className="mb-3 mt-1 text-xs leading-5 text-slate-600">
          Choose a JPG, PNG or WebP (2 MB maximum). Preview before you save.
        </p>
        <input
          id="student-avatar"
          type="file"
          name="avatar"
          accept="image/jpeg,image/png,image/webp"
          aria-describedby={error ? "student-photo-error" : undefined}
          onChange={(event) => {
            const file = event.target.files?.[0] ?? null;
            if (
              file &&
              (!acceptedPhotoTypes.includes(file.type) || file.size > maxPhotoBytes)
            ) {
              setPhoto(null);
              setPreview(null);
              setError("Please choose a JPG, PNG or WebP image no larger than 2 MB.");
              event.target.value = "";
            } else {
              setPhoto(file);
              setPreview(file ? URL.createObjectURL(file) : null);
              setError(null);
            }
          }}
          className="block w-full min-w-0 max-w-md text-xs text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#eefce5] file:px-3 file:py-2 file:font-semibold file:text-[#286518]"
        />
        {error && (
          <p
            id="student-photo-error"
            role="alert"
            className="mt-2 text-xs font-medium text-red-700"
          >
            {error}
          </p>
        )}
        {photo && !error && (
          <p role="status" className="mt-2 text-xs font-medium text-[#286518]">
            {photo.name} selected. Save your profile to upload it.
          </p>
        )}
      </div>
    </div>
  );
}

export function StudentProfileSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#286518] px-7 py-3 text-sm font-bold text-white transition hover:bg-[#1d4f11] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#286518] disabled:cursor-wait disabled:opacity-60"
    >
      {pending ? "Saving changes..." : "Save profile changes"}
    </button>
  );
}
