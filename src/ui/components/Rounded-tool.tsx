"use client";
import { useRef, useState } from "react";
import {
  useFileUploader,
  type FileUploaderResult,
} from "../hooks/use-file-uploader";
import { FileDropzone } from "./File-DropZone";
import { UploadBox } from "./Upload-Box";
import { toast } from "sonner";

interface ImageRendererProps {
  imageContent: string;
}

const ImageRenderer = ({ imageContent }: ImageRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative w-[500px]">
      <div className="absolute inset-0" style={{ borderRadius: 0 }} />
      <img
        src={imageContent}
        alt="Preview"
        className="relative rounded-lg"
        width={500}
        height={300}
      />
    </div>
  );
};

function RoundedToolCore(props: { fileUploaderProps: FileUploaderResult }) {
  const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;

  const [uploadSuccess, setUploadSuccess] = useState(false); // ✅ new state

  const onUpload = async () => {
    try {
      const result = await window.electronAPI.uploadImage(imageContent);

      if (result.success) {
        console.log("✅ Logo uploaded:", result.path);
        toast.success("Image uploaded successfully");
        setUploadSuccess(true); // ✅ show message
      } else {
        console.error("❌ Upload failed:", result.error);
        toast.error("Upload failed: " + result.error);
      }
    } catch (err) {
      console.error("❌ Unexpected error during upload:", err);
      toast.error("Unexpected error during upload.");
    }
  };

  if (!imageMetadata) {
    return (
      <UploadBox
        title="Add your logo to the prescription."
        description="Upload Image"
        accept="image/*"
        onChange={handleFileUploadEvent}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl bg-muted p-4">
        <ImageRenderer imageContent={imageContent} />
        <p className="text-lg font-medium text-muted-foreground">
          {imageMetadata.name}
        </p>

        {uploadSuccess && (
          <p className="text-sm font-medium text-green-600 mt-2">
            ✅ Image uploaded successfully
          </p>
        )}
      </div>

      <div className="flex flex-col items-center rounded-lg bg-accent/50 px-4 py-2">
        <span className="text-sm text-muted-foreground">Original Size</span>
        <span className="font-medium text-foreground">
          {imageMetadata.width} × {imageMetadata.height}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            cancel();
            setUploadSuccess(false);
          }}
          className="rounded-lg bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground hover:bg-destructive/80"
        >
          Cancel
        </button>
        <button
          onClick={onUpload}
          disabled={uploadSuccess}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Upload
        </button>
      </div>
    </div>
  );
}

export function RoundedTool() {
  const fileUploaderProps = useFileUploader();

  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
      dropText="Drop image file"
    >
      <RoundedToolCore fileUploaderProps={fileUploaderProps} />
    </FileDropzone>
  );
}
