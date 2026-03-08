import React from "react";
import { Info } from "lucide-react";
import { Card, CardHeader, CardContent } from "../../components/ui/card";
import { FileDropzone } from "../../components/File-DropZone";
import { RoundedTool } from "../../components/Rounded-tool";

interface Props {
    logoImage: string | null;
    setLogoImage: (url: string | null) => void;
    handleFileUpload: (e: React.ChangeEvent<HTMLInputElement> | any) => void;
}

export function LogoUploadSection({ logoImage, setLogoImage, handleFileUpload }: Props) {
    return (
        <Card className="shadow-md border-primary/5">
            <CardHeader className="pb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Logo de la Clinique
            </CardHeader>
            <CardContent>
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
                <div className="mt-4 flex items-start gap-2 text-[10px] text-muted-foreground p-3 bg-primary/5 rounded-lg border border-primary/10">
                    <Info className="w-4 h-4 text-primary shrink-0" />
                    <p>
                        Conseil : Utilisez une image haute résolution avec un fond transparent (PNG) ou blanc
                        pour un rendu optimal sur vos ordonnances imprimées. Le logo sera placé au centre de l'en-tête.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
