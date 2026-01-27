"use client";
import { useRef, useState } from "react";
import {
  useFileUploader,
  type FileUploaderResult,
} from "../hooks/use-file-uploader";
import { FileDropzone } from "./File-DropZone";
import { UploadBox } from "./Upload-Box";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface ImageRendererProps {
  imageContent: string;
}

const ImageRenderer = ({ imageContent }: ImageRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={containerRef} className="relative w-full max-w-[200px] mx-auto">
      <div className="absolute inset-0" style={{ borderRadius: 0 }} />
      <img
        src={imageContent}
        alt="Preview"
        className="relative rounded-lg object-contain w-full h-auto max-h-[150px]"
      />
    </div>
  );
};

function RoundedToolCore(props: {
  fileUploaderProps: FileUploaderResult;
  onImageUploaded: (image: string) => void;
  existingImage?: string | null;
}) {
  const { imageContent, imageMetadata, handleFileUploadEvent, cancel } =
    props.fileUploaderProps;
  const { onImageUploaded, existingImage } = props;

  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Auto-fill existing image if available and no new upload
  const displayImage = imageContent || existingImage;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onUpload = async () => {
    try {
      if (!imageContent) return;

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

  // If we have an image (either new or existing)
  if (displayImage) {
    return (
      <div className="mx-auto flex w-full max-w-sm flex-col items-center justify-center gap-4 p-4">
        <div className="flex w-full flex-col items-center gap-2 rounded-xl bg-muted p-4">
          <ImageRenderer imageContent={displayImage} />
          {imageMetadata && (
            <p className="text-xs font-medium text-muted-foreground truncate max-w-[200px]">
              {imageMetadata.name}
            </p>
          )}

          {uploadSuccess && (
            <p className="text-xs font-medium text-green-600">
              ✅ Image téléchargée
            </p>
          )}
        </div>

        {/* Only show upload actions if it's a NEW image (imageMetadata exists) and not yet uploaded */}
        {imageMetadata && !uploadSuccess ? (
          <div className="flex gap-2">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                cancel();
                setUploadSuccess(false);
              }}
            >
              Annuler
            </Button>
            <Button
              size="sm"
              onClick={onUpload}
              disabled={uploadSuccess}
            >
              Télécharger
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUploadEvent}
              accept="image/*"
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mb-2">Glissez une nouvelle image pour remplacer</p>
            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="h-8">
              Changer l'image
            </Button>
          </div>
        )}

      </div>
    );
  }

  return (
    <UploadBox
      title="Ajoutez votre logo"
      description="PNG, JPG, SVG..."
      accept="image/*"
      onChange={handleFileUploadEvent}
    />
  );
}

export function RoundedTool({
  onImageUploaded,
  existingImage
}: {
  onImageUploaded: (image: string) => void;
  existingImage?: string | null;
}) {
  const fileUploaderProps = useFileUploader();

  return (
    <FileDropzone
      setCurrentFile={fileUploaderProps.handleFileUpload}
      acceptedFileTypes={["image/*", ".jpg", ".jpeg", ".png", ".webp", ".svg"]}
      dropText="Glissez l'image ici"
    >
      <RoundedToolCore
        fileUploaderProps={fileUploaderProps}
        onImageUploaded={onImageUploaded}
        existingImage={existingImage}
      />
    </FileDropzone>
  );
}
