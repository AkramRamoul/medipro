import React from "react";

interface PrescriptionPreviewProps {
    form: {
        nameFr: string;
        nameAr: string;
        specialtyFr: string;
        specialtyAr: string;
        inscriptionNumber: string;
        address: string;
        phoneNumber1: string;
        phoneNumber2: string;
        city: string;
        accentColor?: string;
        fontFamily?: "serif" | "sans-serif";
    };
    services: { fr: string; ar: string }[];
    logoImage: string | null;
}

export const PrescriptionPreview: React.FC<PrescriptionPreviewProps> = ({
    form,
    services,
    logoImage,
}) => {
    const accentColor = form.accentColor || "#000000";
    const fontFamily = form.fontFamily === "sans-serif" ? "sans-serif" : "'Amiri', serif";

    return (
        <div className="sticky top-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Aperçu en direct</h3>
            <div className="bg-white text-black shadow-2xl rounded-sm overflow-hidden mx-auto transition-all"
                style={{
                    width: "100%",
                    aspectRatio: "1 / 1.414", // A5 Proportions
                    maxWidth: "400px",
                    fontSize: "0.65rem",
                    fontFamily: fontFamily,
                    border: "1px solid #e2e8f0"
                }}>

                <div className="p-6 h-full flex flex-col">
                    {/* Watermark */}
                    {logoImage && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
                            <img src={logoImage} alt="" className="w-1/2 object-contain" />
                        </div>
                    )}

                    {/* Header */}
                    <div className="flex justify-between items-start relative mb-4">
                        {/* Left Header */}
                        <div className="w-[40%] text-left">
                            <div className="font-bold text-[0.85rem] leading-tight mb-1" style={{ color: accentColor }}>
                                {form.nameFr || "Nom du Docteur"}
                            </div>
                            <div className="text-[0.6rem] leading-tight mb-1 text-gray-600">
                                {form.specialtyFr || "Spécialité"}
                            </div>
                            {services.map((s, i) => (
                                <div key={i} className="text-[0.55rem] text-gray-700">{s.fr}</div>
                            ))}
                        </div>

                        {/* Center Logo/N° Order */}
                        <div className="w-[20%] flex flex-col items-center justify-center pt-2">
                            {logoImage ? (
                                <img src={logoImage} alt="Logo" className="w-10 h-10 object-contain mb-1" />
                            ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center text-[0.4rem] text-gray-400">LOGO</div>
                            )}
                            <div className="text-[0.5rem] whitespace-nowrap">N° Order: {form.inscriptionNumber || "0000"}</div>
                        </div>

                        {/* Right Header (Arabic) */}
                        <div className="w-[40%] text-right" dir="rtl">
                            <div className="font-bold text-[0.85rem] leading-tight mb-1" style={{ color: accentColor }}>
                                {form.nameAr || "اسم الطبيب"}
                            </div>
                            <div className="text-[0.6rem] leading-tight mb-1 text-gray-600">
                                {form.specialtyAr || "التخصص"}
                            </div>
                            {services.map((s, i) => (
                                <div key={i} className="text-[0.55rem] text-gray-700">{s.ar}</div>
                            ))}
                        </div>
                    </div>

                    <div className="border-b border-gray-400 my-2" />

                    {/* Patient Info Section */}
                    <div className="flex justify-between mt-4 text-[0.7rem]">
                        <div className="space-y-1">
                            <div><strong>Nom :</strong> ........................................</div>
                            <div><strong>Âge :</strong> ...........</div>
                        </div>
                        <div className="text-right">
                            <div>{form.city || "Ville"}, le : ....................</div>
                        </div>
                    </div>

                    {/* Title */}
                    <div className="text-center font-bold text-[1.1rem] underline my-8 tracking-wider" style={{ color: accentColor }}>
                        ORDONNANCE
                    </div>

                    {/* Placeholder for Medications */}
                    <div className="flex-grow space-y-4 opacity-20">
                        <div className="h-2 w-3/4 bg-gray-300 rounded" />
                        <div className="h-2 w-1/2 bg-gray-300 rounded ml-4" />
                        <div className="h-2 w-2/3 bg-gray-300 rounded" />
                        <div className="h-2 w-1/3 bg-gray-300 rounded ml-4" />
                    </div>

                    {/* Footer */}
                    <div className="mt-auto pt-2 border-t border-gray-300 text-center text-[0.6rem] text-gray-600">
                        <div>{form.address || "Adresse de la clinique"}</div>
                        <div>
                            Tél: {form.phoneNumber1 || "00 00 00 00 00"}
                            {form.phoneNumber2 && ` | Mob: ${form.phoneNumber2}`}
                        </div>
                    </div>
                </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground text-center px-4 italic">
                * Cet aperçu représente approximativement l'impression finale sur papier A5.
            </p>
        </div>
    );
};
