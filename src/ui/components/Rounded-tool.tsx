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
      alert("Unexpected error during upload.");
    }
  };

  if (!imageMetadata) {
    return (
      <UploadBox
        title="Add rounded borders to images."
        subtitle="Allows pasting images from clipboard"
        description="Upload Image"
        accept="image/*"
        onChange={handleFileUploadEvent}
      />
    );
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center justify-center gap-6 p-6">
      <div className="flex w-full flex-col items-center gap-4 rounded-xl p-4">
        <ImageRenderer imageContent={imageContent} />
        <p className="text-lg font-medium text-gray/80">{imageMetadata.name}</p>
        {uploadSuccess && (
          <p className="text-green-600 text-sm font-medium mt-2">
            ✅ Image uploaded successfully
          </p>
        )}
      </div>

      <div className="flex flex-col items-center rounded-lg bg-white/5">
        <span className="text-sm text-gray/60">Original Size</span>
        <span className="font-medium text-gray">
          {imageMetadata.width} × {imageMetadata.height}
        </span>
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => {
            cancel();
            setUploadSuccess(false); // Reset message on cancel
          }}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-red-800"
        >
          Cancel
        </button>
        <button
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-medium text-white/90 transition-colors hover:bg-green-800"
          onClick={onUpload}
          disabled={uploadSuccess} // Disable button if upload is successful
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
