/** Resize static diagrams as Edu-ca-te does, before uploading to the private backend. */
export async function prepareStudyNoteImage(
  file: File,
): Promise<{ mime: string; data: string }> {
  if (!["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type)) {
    throw new Error("Choose a JPG, PNG, WebP or GIF image.");
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("Choose an image smaller than 10 MB.");
  }
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 1500 / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("Image processing is unavailable in this browser.");
    }
    for (let attempt = 0; attempt < 8; attempt += 1) {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      const url = canvas.toDataURL("image/webp", 0.85 - Math.min(attempt, 4) * 0.1);
      const match = /^data:(image\/(?:webp|png|jpeg));base64,(.+)$/.exec(url);
      if (match && match[2].length <= 293332) {
        return { mime: match[1], data: match[2] };
      }
      canvas.width = Math.max(1, Math.round(canvas.width * 0.8));
      canvas.height = Math.max(1, Math.round(canvas.height * 0.8));
    }
    throw new Error("Could not compress the diagram. Try a smaller image.");
  } finally {
    bitmap.close();
  }
}
