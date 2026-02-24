import React, { useState } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";

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
        doctorNameFontSize?: number;
        specialtyFontSize?: number;
        titleFontSize?: number;
        bodyFontSize?: number;
        logoSize?: number;
        watermarkOpacity?: number;
        dividerStyle?: "solid" | "dashed" | "double" | "none";
        titleText?: string;
        showInscriptionNumber?: boolean;
        layoutTemplate?: string;
        languageMode?: "bilingual" | "fr" | "ar";
    };
    services: { fr: string; ar: string }[];
    logoImage: string | null;
}

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.0;
const ZOOM_DEFAULT = 1.0;

export const PrescriptionPreview: React.FC<PrescriptionPreviewProps> = ({
    form,
    services,
    logoImage,
}) => {
    const [zoom, setZoom] = useState(ZOOM_DEFAULT);

    const zoomIn = () => setZoom((z) => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)));
    const zoomOut = () => setZoom((z) => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)));
    const zoomReset = () => setZoom(ZOOM_DEFAULT);

    const accentColor = form.accentColor || "#000000";
    const fontFamily = form.fontFamily === "sans-serif" ? "sans-serif" : "'Amiri', serif";

    const scale = 0.62;
    const doctorNameSize = (form.doctorNameFontSize ?? 14) * scale;
    const specialtySize = (form.specialtyFontSize ?? 10) * scale;
    const titleSize = (form.titleFontSize ?? 18) * scale;
    const bodySize = (form.bodyFontSize ?? 12) * scale;
    const logoSize = (form.logoSize ?? 60) * scale;
    const watermarkOpacity = (form.watermarkOpacity ?? 10) / 100;
    const dividerStyle = form.dividerStyle || "solid";
    const titleText = form.titleText || "ORDONNANCE";
    const showInscriptionNumber = form.showInscriptionNumber ?? true;

    const layout = form.layoutTemplate || "standard";
    const langMode = form.languageMode || "bilingual";

    // Helper for rendering header sides
    const renderFrenchHeader = () => (
        <div className={`${langMode === "fr" ? "w-full text-center" : "w-[40%] text-left"}`}>
            <div className="font-bold leading-tight mb-1" style={{ color: accentColor, fontSize: `${doctorNameSize}px` }}>
                {form.nameFr || "Dr. Nom Prénom"}
            </div>
            <div className="leading-tight mb-1 text-gray-600" style={{ fontSize: `${specialtySize}px` }}>
                {form.specialtyFr || "Spécialité"}
            </div>
            {services.map((s, i) => (
                s.fr && <div key={i} className="text-gray-700" style={{ fontSize: `${specialtySize * 0.9}px` }}>{s.fr}</div>
            ))}
        </div>
    );

    const renderArabicHeader = () => (
        <div className={`${langMode === "ar" ? "w-full text-center" : "w-[40%] text-right"}`} dir="rtl">
            <div className="font-bold leading-tight mb-1" style={{ color: accentColor, fontSize: `${doctorNameSize}px` }}>
                {form.nameAr || "اسم الطبيب"}
            </div>
            <div className="leading-tight mb-1 text-gray-600" style={{ fontSize: `${specialtySize}px` }}>
                {form.specialtyAr || "التخصص"}
            </div>
            {services.map((s, i) => (
                s.ar && <div key={i} className="text-gray-700" style={{ fontSize: `${specialtySize * 0.9}px` }}>{s.ar}</div>
            ))}
        </div>
    );

    const renderLogo = (isCentered = false) => (
        <div className={`${isCentered ? "w-full" : "w-[20%]"} flex flex-col items-center justify-center`}>
            {logoImage ? (
                <img src={logoImage} alt="Logo" className="object-contain" style={{ width: `${logoSize}px`, height: `${logoSize}px` }} />
            ) : (
                <div className="bg-gray-100 rounded flex items-center justify-center text-gray-400"
                    style={{ width: `${logoSize}px`, height: `${logoSize}px`, fontSize: "0.4rem" }}>LOGO</div>
            )}
            {showInscriptionNumber && (
                <div className="text-[0.5rem] mt-1 whitespace-nowrap">N° Ordre: {form.inscriptionNumber || "0000"}</div>
            )}
        </div>
    );

    return (
        <div className="sticky top-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Aperçu en direct</h3>

            <div className="flex items-center justify-center gap-2 mb-3">
                <button type="button" onClick={zoomOut} disabled={zoom <= ZOOM_MIN} className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ZoomOut className="h-4 w-4" /></button>
                <button type="button" onClick={zoomReset} className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium min-w-[3.5rem] transition-colors">{Math.round(zoom * 100)}%</button>
                <button type="button" onClick={zoomIn} disabled={zoom >= ZOOM_MAX} className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"><ZoomIn className="h-4 w-4" /></button>
            </div>

            <div className="overflow-auto rounded-md" style={{ maxHeight: "70vh" }}>
                <div className="bg-white text-black shadow-2xl rounded-sm overflow-hidden mx-auto transition-all relative"
                    style={{
                        width: "100%",
                        aspectRatio: "1 / 1.414",
                        maxWidth: "400px",
                        fontSize: `${bodySize}px`,
                        fontFamily: fontFamily,
                        border: "1px solid #e2e8f0",
                        transform: `scale(${zoom})`,
                        transformOrigin: "top center",
                    }}>

                    <div className="p-6 h-full flex flex-col">
                        {logoImage && (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: watermarkOpacity }}>
                                <img src={logoImage} alt="" className="w-1/2 object-contain" />
                            </div>
                        )}

                        {/* Dynamic Header Based on Template & Language */}
                        <div className={`flex flex-wrap gap-4 items-start relative mb-4`} style={{ minHeight: `${logoSize}px` }}>
                            {layout === "standard" && (
                                <div className="w-full flex justify-between items-start">
                                    {(langMode === "fr" || langMode === "bilingual") && renderFrenchHeader()}
                                    {(langMode === "bilingual") && renderLogo()}
                                    {(langMode === "ar" || langMode === "bilingual") && renderArabicHeader()}
                                    {langMode !== "bilingual" && (
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2">
                                            {renderLogo(true)}
                                        </div>
                                    )}
                                </div>
                            )}

                            {layout === "logo-left" && (
                                <div className="w-full flex items-start gap-4">
                                    {renderLogo(false)}
                                    <div className="flex-1 flex justify-between gap-4">
                                        {(langMode === "fr" || langMode === "bilingual") && renderFrenchHeader()}
                                        {(langMode === "ar" || langMode === "bilingual") && renderArabicHeader()}
                                    </div>
                                </div>
                            )}

                            {layout === "logo-right" && (
                                <div className="w-full flex items-start gap-4 text-right">
                                    <div className="flex-1 flex justify-between gap-4">
                                        {(langMode === "fr" || langMode === "bilingual") && renderFrenchHeader()}
                                        {(langMode === "ar" || langMode === "bilingual") && renderArabicHeader()}
                                    </div>
                                    {renderLogo(false)}
                                </div>
                            )}
                        </div>

                        {dividerStyle !== "none" && (
                            <div className="my-2" style={{ borderBottom: dividerStyle === "double" ? "3px double #9ca3af" : `1px ${dividerStyle} #9ca3af` }} />
                        )}

                        <div className={`flex justify-between mt-4 ${langMode === "ar" ? "flex-row-reverse" : ""}`} style={{ fontSize: `${bodySize}px` }}>
                            <div className="space-y-1">
                                <div><strong>{langMode === "ar" ? "الاسم :" : "Nom :"}</strong> .............................</div>
                                <div><strong>{langMode === "ar" ? "السن :" : "Âge :"}</strong> ...........</div>
                            </div>
                            <div className={langMode === "ar" ? "text-left" : "text-right"}>
                                <div>{form.city || "Ville"}, {langMode === "ar" ? "في :" : "le :"} .................</div>
                            </div>
                        </div>

                        <div className="text-center font-bold underline my-8 tracking-wider" style={{ color: accentColor, fontSize: `${titleSize}px` }}>
                            {titleText}
                        </div>

                        <div className="flex-grow space-y-4 opacity-10">
                            {[0, 1, 2, 3].map(i => <div key={i} className={`h-2 bg-gray-400 rounded ${i % 2 === 0 ? 'w-3/4' : 'w-1/2 ml-4'}`} />)}
                        </div>

                        <div className="mt-auto pt-2 border-t border-gray-300 text-center text-[0.6rem] text-gray-600">
                            <div>{form.address || "Adresse de la clinique"}</div>
                            <div>
                                Tél: {form.phoneNumber1 || "00 00 00 00 00"}
                                {form.phoneNumber2 && ` | Mob: ${form.phoneNumber2}`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <p className="mt-4 text-xs text-muted-foreground text-center px-4 italic">
                * Aperçu approximatif A5.
            </p>
        </div>
    );
};
