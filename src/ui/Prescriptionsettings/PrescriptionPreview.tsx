import React, { useRef, useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ZoomIn, ZoomOut, RotateCcw, Pencil, Check, X, RefreshCw, Move, Eye } from "lucide-react";
import type { TemplateLayout, LayoutElementId, CustomPositions } from "./types";
import { DEFAULT_ELEMENT_POSITIONS, ELEMENT_LABELS, ELEMENT_COLORS } from "./types";

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
        customPositions?: CustomPositions;
        useCustomLayout?: boolean;
    };
    services: { fr: string; ar: string }[];
    logoImage: string | null;
    onCustomLayoutChange?: (positions: CustomPositions, useCustomLayout: boolean, hidden: LayoutElementId[]) => void;
}

const ZOOM_STEP = 0.1;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 2.0;

export const PrescriptionPreview: React.FC<PrescriptionPreviewProps> = ({
    form, services, logoImage, onCustomLayoutChange,
}) => {
    const [zoom, setZoom] = useState(1.0);
    const [isDesignMode, setIsDesignMode] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Local positions — initialized from form, updated by dragging
    const [positions, setPositions] = useState<CustomPositions>(
        () => ({ ...DEFAULT_ELEMENT_POSITIONS, ...(form.customPositions ?? {}) })
    );
    const positionsRef = useRef<CustomPositions>(positions);
    useEffect(() => { positionsRef.current = positions; }, [positions]);

    // Hidden elements set
    const [hidden, setHidden] = useState<Set<LayoutElementId>>(
        () => new Set((form as any).hiddenElements ?? [])
    );
    const hiddenRef = useRef<Set<LayoutElementId>>(hidden);
    useEffect(() => { hiddenRef.current = hidden; }, [hidden]);

    const hideElement   = (id: LayoutElementId) => setHidden(prev => new Set([...prev, id]));
    const restoreElement = (id: LayoutElementId) => setHidden(prev => { const n = new Set(prev); n.delete(id); return n; });
    const resetHidden   = () => setHidden(new Set());

    // Guide lines for snapping
    const [guides, setGuides] = useState<{ x: number | null, y: number | null }>({ x: null, y: null });

    // Live drag coordinate tooltip
    const [dragCoord, setDragCoord] = useState<{ x: number; y: number } | null>(null);

    // Refs — no state updates needed for drag bookkeeping
    const paperRef = useRef<HTMLDivElement>(null);
    const dragging = useRef<{
        id: LayoutElementId;
        startMouseX: number; startMouseY: number;
        startElX: number;   startElY: number;
    } | null>(null);

    // Add/remove window mouse listeners ONLY while in design mode
    useEffect(() => {
        if (!isDesignMode) return;

        const onMove = (e: MouseEvent) => {
            const d = dragging.current;
            const paper = paperRef.current;
            if (!d || !paper) return;

            const rect = paper.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return; // Safety guard

            const dx = ((e.clientX - d.startMouseX) / rect.width)  * 100;
            const dy = ((e.clientY - d.startMouseY) / rect.height) * 100;

            let newX = Math.max(0, Math.min(90, d.startElX + dx));
            let newY = Math.max(0, Math.min(94, d.startElY + dy));

            const SNAP_THRESHOLD = 1.5; // percent
            let guideX: number | null = null;
            let guideY: number | null = null;

            // Common vertical center/fractions
            const xSnaps = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
            for (const snap of xSnaps) {
                if (Math.abs(newX - snap) < SNAP_THRESHOLD) { newX = snap; guideX = snap; break; }
            }

            // Common horizontal center/fractions
            const ySnaps = [10, 20, 25, 30, 40, 50, 60, 70, 75, 80, 90];
            for (const snap of ySnaps) {
                if (Math.abs(newY - snap) < SNAP_THRESHOLD) { newY = snap; guideY = snap; break; }
            }

            // Element snapping
            const others = Object.entries(positionsRef.current)
                .filter(([id]) => id !== d.id && !hiddenRef.current.has(id as LayoutElementId))
                .map(([_, pos]) => pos);

            if (guideX === null) {
                for (const pos of others) {
                    if (Math.abs(newX - pos.x) < SNAP_THRESHOLD) { newX = pos.x; guideX = pos.x; break; }
                }
            }

            if (guideY === null) {
                for (const pos of others) {
                    if (Math.abs(newY - pos.y) < SNAP_THRESHOLD) { newY = pos.y; guideY = pos.y; break; }
                }
            }

            setGuides({ x: guideX, y: guideY });
            setDragCoord({ x: Math.round(newX), y: Math.round(newY) });

            setPositions(prev => ({
                ...prev,
                [d.id]: {
                    x: newX,
                    y: newY,
                },
            }));
        };

        const onUp = () => { 
            dragging.current = null;
            setGuides({ x: null, y: null });
            setDragCoord(null);
        };

        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup",   onUp);
        return () => {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup",   onUp);
        };
    }, [isDesignMode]);

    const startDrag = (id: LayoutElementId, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        dragging.current = {
            id,
            startMouseX: e.clientX, startMouseY: e.clientY,
            startElX: positions[id].x, startElY: positions[id].y,
        };
    };

    // Optimitic state to bypass 300ms debounce from parent form
    const [previewState, setPreviewState] = useState<{
        useCustomLayout?: boolean;
        customPositions?: CustomPositions;
        hiddenElements?: LayoutElementId[];
    } | null>(null);

    useEffect(() => {
        // Clear optimistic state once the parent's debounced form catches up
        setPreviewState(null);
    }, [form]);

    const handleEnterDesign = () => {
        setPositions({ ...DEFAULT_ELEMENT_POSITIONS, ...(form.customPositions ?? {}) });
        setHidden(new Set((form as any).hiddenElements ?? []));
        setIsDesignMode(true);
    };
    const handleSave = () => {
        setPreviewState({ useCustomLayout: true, customPositions: positions, hiddenElements: [...hidden] });
        onCustomLayoutChange?.(positions, true, [...hidden]);
        setIsDesignMode(false);
    };
    const handleCancel = () => {
        setPositions({ ...DEFAULT_ELEMENT_POSITIONS, ...(form.customPositions ?? {}) });
        setHidden(new Set((form as any).hiddenElements ?? []));
        setIsDesignMode(false);
    };

    // ── Computed style values ──────────────────────────────────────────────
    const activeUseCustomLayout = previewState ? previewState.useCustomLayout : form.useCustomLayout;
    const activeCustomPositions = previewState ? previewState.customPositions : form.customPositions;
    const activeHiddenElements  = previewState ? previewState.hiddenElements  : (form as any).hiddenElements;

    const accentColor = form.accentColor || "#000000";
    const sc = 0.62;
    const doctorNameSize  = (form.doctorNameFontSize ?? 14) * sc;
    const specialtySize   = (form.specialtyFontSize  ?? 10) * sc;
    const titleSize       = (form.titleFontSize       ?? 18) * sc;
    const bodySize        = (form.bodyFontSize        ?? 12) * sc;
    const logoSizePx      = (form.logoSize            ?? 60) * sc;
    const watermarkOp     = (form.watermarkOpacity    ?? 10) / 100;
    const divStyle        = form.dividerStyle  ?? "solid";
    const titleText       = form.titleText     ?? "ORDONNANCE";
    const showInscNo      = form.showInscriptionNumber ?? true;
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
    const mb   = `${Math.max(20, logoSizePx * 0.4)}px`;

    // ── Normal-mode header (template switch) ───────────────────────────────
    const renderHeader = () => {
        switch (layout) {
            case "fr-only":
                return <div className="flex justify-between items-start" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="flex-1">{frBlock}</div>
                    <div className="ml-3 shrink-0">{logoBlock}</div>
                </div>;
            case "ar-only":
                return <div className="flex justify-between items-start" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="mr-3 shrink-0">{logoBlock}</div>
                    <div className="flex-1">{arBlock}</div>
                </div>;
            case "fr-logo-left":
                return <div className="flex items-center" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="pr-5 shrink-0 border-r-[1.5px]" style={{ borderColor: `${accentColor}40` }}>
                        {logoBlock}
                    </div>
                    <div className="flex-1 flex flex-col justify-center pl-5">{frBlock}</div>
                </div>;
            case "ar-logo-right":
                return <div className="flex items-center" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="flex-1 flex flex-col justify-center pr-5" dir="rtl">{arBlock}</div>
                    <div className="pl-5 shrink-0 border-l-[1.5px]" style={{ borderColor: `${accentColor}40` }}>
                        {logoBlock}
                    </div>
                </div>;
            case "bilingual-logo-left":
                return <div className="flex justify-between items-start" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="w-[20%]">{logoBlock}</div>
                    <div className="w-[40%] pl-2">{frBlock}</div>
                    <div className="w-[40%]">{arBlock}</div>
                </div>;
            case "bilingual-logo-right":
                return <div className="flex justify-between items-start" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="w-[40%]">{frBlock}</div>
                    <div className="w-[40%] pr-2">{arBlock}</div>
                    <div className="w-[20%]">{logoBlock}</div>
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
            default: // bilingual
                return <div className="flex justify-between items-start" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="w-[40%]">{frBlock}</div>
                    <div className="w-[20%] flex justify-center">{logoBlock}</div>
                    <div className="w-[40%]">{arBlock}</div>
                </div>;
        }
    };

    // ── Design-mode element definitions (memoised) ─────────────────────────
    const designElements: { id: LayoutElementId; content: React.ReactNode; fullWidth?: boolean }[] = useMemo(() => [
        {
            id: "logo",
            content: <div className="flex flex-col items-center shrink-0">{logoPart}</div>,
        },
        { id: "nameFr",      content: <div className="font-bold tracking-tight uppercase" style={{ color: accentColor, fontSize: doctorNameSize * 1.1 }}>{form.nameFr || "Nom du Docteur"}</div> },
        { id: "nameAr",      content: <div className="font-extrabold text-right tracking-tight" dir="rtl" style={{ color: accentColor, fontSize: doctorNameSize * 1.15 }}>{form.nameAr || "اسم الطبيب"}</div> },
        { id: "specialtyFr", content: <div className="flex flex-col gap-1.5"><div className="font-semibold uppercase tracking-widest" style={{ fontSize: specialtySize * 0.9, color: "#475569" }}>{form.specialtyFr || "Spécialité"}</div>{services.length > 0 && <div className="flex flex-col gap-0.5 border-l-[1.5px] pl-2.5 py-0.5" style={{ borderColor: `${accentColor}60` }}>{services.map((s, i) => <div key={i} className="text-slate-600 leading-tight" style={{ fontSize: specialtySize * 0.85 }}>{s.fr}</div>)}</div>}</div> },
        { id: "specialtyAr", content: <div className="flex flex-col gap-1.5 text-right" dir="rtl"><div className="font-semibold" style={{ fontSize: specialtySize * 0.95, color: "#475569" }}>{form.specialtyAr || "التخصص"}</div>{services.length > 0 && <div className="flex flex-col gap-0.5 border-r-[1.5px] pr-2.5 py-0.5" style={{ borderColor: `${accentColor}60` }}>{services.map((s, i) => <div key={i} className="text-slate-600 leading-tight" style={{ fontSize: specialtySize * 0.85 }}>{s.ar}</div>)}</div>}</div> },
        { id: "inscription", content: <div className="text-[0.45rem] font-medium tracking-widest uppercase px-2 py-0.5 rounded-sm" style={{ color: accentColor, backgroundColor: `${accentColor}08`, display: 'inline-block', WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>N° Ordre: {form.inscriptionNumber || "0000"}</div> },
        { id: "divider",     content: <div style={{ width: "100%", borderBottom: divStyle === "double" ? "2px double" : `0.5px ${divStyle}`, borderColor: accentColor, opacity: 0.7 }} />, fullWidth: true },
        { id: "title",       content: <div className="font-bold tracking-[0.2em] uppercase px-4 pb-1 inline-block text-center w-full" style={{ color: accentColor, fontSize: titleSize, borderBottom: `1px solid ${accentColor}40` }}>{titleText}</div> },
        { id: "patientInfo", content: <div className="flex flex-col gap-3 w-full" style={{ fontSize: bodySize }}><div className="flex items-end gap-2"><strong style={{ color: accentColor, fontSize: bodySize * 0.9, textTransform: "uppercase", letterSpacing: "0.05em" }}>Nom :</strong><div className="flex-1 border-b border-slate-300" style={{ height: bodySize }}></div></div><div className="flex items-end gap-2 w-[70%]"><strong style={{ color: accentColor, fontSize: bodySize * 0.9, textTransform: "uppercase", letterSpacing: "0.05em" }}>Âge :</strong><div className="flex-1 border-b border-slate-300" style={{ height: bodySize }}></div></div></div> },
        { id: "dateCity",    content: <div className="flex items-end gap-2 w-full" style={{ fontSize: bodySize }}><span style={{ fontSize: bodySize * 0.9, color: "#475569" }}>{form.city || "Ville"}, le</span><div className="flex-1 border-b border-slate-300" style={{ height: bodySize }}></div></div>, },
        { id: "footer",      content: <div className="text-center pt-3 w-full" style={{ borderTop: `0.5px solid ${accentColor}40` }}><div className="font-medium tracking-wide" style={{ fontSize: "0.65rem", color: "#334155" }}>{form.address || "Adresse"}</div><div className="mt-0.5" style={{ fontSize: "0.6rem", color: "#64748b" }}>Tél: <span className="font-medium">{form.phoneNumber1}</span>{form.phoneNumber2 && <span className="mx-1">|</span>}{form.phoneNumber2 && <span className="font-medium">Mob: {form.phoneNumber2}</span>}</div></div>, fullWidth: true },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [form.nameFr, form.nameAr, form.specialtyFr, form.specialtyAr, form.inscriptionNumber, form.address, form.phoneNumber1, form.phoneNumber2, form.city, accentColor, doctorNameSize, specialtySize, titleSize, bodySize, divStyle, titleText, logoSizePx, showInscNo, services]);

    const isLayoutCustomized = useMemo(() => {
        if (activeUseCustomLayout) return true;
        if (hidden.size > 0) return true;
        for (const key in DEFAULT_ELEMENT_POSITIONS) {
            const id = key as LayoutElementId;
            if (positions[id] && (positions[id].x !== DEFAULT_ELEMENT_POSITIONS[id].x || positions[id].y !== DEFAULT_ELEMENT_POSITIONS[id].y)) {
                return true;
            }
        }
        return false;
    }, [activeUseCustomLayout, hidden, positions]);

    return (
        <div className="sticky top-8">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Merriweather:wght@400;700&family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap');`}</style>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-lg font-semibold">Aperçu en direct</h3>
                <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => setShowResetConfirm(true)} title="Tout réinitialiser"
                        disabled={!isLayoutCustomized}
                        className={`p-1.5 rounded border transition-colors ${
                            isLayoutCustomized
                                ? "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 text-amber-600"
                                : "border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed"
                        }`}>
                        <RefreshCw className="w-4 h-4" />
                    </button>

                    {!isDesignMode ? (
                        <button type="button" onClick={handleEnterDesign}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
                            <Pencil className="w-3 h-3" /> Personnaliser
                        </button>
                    ) : (
                        <div className="flex items-center gap-1">
                            <button type="button" onClick={handleCancel}
                                className="text-xs px-2 py-1.5 rounded border border-gray-300 hover:bg-gray-100 transition-colors flex items-center gap-1">
                                <X className="w-3 h-3" /> Annuler
                            </button>
                            <button type="button" onClick={handleSave}
                                className="text-xs px-2.5 py-1.5 rounded bg-green-600 text-white hover:bg-green-700 transition-colors font-medium flex items-center gap-1">
                                <Check className="w-3 h-3" /> Sauvegarder
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Reset-to-normal confirmation dialog */}
            {showResetConfirm && typeof document !== "undefined" && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
                    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl p-6 max-w-sm w-full mx-4 border border-amber-200">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                                <X className="w-5 h-5 text-amber-600" />
                            </div>
                            <h4 className="font-semibold text-base text-gray-900 dark:text-gray-100">Revenir au modèle normal ?</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
                            Cette action supprimera votre mise en page personnalisée (glisser-déposer). Cette opération est irréversible.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                type="button"
                                onClick={() => setShowResetConfirm(false)}
                                className="px-4 py-1.5 rounded-md border border-gray-300 text-sm hover:bg-gray-100 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowResetConfirm(false);
                                    setPositions({ ...DEFAULT_ELEMENT_POSITIONS });
                                    setHidden(new Set());
                                    setIsDesignMode(false);
                                    setPreviewState({ useCustomLayout: false, customPositions: DEFAULT_ELEMENT_POSITIONS, hiddenElements: [] });
                                    onCustomLayoutChange?.(DEFAULT_ELEMENT_POSITIONS, false, []);
                                }}
                                className="px-4 py-1.5 rounded-md bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition-colors"
                            >
                                Oui, réinitialiser
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {isDesignMode && (
                <p className="text-[10px] text-blue-500 text-center mb-2 italic">
                    ✦ Glissez les éléments colorés pour composer votre mise en page
                </p>
            )}

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
                {/* Outer scaled wrapper */}
                <div
                    className="bg-white text-black shadow-2xl rounded-sm mx-auto relative transition-all duration-200"
                    style={{
                        width: "100%", maxWidth: "550px",
                        aspectRatio: "1 / 1.414",
                        fontSize: bodySize, fontFamily,
                        border: isDesignMode ? "2px solid #3b82f6" : "1px solid #e2e8f0",
                        transform: `scale(${zoom})`, transformOrigin: "top center",
                        overflow: isDesignMode ? "visible" : "hidden",
                    }}
                >
                    {/* Watermark */}
                    {logoImage && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: watermarkOp }}>
                            <img src={logoImage} alt="" className="w-1/2 object-contain" />
                        </div>
                    )}

                    {isDesignMode ? (
                        // ── DESIGN CANVAS ──────────────────────────────────
                        <div
                            ref={paperRef}
                            className="absolute inset-0"
                            style={{
                                backgroundImage: "radial-gradient(circle, #94a3b860 1.5px, transparent 1.5px)",
                                backgroundSize: "4% 4%",
                            }}
                        >
                            {/* ── Simple ruler strip ── */}
                            <div style={{
                                position: "absolute", top: 0, left: 0, right: 0,
                                height: 12, pointerEvents: "none", zIndex: 40,
                                background: "rgba(15,23,42,0.55)",
                                backdropFilter: "blur(2px)",
                            }}>
                                {[0, 25, 50, 75, 100].map(pct => (
                                    <div key={pct} style={{
                                        position: "absolute",
                                        left: `${pct}%`,
                                        top: 0, bottom: 0,
                                        display: "flex", flexDirection: "column", alignItems: "center",
                                    }}>
                                        <div style={{ width: 1, height: pct === 50 ? 10 : 7, background: pct === 50 ? "#60a5fa" : "#94a3b8" }} />
                                        <span style={{
                                            position: "absolute", top: 2, left: pct === 0 ? 2 : pct === 100 ? undefined : -6,
                                            right: pct === 100 ? 2 : undefined,
                                            fontSize: 5.5, color: pct === 50 ? "#93c5fd" : "#94a3b8",
                                            fontFamily: "monospace", lineHeight: 1,
                                        }}>{pct}%</span>
                                    </div>
                                ))}
                            </div>

                            {/* Snap guidelines */}
                            {guides.x !== null && (
                                <div className="absolute top-0 bottom-0 z-20 pointer-events-none" style={{ left: `${guides.x}%`, width: '1px', backgroundColor: '#e8115b', boxShadow: '0 0 4px #e8115b80' }} />
                            )}
                            {guides.y !== null && (
                                <div className="absolute left-0 right-0 z-20 pointer-events-none" style={{ top: `${guides.y}%`, height: '1px', backgroundColor: '#e8115b', boxShadow: '0 0 4px #e8115b80' }} />
                            )}
                            {/* Subtle center crosshair */}
                            <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: '50%', width: 1, background: 'rgba(96,165,250,0.2)' }} />
                            <div className="absolute left-0 right-0 pointer-events-none" style={{ top: '50%', height: 1, background: 'rgba(96,165,250,0.2)' }} />

                            {designElements.filter(({ id }) => !hidden.has(id)).map(({ id, content, fullWidth }) => {
                                const pos = positions[id];
                                const color = ELEMENT_COLORS[id];
                                const isBeingDragged = dragging.current?.id === id;
                                return (
                                    <div
                                        key={id}
                                        onMouseDown={(e) => startDrag(id, e)}
                                        style={{
                                            position: "absolute",
                                            left: `${pos.x}%`,
                                            top: `${pos.y}%`,
                                            width: fullWidth ? "100%" : undefined,
                                            cursor: "grab",
                                            userSelect: "none",
                                            zIndex: isBeingDragged ? 50 : 10,
                                            maxWidth: fullWidth ? "100%" : "45%",
                                        }}
                                    >
                                        {/* Label + X button */}
                                        <div style={{
                                            position: "absolute", top: -14, left: 0,
                                            background: color, color: "#fff",
                                            fontSize: 6, padding: "1px 2px 1px 4px", borderRadius: 2,
                                            fontFamily: "sans-serif", fontWeight: 700, whiteSpace: "nowrap",
                                            display: "flex", alignItems: "center", gap: 2,
                                        }}>
                                            <Move style={{ width: 6, height: 6, pointerEvents: "none" }} />
                                            <span style={{ pointerEvents: "none" }}>{ELEMENT_LABELS[id]}</span>
                                            {/* X to hide */}
                                            <button
                                                type="button"
                                                onMouseDown={(e) => e.stopPropagation()}
                                                onClick={(e) => { e.stopPropagation(); hideElement(id); }}
                                                style={{
                                                    marginLeft: 2, background: "rgba(0,0,0,0.25)",
                                                    border: "none", borderRadius: 2, cursor: "pointer",
                                                    color: "#fff", padding: "0 2px", lineHeight: 1,
                                                    display: "flex", alignItems: "center",
                                                }}
                                                title="Masquer cet élément"
                                            >
                                                <X style={{ width: 6, height: 6 }} />
                                            </button>
                                        </div>
                                        {/* Content box */}
                                        <div style={{
                                            border: `1.5px dashed ${color}`,
                                            borderRadius: 3,
                                            padding: "2px 3px",
                                            background: `${color}10`,
                                        }}>
                                            {content}
                                        </div>
                                        {/* Coordinate badge — only while dragging */}
                                        {isBeingDragged && dragCoord && (
                                            <div style={{
                                                position: "absolute", top: -26, left: 0,
                                                background: "#0f172a", color: "#f8fafc",
                                                fontSize: 6, padding: "2px 4px", borderRadius: 3,
                                                fontFamily: "monospace", whiteSpace: "nowrap",
                                                pointerEvents: "none", zIndex: 60,
                                                boxShadow: "0 1px 4px rgba(0,0,0,0.4)",
                                            }}>
                                                x: {dragCoord.x}% · y: {dragCoord.y}%
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                            {/* Hidden elements restore tray */}
                            {hidden.size > 0 && (
                                <div style={{
                                    position: "absolute", bottom: 4, left: 4, right: 4,
                                    background: "rgba(255,255,255,0.92)",
                                    border: "1px solid #e2e8f0", borderRadius: 4,
                                    padding: "3px 4px",
                                    display: "flex", flexWrap: "wrap", gap: 3,
                                    zIndex: 30,
                                }}>
                                    <span style={{ fontSize: 6, color: "#6b7280", fontFamily: "sans-serif", alignSelf: "center" }}>Masqués :</span>
                                    {[...hidden].map(id => (
                                        <button
                                            key={id}
                                            type="button"
                                            onClick={() => restoreElement(id)}
                                            style={{
                                                background: ELEMENT_COLORS[id], color: "#fff",
                                                border: "none", borderRadius: 2, cursor: "pointer",
                                                fontSize: 6, padding: "1px 4px",
                                                fontFamily: "sans-serif", fontWeight: 700,
                                                display: "flex", alignItems: "center", gap: 2,
                                            }}
                                            title="Restaurer"
                                        >
                                            <Eye style={{ width: 6, height: 6 }} />
                                            {ELEMENT_LABELS[id]}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : activeUseCustomLayout && activeCustomPositions ? (
                        // ── CUSTOM SAVED LAYOUT ────────────────────────────
                        <div className="absolute inset-0">
                            {designElements.filter(({ id }) => !activeHiddenElements?.includes(id)).map(({ id, content, fullWidth }) => {
                                const pos = (activeCustomPositions ?? DEFAULT_ELEMENT_POSITIONS)[id];
                                if (!pos) return null;
                                return (
                                    <div
                                        key={id}
                                        style={{
                                            position: "absolute",
                                            left: `${pos.x}%`,
                                            top: `${pos.y}%`,
                                            width: fullWidth ? "100%" : undefined,
                                            maxWidth: fullWidth ? "100%" : "45%",
                                            pointerEvents: "none",
                                        }}
                                    >
                                        {content}
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        // ── NORMAL TEMPLATE PREVIEW ────────────────────────
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
                    )}
                </div>
            </div>

            <p className="mt-4 text-xs text-muted-foreground text-center px-4 italic">
                {isDesignMode
                    ? "* Mode conception — glissez les éléments, puis cliquez Sauvegarder."
                    : "* Aperçu approximatif de l'impression finale sur papier A5."}
            </p>
        </div>
    );
};
