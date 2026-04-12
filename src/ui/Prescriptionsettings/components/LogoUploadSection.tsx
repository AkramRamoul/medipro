import React from "react";
import { Info } from "lucide-react";
import { FileDropzone } from "../../components/File-DropZone";
import { RoundedTool } from "../../components/Rounded-tool";

interface Props {
    logoImage: string | null;
    setLogoImage: (url: string | null) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement> | any) => void;
}

export function LogoUploadSection({ logoImage, setLogoImage, handleFileUpload }: Props) {
    return (
        <div className="space-y-3">
            <FileDropzone
                setCurrentFile={handleFileUpload}
                acceptedFileTypes={["image/*"]}
                dropText="Cliquez ou glissez votre logo ici"
            >
                <RoundedTool
                    onImageUploaded={setLogoImage}
                    existingImage={logoImage}
                />
            </FileDropzone>
            <div className="flex items-start gap-2 text-[10px] text-muted-foreground p-3 bg-primary/5 rounded-lg border border-primary/10">
                <Info className="w-4 h-4 text-primary shrink-0" />
                <p>
                    Conseil : Utilisez une image haute résolution avec fond transparent (PNG) ou blanc
                    pour un rendu optimal à l'impression. Le logo sera placé selon votre modèle.
                </p>
            </div>
        </div>
    );
}

