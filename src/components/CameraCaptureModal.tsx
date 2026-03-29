"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatDateKey } from "@/lib/dateKey";
import { savePhoto } from "@/lib/db";

type Props = {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export function CameraCaptureModal({ open, onClose, onSaved }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [camError, setCamError] = useState<string | null>(null);
  const [camReady, setCamReady] = useState(false);
  const [capturing, setCapturing] = useState(false);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCamReady(false);
  }, []);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setCamError(null);
      return;
    }

    let cancelled = false;
    setCamError(null);
    setCamReady(false);

    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play();
        }
        setCamReady(true);
      } catch (e) {
        if (!cancelled) {
          setCamError(
            e instanceof Error ? e.message : "カメラを開けませんでした",
          );
        }
      }
    })();

    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, stopCamera]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const handleClose = useCallback(() => {
    stopCamera();
    setCamError(null);
    onClose();
  }, [onClose, stopCamera]);

  const captureToday = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    setCapturing(true);
    try {
      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) {
        setCamError(
          "映像の解像度を取得できませんでした。しばらく待ってから再度お試しください。",
        );
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, w, h);
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/jpeg", 0.92),
      );
      if (!blob) return;
      await savePhoto(formatDateKey(new Date()), blob);
      handleClose();
      onSaved();
    } finally {
      setCapturing(false);
    }
  }, [handleClose, onSaved]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/80 sm:items-center sm:p-6"
      role="presentation"
      onClick={handleClose}
    >
      <div
        className="flex max-h-[min(92dvh,900px)] w-full max-w-lg flex-col gap-3 rounded-t-3xl bg-[#0f0f14] p-4 pt-5 shadow-xl ring-1 ring-zinc-800 sm:rounded-3xl"
        role="dialog"
        aria-modal="true"
        aria-label="カメラで撮影"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between gap-2">
          <h2 className="text-sm font-medium text-zinc-200">今日の月を撮影</h2>
          <button
            type="button"
            onClick={handleClose}
            className="shrink-0 rounded-full bg-zinc-800 px-4 py-2 text-sm text-zinc-100 active:bg-zinc-700"
          >
            閉じる
          </button>
        </div>

        <div className="relative aspect-[3/4] w-full max-h-[min(52dvh,480px)] overflow-hidden rounded-2xl bg-black ring-1 ring-zinc-800">
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            playsInline
            muted
            autoPlay
          />
          {!camReady && !camError && (
            <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/90 text-sm text-zinc-400">
              カメラを準備中…
            </div>
          )}
        </div>

        {camError && (
          <p className="text-xs text-red-400" role="alert">
            {camError}
          </p>
        )}

        <button
          type="button"
          disabled={!camReady || capturing}
          onClick={() => void captureToday()}
          className="shrink-0 rounded-full bg-amber-400 py-3.5 text-sm font-semibold text-zinc-950 disabled:opacity-40 active:scale-[0.99]"
        >
          {capturing ? "保存中…" : "この画角で撮影して保存"}
        </button>
        <p className="text-[11px] text-zinc-500">
          アップロードは行いません。端末内にだけ保存します。
        </p>
        <div
          className="pb-[max(0.25rem,env(safe-area-inset-bottom))]"
          aria-hidden
        />
      </div>
    </div>
  );
}
