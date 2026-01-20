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

function RoundedToolCore(props: {
  fileUploaderProps: FileUploaderResult;
  onImageUploaded: (image: string) => void;
}) {
  const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;
  const { onImageUploaded } = props;

  const [uploadSuccess, setUploadSuccess] = useState(false);

  const onUpload = async () => {
    try {
      const result = await window.electronAPI.uploadImage(imageContent);

      if (result.success) {
        setUploadSuccess(true);
        onImageUploaded(imageContent);
        toast.success("Image téléchargée avec succès");
      } else {
        toast.error("Échec du téléchargement : " + result.error);
      }
    } catch (err) {
      console.error("❌ Erreur inattendue lors du téléchargement :", err);
      toast.error("Erreur inattendue lors du téléchargement");
    }
  };

  if (!imageMetadata) {
    return (
      <UploadBox
        title="Ajoutez votre logo à l'ordonnance."
        description="Télécharger une image"
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
            ✅ Image téléchargée avec succès
          </p>
        )}
      </div>

      <div className="flex flex-col items-center rounded-lg bg-accent/50 px-4 py-2">
        <span className="text-sm text-muted-foreground">Taille originale</span>
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
          Annuler
        </button>
        <button
          onClick={onUpload}
          disabled={uploadSuccess}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          Télécharger
        </button>
      </div>
    </div>
  );
}

export function RoundedTool({
  onImageUploaded,
}: {
  onImageUploaded: (image: string) => void;
}) {
  const fileUploaderProps = useFileUploader();

  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
      dropText="Drop image file"
    >
      <RoundedToolCore
        fileUploaderProps={fileUploaderProps}
        onImageUploaded={onImageUploaded}
      />
    </FileDropzone>
  );
}
