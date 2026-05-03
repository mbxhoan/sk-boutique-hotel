"use client";

import { useEffect, useState, type ChangeEvent } from "react";

import type { Locale } from "@/lib/locale";
import { localize, type LocalizedText } from "@/lib/mock/i18n";

const TARGET_IMAGE_SIZE_BYTES = 900 * 1024;
const MAX_IMAGE_DIMENSIONS = [2200, 1800, 1600, 1400, 1200, 1024];
const IMAGE_QUALITIES = [0.88, 0.8, 0.72, 0.64, 0.56];

type PaymentProofFileInputProps = {
  accept?: string;
  helperText: LocalizedText;
  label: LocalizedText;
  locale: Locale;
  onCompressingChange?: (isCompressing: boolean) => void;
  name?: string;
};

function isImageFile(file: File) {
  return file.type.startsWith("image/") && file.type !== "image/svg+xml";
}

function createImageElement(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = (error) => {
      URL.revokeObjectURL(objectUrl);
      reject(error);
    };
    image.src = objectUrl;
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Unable to compress payment proof image."));
          return;
        }

        resolve(blob);
      },
      "image/jpeg",
      quality
    );
  });
}

function buildCompressedFileName(originalName: string) {
  const baseName = originalName.replace(/\.[^.]+$/, "").trim() || "payment-proof";
  return `${baseName}.jpg`;
}

async function compressPaymentProofImage(file: File) {
  const image = await createImageElement(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) {
    throw new Error("Unable to prepare image compression canvas.");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";

  let bestBlob: Blob | null = null;

  for (const maxDimension of MAX_IMAGE_DIMENSIONS) {
    const scale = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * scale));
    const height = Math.max(1, Math.round(image.naturalHeight * scale));

    canvas.width = width;
    canvas.height = height;
    context.clearRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    for (const quality of IMAGE_QUALITIES) {
      const blob = await canvasToBlob(canvas, quality);

      if (!bestBlob || blob.size < bestBlob.size) {
        bestBlob = blob;
      }

      if (blob.size <= TARGET_IMAGE_SIZE_BYTES) {
        return new File([blob], buildCompressedFileName(file.name), {
          lastModified: Date.now(),
          type: "image/jpeg"
        });
      }
    }
  }

  if (!bestBlob) {
    throw new Error("Unable to compress payment proof image.");
  }

  return new File([bestBlob], buildCompressedFileName(file.name), {
    lastModified: Date.now(),
    type: "image/jpeg"
  });
}

export function PaymentProofFileInput({
  accept = "image/*,.pdf",
  helperText,
  label,
  onCompressingChange,
  locale,
  name = "proofFile"
}: PaymentProofFileInputProps) {
  const [isCompressing, setIsCompressing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    onCompressingChange?.(isCompressing);
  }, [isCompressing, onCompressingChange]);

  async function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0] ?? null;

    setErrorMessage(null);

    if (!file || !isImageFile(file) || file.size <= TARGET_IMAGE_SIZE_BYTES) {
      return;
    }

    setIsCompressing(true);

    try {
      const compressedFile = await compressPaymentProofImage(file);
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(compressedFile);
      input.files = dataTransfer.files;
    } catch (error) {
      console.warn("[payment-proof] Failed to compress image before upload", error);
      setErrorMessage(
        localize(locale, {
          vi: "Không thể nén ảnh tự động. Vui lòng chọn ảnh JPG hoặc PNG nhỏ hơn.",
          en: "Unable to compress the image automatically. Please choose a smaller JPG or PNG file."
        })
      );
      input.value = "";
    } finally {
      setIsCompressing(false);
    }
  }

  const statusText = errorMessage
    ? errorMessage
    : isCompressing
      ? localize(locale, {
          vi: "Đang nén ảnh xác nhận thanh toán...",
          en: "Compressing the payment proof image..."
        })
      : localize(locale, helperText);

  const statusTone = errorMessage ? "error" : isCompressing ? "processing" : "hint";

  return (
    <label className="portal-field payment-proof-upload">
      <span className="portal-field__label">{localize(locale, label)}</span>
      <input
        accept={accept}
        className="portal-field__control"
        disabled={isCompressing}
        name={name}
        onChange={handleChange}
        type="file"
      />
      <span className={`payment-proof-upload__status payment-proof-upload__status--${statusTone}`}>{statusText}</span>
    </label>
  );
}
