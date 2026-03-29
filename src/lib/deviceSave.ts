/** 共有シートまたはダウンロードで端末側に残す（base はファイル名の芯。例: 2026-03-29 または 2026-03-29-abc12def） */
export async function saveBlobToDevice(base: string, blob: Blob): Promise<void> {
  const name = `moon-${base}.jpg`;
  const file = new File([blob], name, { type: blob.type || "image/jpeg" });

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name });
      return;
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
    }
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
