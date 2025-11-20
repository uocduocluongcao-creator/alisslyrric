import { useRef, useState } from "react";
import type { FormEvent } from "react";
import type { UseMutationResult } from "@tanstack/react-query";
import type { LyricJob } from "../types/jobs";

interface Props {
  createJob: UseMutationResult<
    LyricJob,
    Error,
    { title: string; artist?: string; audio: File; lyrics?: File },
    unknown
  >;
}

export const UploadForm = ({ createJob }: Props) => {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [error, setError] = useState<string>();
  const audioRef = useRef<HTMLInputElement>(null);
  const lyricRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    const audio = audioRef.current?.files?.[0];
    if (!audio) {
      setError("Please choose an audio file");
      return;
    }
    try {
      await createJob.mutateAsync({
        title: title || audio.name,
        artist: artist || undefined,
        audio,
        lyrics: lyricRef.current?.files?.[0] ?? undefined
      });
      setTitle("");
      setArtist("");
      if (audioRef.current) audioRef.current.value = "";
      if (lyricRef.current) lyricRef.current.value = "";
    } catch (err) {
      setError((err as Error).message);
    }
  };

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <header className="panel-header">
        <div>
          <p className="eyebrow">Upload</p>
          <h2>Create lyric video job</h2>
        </div>
        <button className="primary-btn" type="submit" disabled={createJob.isPending}>
          {createJob.isPending ? "Uploading..." : "Start job"}
        </button>
      </header>
      <div className="panel-body grid">
        <label className="field">
          <span>Title</span>
          <input
            type="text"
            placeholder="Song title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Artist</span>
          <input
            type="text"
            placeholder="Artist (optional)"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
          />
        </label>
        <label className="field">
          <span>Audio file</span>
          <input ref={audioRef} type="file" accept="audio/*" required />
        </label>
        <label className="field">
          <span>Lyrics file</span>
          <input ref={lyricRef} type="file" accept=".txt,.lrc" />
        </label>
      </div>
      {error && <p className="error-text">{error}</p>}
    </form>
  );
};

