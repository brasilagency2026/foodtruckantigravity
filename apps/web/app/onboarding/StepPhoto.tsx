"use client";

import { useState, useRef } from "react";
import { OnboardingData } from "./page";
import { StepHeader, NextButton, BackButton } from "./components";

interface Props {
  data: Partial<OnboardingData>;
  onBack: () => void;
  onNext: (fields: Pick<OnboardingData, "coverPhotoUrl">) => void;
}

export function StepPhoto({ data, onBack, onNext }: Props) {
  const [preview, setPreview] = useState<string>(data.coverPhotoUrl ?? "");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setError("Apenas imagens são permitidas.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Imagem muito grande. Máximo 10MB.");
      return;
    }

    setUploading(true);
    setError("");
    setProgress(20);

    try {
      // 1. Pedir presigned URL ao backend
      const ext = file.name.split(".").pop();
      const key = `trucks/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      setProgress(40);
      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, contentType: file.type }),
      });
      const { uploadUrl, publicUrl } = await res.json();

      setProgress(60);

      // 2. Upload direto para R2
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      setProgress(100);
      setPreview(publicUrl);
      setTimeout(() => setUploading(false), 400);

    } catch (e) {
      setError("Erro no upload. Tente novamente.");
      setUploading(false);
      setProgress(0);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleNext() {
    if (!preview) {
      setError("Adicione uma foto de capa para o seu truck.");
      return;
    }
    onNext({ coverPhotoUrl: preview });
  }

  return (
    <div>
      <StepHeader
        emoji="📸"
        title="Foto de capa"
        subtitle="Uma boa foto aumenta muito o número de pedidos. Use uma foto do seu truck ou dos seus pratos."
      />

      {/* Drop zone */}
      <div
        style={{
          ...s.dropzone,
          ...(preview ? s.dropzoneWithPhoto : {}),
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        {preview ? (
          <>
            <img src={preview} alt="Capa" style={s.preview} />
            <div style={s.previewOverlay}>
              <span style={s.changeText}>🔄 Trocar foto</span>
            </div>
          </>
        ) : (
          <div style={s.placeholder}>
            <span style={s.placeholderIcon}>📷</span>
            <p style={s.placeholderText}>
              {uploading ? "Enviando..." : "Clique ou arraste uma foto aqui"}
            </p>
            <p style={s.placeholderHint}>JPG, PNG ou WebP · Máx. 10MB</p>
          </div>
        )}

        {/* Progress bar */}
        {uploading && (
          <div style={s.progressWrap}>
            <div style={{ ...s.progressBar, width: `${progress}%` }} />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />

      {error && <p style={s.error}>{error}</p>}

      {preview && !uploading && (
        <p style={s.successText}>✅ Foto enviada com sucesso!</p>
      )}

      <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
        <BackButton onClick={onBack} />
        <NextButton
          onClick={handleNext}
          label={uploading ? "Enviando..." : "Próximo — Horários →"}
          flex
          disabled={uploading}
        />
      </div>
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  dropzone: {
    position: "relative",
    border: "2px dashed rgba(255,255,255,0.12)",
    borderRadius: 20,
    minHeight: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    overflow: "hidden",
    transition: "border-color 0.2s",
    background: "#1A1A1A",
  },
  dropzoneWithPhoto: {
    border: "2px solid rgba(255,107,53,0.3)",
  },
  preview: {
    width: "100%",
    height: 240,
    objectFit: "cover",
    display: "block",
  },
  previewOverlay: {
    position: "absolute",
    inset: 0,
    background: "rgba(0,0,0,0)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.2s",
  },
  changeText: {
    color: "transparent",
    fontWeight: 600,
    fontSize: 15,
  },
  placeholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: 40,
  },
  placeholderIcon: { fontSize: 40, marginBottom: 4 },
  placeholderText: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 15,
    fontWeight: 500,
    margin: 0,
    textAlign: "center",
  },
  placeholderHint: {
    color: "rgba(255,255,255,0.2)",
    fontSize: 12,
    margin: 0,
  },
  progressWrap: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 4,
    background: "rgba(255,255,255,0.1)",
  },
  progressBar: {
    height: "100%",
    background: "#FF6B35",
    transition: "width 0.3s ease",
  },
  error: { color: "#FF4444", fontSize: 13, margin: "12px 0 0" },
  successText: { color: "#22C55E", fontSize: 13, margin: "12px 0 0", fontWeight: 500 },
};
