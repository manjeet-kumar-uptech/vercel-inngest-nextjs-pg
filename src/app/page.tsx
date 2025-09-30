"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileSpreadsheet, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { inngest } from "../inngest/client";
export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const csv = acceptedFiles.find((f) => f.type === "text/csv" || f.name.toLowerCase().endsWith(".csv"));
    setFile(csv ?? null);
    setUploadedUrl(null);
    setStatus("idle");
    setError(null);
  }, []);

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    multiple: false,
    accept: { "text/csv": [".csv"] },
    maxFiles: 1,
  });

  async function handleUpload() {
    if (!file) return;
    setStatus("uploading");
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/blob/upload-url", { method: "POST", body: formData });
      if (!res.ok) throw new Error("Failed to upload file");
      const data = (await res.json()) as { url: string };
      setUploadedUrl(data.url);
      setStatus("success");

      // send event to inngest
      sendEventToInngest();

    } catch (e) {
      setError((e as Error).message);
      setStatus("error");
    }
  }

  async function sendEventToInngest() {
    try {
      const response = await fetch("/api/events/file-upload-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user: "Okay" }),
      });
      console.log("Response from inngest", response);

      
    } catch {
      console.log("Error sending event to inngest");
    } finally {
      console.log("Event sent to inngest");
    }
  }

  return (
    <div className="min-h-dvh w-full flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Upload CSV to Vercel Blob</CardTitle>
          <CardDescription>Drag and drop a .csv file or click to select.</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={"border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors " +
              (isDragActive ? "bg-black/5 dark:bg-white/5" : "hover:bg-black/5 dark:hover:bg-white/5")}
          >
            <input {...getInputProps()} />
            <UploadCloud className="mx-auto mb-3" />
            <p className="font-medium">{isDragActive ? "Drop the file here..." : "Drag 'n' drop your CSV here, or click to select"}</p>
            <p className="text-sm text-black/60 dark:text-white/60 mt-1">Only .csv files are accepted.</p>
          </div>

          {file && (
            <div className="mt-4 flex items-center gap-3">
              <FileSpreadsheet />
              <div className="flex-1">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-black/60 dark:text-white/60">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <Button onClick={handleUpload} disabled={status === "uploading"}>
                {status === "uploading" ? "Uploading..." : "Upload"}
              </Button>
            </div>
          )}

          {fileRejections.length > 0 && (
            <p className="mt-3 text-sm text-red-600">Only one .csv file is allowed.</p>
          )}

          {status === "success" && uploadedUrl && (
            <div className="mt-4 flex items-center gap-2 text-green-600">
              <CheckCircle2 />
              <a className="underline" href={uploadedUrl} target="_blank" rel="noreferrer">
                View uploaded file
              </a>
            </div>
          )}

          {status === "error" && error && (
            <div className="mt-4 flex items-center gap-2 text-red-600">
              <XCircle />
              <p>{error}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
