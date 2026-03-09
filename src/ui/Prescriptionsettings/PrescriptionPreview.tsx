//preview

import React, { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { TemplateLayout } from "./types";

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
        templateLayout?: TemplateLayout;
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
    const templateLayout: TemplateLayout = form.templateLayout || "bilingual";

    // --- Reusable sub-blocks ---
    const frBlock = (
        <div className="text-left">
            <div className="font-bold leading-tight mb-1" style={{ color: accentColor, fontSize: `${doctorNameSize}px` }}>
                {form.nameFr || "Nom du Docteur"}
            </div>
            <div className="leading-tight mb-1 text-gray-600" style={{ fontSize: `${specialtySize}px` }}>
                {form.specialtyFr || "Spécialité"}
            </div>
            {services.map((s, i) => (
                <div key={i} className="text-gray-700" style={{ fontSize: `${specialtySize * 0.9}px` }}>{s.fr}</div>
            ))}
        </div>
    );

    const arBlock = (
        <div className="text-right" dir="rtl">
            <div className="font-bold leading-tight mb-1" style={{ color: accentColor, fontSize: `${doctorNameSize}px` }}>
                {form.nameAr || "اسم الطبيب"}
            </div>
            <div className="leading-tight mb-1 text-gray-600" style={{ fontSize: `${specialtySize}px` }}>
                {form.specialtyAr || "التخصص"}
            </div>
            {services.map((s, i) => (
                <div key={i} className="text-gray-700" style={{ fontSize: `${specialtySize * 0.9}px` }}>{s.ar}</div>
            ))}
        </div>
    );

    const logoBlock = (
        <div className="flex flex-col items-center justify-center pt-2">
            {logoImage ? (
                <img
                    src={logoImage}
                    alt="Logo"
                    className="object-contain mb-1"
                    style={{ width: `${logoSize}px`, height: `${logoSize}px` }}
                />
            ) : (
                <div
                    className="bg-gray-100 rounded flex items-center justify-center text-gray-400"
                    style={{ width: `${logoSize}px`, height: `${logoSize}px`, fontSize: "0.4rem" }}
                >
                    LOGO
                </div>
            )}
            {showInscriptionNumber && (
                <div className="text-[0.5rem] whitespace-nowrap">N° Order: {form.inscriptionNumber || "0000"}</div>
            )}
        </div>
    );

    /** Renders the correct header columns based on template */
    const renderHeader = () => {
        const minH = `${Math.max(40, logoSize + 10)}px`;
        const mb = `${Math.max(16, logoSize * 0.35)}px`;

        switch (templateLayout) {
            case "fr-only":
                return (
                    <div className="flex justify-between items-start relative" style={{ marginBottom: mb, minHeight: minH }}>
                        <div className="flex-1">{frBlock}</div>
                        <div className="ml-4 shrink-0">{logoBlock}</div>
                    </div>
                );
            case "ar-only":
                return (
                    <div className="flex justify-between items-start relative" style={{ marginBottom: mb, minHeight: minH }}>
                        <div className="mr-4 shrink-0">{logoBlock}</div>
                        <div className="flex-1">{arBlock}</div>
                    </div>
                );
            case "fr-logo-left":
                return (
                    <div
                        className="flex items-stretch relative overflow-hidden"
                        style={{ marginBottom: mb, minHeight: minH }}
                    >
                        {/* Logo panel */}
                        <div
                            className="flex flex-col items-center justify-center px-2 py-2 shrink-0"
                            style={{ width: `${logoSize + 16}px`, borderRight: `2px solid ${accentColor}` }}
                        >
                            {logoImage ? (
                                <img src={logoImage} alt="Logo" className="object-contain" style={{ width: `${logoSize}px`, height: `${logoSize}px` }} />
                            ) : (
                                <div className="flex items-center justify-center rounded text-gray-400 bg-white" style={{ width: `${logoSize}px`, height: `${logoSize}px`, fontSize: "0.4rem" }}>LOGO</div>
                            )}
                            {showInscriptionNumber && (
                                <div className="text-[0.45rem] text-center mt-1 whitespace-nowrap" style={{ color: accentColor }}>N° {form.inscriptionNumber || "0000"}</div>
                            )}
                        </div>
                        {/* French info */}
                        <div className="flex-1 flex flex-col justify-center pl-3 py-2">
                            <div className="font-bold leading-tight mb-1" style={{ color: accentColor, fontSize: `${doctorNameSize}px` }}>
                                {form.nameFr || "Nom du Docteur"}
                            </div>
                            <div className="leading-tight mb-1 text-gray-600" style={{ fontSize: `${specialtySize}px` }}>
                                {form.specialtyFr || "Spécialité"}
                            </div>
                            {services.map((s, i) => (
                                <div key={i} className="text-gray-700" style={{ fontSize: `${specialtySize * 0.9}px` }}>{s.fr}</div>
                            ))}
                        </div>
                    </div>
                );
            case "ar-logo-right":
                return (
                    <div
                        className="flex items-stretch relative overflow-hidden"
                        style={{ marginBottom: mb, minHeight: minH }}
                    >
                        {/* Arabic info */}
                        <div className="flex-1 flex flex-col justify-center pr-3 py-2 text-right" dir="rtl">
                            <div className="font-bold leading-tight mb-1" style={{ color: accentColor, fontSize: `${doctorNameSize}px` }}>
                                {form.nameAr || "اسم الطبيب"}
                            </div>
                            <div className="leading-tight mb-1 text-gray-600" style={{ fontSize: `${specialtySize}px` }}>
                                {form.specialtyAr || "التخصص"}
                            </div>
                            {services.map((s, i) => (
                                <div key={i} className="text-gray-700" style={{ fontSize: `${specialtySize * 0.9}px` }}>{s.ar}</div>
                            ))}
                        </div>
                        {/* Logo panel */}
                        <div
                            className="flex flex-col items-center justify-center px-2 py-2 shrink-0"
                            style={{ width: `${logoSize + 16}px`, borderLeft: `2px solid ${accentColor}` }}
                        >
                            {logoImage ? (
                                <img src={logoImage} alt="Logo" className="object-contain" style={{ width: `${logoSize}px`, height: `${logoSize}px` }} />
                            ) : (
                                <div className="flex items-center justify-center rounded text-gray-400 bg-white" style={{ width: `${logoSize}px`, height: `${logoSize}px`, fontSize: "0.4rem" }}>LOGO</div>
                            )}
                            {showInscriptionNumber && (
                                <div className="text-[0.45rem] text-center mt-1 whitespace-nowrap" style={{ color: accentColor }}>N° {form.inscriptionNumber || "0000"}</div>
                            )}
                        </div>
                    </div>
                );
            case "bilingual":
            default:
                return (
                    <div className="flex justify-between items-start relative" style={{ marginBottom: mb, minHeight: minH }}>
                        <div className="w-[40%]">{frBlock}</div>
                        <div className="w-[20%] flex flex-col items-center justify-center pt-2">{logoBlock}</div>
                        <div className="w-[40%]">{arBlock}</div>
                    </div>
                );
        }
    };

    return (
        <div className="sticky top-8">
            <h3 className="text-lg font-semibold mb-4 text-center">Aperçu en direct</h3>

            {/* Zoom controls */}
            <div className="flex items-center justify-center gap-2 mb-3">
                <button
                    type="button"
                    onClick={zoomOut}
                    disabled={zoom <= ZOOM_MIN}
                    className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Zoom arrière"
                >
                    <ZoomOut className="h-4 w-4" />
                </button>
                <button
                    type="button"
                    onClick={zoomReset}
                    className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs font-medium min-w-[3.5rem] transition-colors"
                    title="Réinitialiser le zoom"
                >
                    {Math.round(zoom * 100)}%
                </button>
                <button
                    type="button"
                    onClick={zoomIn}
                    disabled={zoom >= ZOOM_MAX}
                    className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Zoom avant"
                >
                    <ZoomIn className="h-4 w-4" />
                </button>
                {zoom !== ZOOM_DEFAULT && (
                    <button
                        type="button"
                        onClick={zoomReset}
                        className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ml-1"
                        title="Réinitialiser"
                    >
                        <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Scrollable zoom container */}
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
                        {/* Watermark */}
                        {logoImage && (
                            <div
                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                style={{ opacity: watermarkOpacity }}
                            >
                                <img src={logoImage} alt="" className="w-1/2 object-contain" />
                            </div>
                        )}

                        {/* Header — template-aware */}
                        {renderHeader()}

                        {dividerStyle !== "none" && (
                            <div
                                className="my-2"
                                style={{
                                    borderBottom: dividerStyle === "double"
                                        ? "3px double #9ca3af"
                                        : `1px ${dividerStyle} #9ca3af`,
                                }}
                            />
                        )}

                        {/* Patient Info Section */}
                        <div className="flex justify-between mt-4" style={{ fontSize: `${bodySize}px` }}>
                            <div className="space-y-1">
                                <div><strong>Nom :</strong> ........................................</div>
                                <div><strong>Âge :</strong> ...........</div>
                            </div>
                            <div className="text-right">
                                <div>{form.city || "Ville"}, le : ....................</div>
                            </div>
                        </div>

                        {/* Title */}
                        <div
                            className="text-center font-bold underline my-8 tracking-wider"
                            style={{ color: accentColor, fontSize: `${titleSize}px` }}
                        >
                            {titleText}
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
            </div>
            <p className="mt-4 text-xs text-muted-foreground text-center px-4 italic">
                * Cet aperçu représente approximativement l'impression finale sur papier A5.
            </p>
        </div>
    );
};
