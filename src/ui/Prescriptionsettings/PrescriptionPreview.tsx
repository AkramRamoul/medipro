import React, { useState, useMemo } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import type { TemplateLayout } from "./types";

interface PrescriptionPreviewProps {
    form: {
        nameFr: string; nameAr: string;
        specialtyFr: string; specialtyAr: string;
        inscriptionNumber: string; address: string;
        phoneNumber1: string; phoneNumber2: string; city: string;
        accentColor?: string;
        fontFamily?: "serif" | "sans-serif" | "lora" | "merriweather" | "playfair" | "inter" | "roboto" | "montserrat";
        doctorNameFontSize?: number; specialtyFontSize?: number;
        titleFontSize?: number; bodyFontSize?: number;
        logoSize?: number; watermarkOpacity?: number;
        dividerStyle?: "solid" | "dashed" | "double" | "none";
        titleText?: string; showInscriptionNumber?: boolean;
        templateLayout?: TemplateLayout;
    };
    services: { fr: string; ar: string }[];
    logoImage: string | null;
}

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.0;

export const PrescriptionPreview: React.FC<PrescriptionPreviewProps> = ({
    form, services, logoImage,
}) => {
    const [zoom, setZoom] = useState(1.0);

    // ── Computed style values ──────────────────────────────────────────────
    const accentColor = form.accentColor || "#000000";
    const sc = 0.62;
    const doctorNameSize = (form.doctorNameFontSize ?? 14) * sc;
    const specialtySize = (form.specialtyFontSize ?? 10) * sc;
    const titleSize = (form.titleFontSize ?? 18) * sc;
    const bodySize = (form.bodyFontSize ?? 12) * sc;
    const logoSizePx = (form.logoSize ?? 60) * sc;
    const watermarkOp = (form.watermarkOpacity ?? 10) / 100;
    const divStyle = form.dividerStyle ?? "solid";
    const titleText = form.titleText ?? "ORDONNANCE";
    const showInscNo = form.showInscriptionNumber ?? true;
    const layout: TemplateLayout = form.templateLayout ?? "bilingual";

    const fontFamily = useMemo(() => {
        const map: Record<string, string> = {
            lora: "'Lora', serif", merriweather: "'Merriweather', serif",
            playfair: "'Playfair Display', serif", inter: "'Inter', sans-serif",
            roboto: "'Roboto', sans-serif", montserrat: "'Montserrat', sans-serif",
            "sans-serif": "sans-serif",
        };
        return map[form.fontFamily ?? ""] ?? "'Amiri', serif";
    }, [form.fontFamily]);

    // ── Shared sub-blocks ──────────────────────────────────────────────────
    const logoPart = logoImage
        ? <img src={logoImage} alt="Logo" className="object-contain drop-shadow-sm" style={{ width: logoSizePx, height: logoSizePx }} />
        : <div className="bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 font-semibold tracking-widest shadow-sm"
            style={{ width: logoSizePx, height: logoSizePx, fontSize: "0.5rem" }}>LOGO</div>;

    const frBlock = (
        <div className="text-left flex flex-col justify-center">
            <div className="font-bold tracking-tight mb-1 uppercase" style={{ color: accentColor, fontSize: doctorNameSize * 1.1 }}>{form.nameFr || "Nom du Docteur"}</div>
            <div className="font-semibold mb-2 uppercase tracking-widest" style={{ fontSize: specialtySize * 0.9, color: "#475569" }}>{form.specialtyFr || "Spécialité"}</div>
            {services.length > 0 && (
                <div className="flex flex-col gap-0.5 border-l-[1.5px] pl-2.5 py-0.5" style={{ borderColor: `${accentColor}60` }}>
                    {services.map((s, i) => <div key={i} className="text-slate-600 leading-tight" style={{ fontSize: specialtySize * 0.85 }}>{s.fr}</div>)}
                </div>
            )}
        </div>
    );
    const arBlock = (
        <div className="text-right flex flex-col justify-center" dir="rtl">
            <div className="font-extrabold tracking-tight mb-1" style={{ color: accentColor, fontSize: doctorNameSize * 1.15 }}>{form.nameAr || "اسم الطبيب"}</div>
            <div className="font-semibold mb-2" style={{ fontSize: specialtySize * 0.95, color: "#475569" }}>{form.specialtyAr || "التخصص"}</div>
            {services.length > 0 && (
                <div className="flex flex-col gap-0.5 border-r-[1.5px] pr-2.5 py-0.5" style={{ borderColor: `${accentColor}60` }}>
                    {services.map((s, i) => <div key={i} className="text-slate-600 leading-tight" style={{ fontSize: specialtySize * 0.85 }}>{s.ar}</div>)}
                </div>
            )}
        </div>
    );
    const logoBlock = (
        <div className="flex flex-col items-center justify-center shrink-0">
            {logoPart}
            {showInscNo && (
                <div className="mt-2 text-[0.45rem] font-medium tracking-widest uppercase px-2 py-0.5 rounded-sm" style={{ color: accentColor, backgroundColor: `${accentColor}08`, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
                    N° Ordre: {form.inscriptionNumber || "0000"}
                </div>
            )}
        </div>
    );

    const minH = `${Math.max(45, logoSizePx + 15)}px`;
    const mb = `${Math.max(20, logoSizePx * 0.4)}px`;

    // ── Header (template switch) ───────────────────────────────────────────
    const renderHeader = () => {
        switch (layout) {
            case "fr-only":
                return <div className="flex justify-between items-start" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="flex-1">{frBlock}</div>
                    <div className="ml-3 pr-2 shrink-0">{logoBlock}</div>
                </div>;
            case "ar-only":
                return <div className="flex justify-between items-start" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="mr-3 pl-2 shrink-0">{logoBlock}</div>
                    <div className="flex-1">{arBlock}</div>
                </div>;
            case "fr-logo-left":
                return <div className="flex justify-between items-start" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="pl-4 pr-4 mt-2 shrink-0">
                        {logoBlock}
                    </div>
                    <div className="flex-1 flex justify-end pl-4 mt-2">{frBlock}</div>
                </div>;
            case "ar-logo-right":
                return <div className="flex justify-between items-start" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="flex-1 flex justify-start pr-4 mt-2" dir="rtl">{arBlock}</div>
                    <div className="pl-4 pr-4 mt-2 shrink-0">
                        {logoBlock}
                    </div>
                </div>;
            case "bilingual-logo-left":
                return <div className="flex justify-between items-start" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="w-[20%] pr-2">{logoBlock}</div>
                    <div className="w-[40%] pl-2">{frBlock}</div>
                    <div className="w-[40%]">{arBlock}</div>
                </div>;
            case "bilingual-logo-right":
                return <div className="flex justify-between items-start" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="w-[40%]">{frBlock}</div>
                    <div className="w-[40%] pr-2">{arBlock}</div>
                    <div className="w-[20%] pl-2">{logoBlock}</div>
                </div>;
            case "centered":
                return <div className="flex flex-col items-center w-full" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="mb-3">{logoBlock}</div>
                    <div className="flex justify-between w-full">
                        <div className="w-[45%] text-center flex flex-col items-center">
                            <div className="font-bold" style={{ color: accentColor, fontSize: doctorNameSize }}>{form.nameFr || "Nom du Docteur"}</div>
                            <div className="text-gray-600" style={{ fontSize: specialtySize }}>{form.specialtyFr || "Spécialité"}</div>
                        </div>
                        <div className="w-[45%] text-center flex flex-col items-center" dir="rtl">
                            <div className="font-bold" style={{ color: accentColor, fontSize: doctorNameSize }}>{form.nameAr || "اسم الطبيب"}</div>
                            <div className="text-gray-600" style={{ fontSize: specialtySize }}>{form.specialtyAr || "التخصص"}</div>
                        </div>
                    </div>
                </div>;
            case "bilingual-stacked":
                return <div className="flex justify-between items-start w-full gap-4" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="w-[55%] flex flex-col items-center justify-start text-center pt-2">
                        <div className="flex flex-col items-center gap-0.5">
                            <div className="font-bold tracking-wide uppercase" style={{ color: accentColor, fontSize: doctorNameSize * 1.15 }}>{form.nameFr || "Dr NOM et Prénom"}</div>
                            <div className="font-medium" style={{ fontSize: specialtySize * 0.95, color: accentColor }}>{form.specialtyFr || "Médecin spécialiste"}</div>
                        </div>

                        {/* Elegant ornamental divider */}
                        <div className="flex items-center justify-center my-3.5 w-32 opacity-80">
                            <div className="h-[1px] flex-1" style={{ backgroundColor: accentColor }} />
                            <div className="mx-2 flex gap-1 items-center">
                                <div className="w-[3px] h-[3px] rounded-full" style={{ backgroundColor: accentColor }} />
                                <div className="w-[4.5px] h-[4.5px] rounded-full" style={{ backgroundColor: accentColor }} />
                                <div className="w-[3px] h-[3px] rounded-full" style={{ backgroundColor: accentColor }} />
                            </div>
                            <div className="h-[1px] flex-1" style={{ backgroundColor: accentColor }} />
                        </div>

                        <div className="flex flex-col items-center gap-0.5" dir="rtl">
                            <div className="font-extrabold tracking-tight" style={{ color: accentColor, fontSize: doctorNameSize * 1.25 }}>{form.nameAr || "الحكيم الإسم و اللقب"}</div>
                            <div className="font-medium" style={{ fontSize: specialtySize * 1.05, color: accentColor }}>{form.specialtyAr || "طبيب متخصص"}</div>
                        </div>
                    </div>

                    <div className="w-[45%] flex flex-col items-center justify-start pt-1 shrink-0">
                        {logoImage
                            ? <img src={logoImage} alt="Logo" className="object-contain drop-shadow-sm mb-3" style={{ width: logoSizePx, height: logoSizePx }} />
                            : <div className="bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-400 font-semibold tracking-widest shadow-sm mb-3" style={{ width: logoSizePx, height: logoSizePx, fontSize: "0.5rem" }}>LOGO</div>}

                        <div className="text-center w-full">
                            <div className="font-bold mb-0.5 tracking-wide" style={{ color: accentColor, fontSize: specialtySize * 1.1 }}>العيادة الطبية المختصة</div>
                            <div className="font-medium tracking-wide" style={{ color: accentColor, fontSize: specialtySize * 0.9 }}>Clinique Privée Spécialisée</div>
                            {showInscNo && (
                                <div className="text-[0.6rem] font-medium tracking-widest mt-1.5 opacity-80" style={{ color: accentColor }}>
                                    N° d'ordre: {form.inscriptionNumber || "0000"}
                                </div>
                            )}
                        </div>
                    </div>
                </div>;
            default: // bilingual
                return <div className="flex justify-between items-start" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="w-[40%]">{frBlock}</div>
                    <div className="w-[20%] flex justify-center">{logoBlock}</div>
                    <div className="w-[40%]">{arBlock}</div>
                </div>;
        }
    };

    return (
        <div className="sticky top-8">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Merriweather:wght@400;700&family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap');`}</style>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-lg font-semibold">Aperçu en direct</h3>
            </div>

            {/* Zoom controls */}
            <div className="flex items-center justify-center gap-2 mb-3">
                <button type="button" disabled={zoom <= ZOOM_MIN} onClick={() => setZoom(z => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
                    className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                    <ZoomOut className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => setZoom(1.0)}
                    className="px-2 py-1 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-xs font-medium min-w-[3.5rem] transition-colors">
                    {Math.round(zoom * 100)}%
                </button>
                <button type="button" disabled={zoom >= ZOOM_MAX} onClick={() => setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
                    className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 disabled:opacity-40 transition-colors">
                    <ZoomIn className="h-4 w-4" />
                </button>
                {zoom !== 1.0 && (
                    <button type="button" onClick={() => setZoom(1.0)}
                        className="p-1.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 transition-colors ml-1">
                        <RotateCcw className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>

            {/* Paper */}
            <div className="overflow-auto rounded-md" style={{ maxHeight: "70vh" }}>
                <div
                    className="bg-white text-black shadow-2xl rounded-sm mx-auto relative transition-all duration-200"
                    style={{
                        width: "100%", maxWidth: "550px",
                        aspectRatio: "1 / 1.414",
                        fontSize: bodySize, fontFamily,
                        border: "1px solid #e2e8f0",
                        transform: `scale(${zoom})`, transformOrigin: "top center",
                        overflow: "hidden",
                    }}
                >
                    {/* Watermark */}
                    {logoImage && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: watermarkOp }}>
                            <img src={logoImage} alt="" className="w-1/2 object-contain" />
                        </div>
                    )}

                    {/* Normal template preview */}
                    <div className="p-6 h-full flex flex-col relative z-10" style={{ minHeight: "100%" }}>
                        {renderHeader()}
                        {divStyle !== "none" && (
                            <div className="my-5 opacity-70" style={{ borderBottom: divStyle === "double" ? "2px double" : `0.5px ${divStyle}`, borderColor: accentColor }} />
                        )}

                        <div className="flex justify-between items-start mt-4 gap-8 w-full" style={{ fontSize: bodySize }}>
                            <div className="flex-1 flex flex-col gap-3.5">
                                <div className="flex items-end gap-2 w-full">
                                    <strong style={{ color: accentColor, fontSize: bodySize * 0.9, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nom :</strong>
                                    <div className="flex-1 border-b border-slate-300" style={{ height: bodySize }}></div>
                                </div>
                                <div className="flex items-end gap-2 w-2/3">
                                    <strong style={{ color: accentColor, fontSize: bodySize * 0.9, textTransform: "uppercase", letterSpacing: "0.05em" }}>Âge :</strong>
                                    <div className="flex-1 border-b border-slate-300" style={{ height: bodySize }}></div>
                                </div>
                            </div>
                            <div className="flex items-end gap-2 min-w-[35%]">
                                <span style={{ fontSize: bodySize * 0.9, color: "#475569" }}>{form.city || "Ville"}, le</span>
                                <div className="flex-1 border-b border-slate-300" style={{ height: bodySize }}></div>
                            </div>
                        </div>

                        <div className="w-full text-center mt-12 mb-10">
                            <span className="font-bold tracking-[0.2em] uppercase px-6 pb-2 inline-block" style={{ color: accentColor, fontSize: titleSize, borderBottom: `1px solid ${accentColor}40` }}>
                                {titleText}
                            </span>
                        </div>

                        {/* Mock Prescription Content */}
                        <div className="flex-grow flex flex-col gap-7 opacity-30 px-3 mt-4">
                            <div className="flex items-end gap-3"><div className="w-2 h-2 rounded-full border-[1.5px]" style={{ borderColor: accentColor }}></div><div className="h-0 flex-1 border-b-2 border-slate-300 border-dashed"></div></div>
                            <div className="flex items-end gap-3"><div className="w-2 h-2 rounded-full border-[1.5px]" style={{ borderColor: accentColor }}></div><div className="h-0 w-3/4 border-b-2 border-slate-300 border-dashed"></div></div>
                            <div className="flex items-end gap-3 mt-4"><div className="w-2 h-2 rounded-full border-[1.5px]" style={{ borderColor: accentColor }}></div><div className="h-0 flex-1 border-b-2 border-slate-300 border-dashed"></div></div>
                        </div>

                        <div className="mt-auto pt-4 w-full text-center" style={{ borderTop: `0.5px solid ${accentColor}30` }}>
                            <div className="font-medium tracking-wide" style={{ fontSize: "0.65rem", color: "#334155" }}>{form.address || "Adresse de la clinique"}</div>
                            <div className="mt-1" style={{ fontSize: "0.6rem", color: "#64748b" }}>Tél : <span className="font-medium">{form.phoneNumber1 || "00 00 00 00 00"}</span>{form.phoneNumber2 && <span className="mx-2 font-light">|</span>}{form.phoneNumber2 && <span>Mob : <span className="font-medium">{form.phoneNumber2}</span></span>}</div>
                        </div>
                    </div>
                </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground text-center px-4 italic">
                * Aperçu approximatif de l'impression finale sur papier A5.
            </p>
        </div>
    );
};
