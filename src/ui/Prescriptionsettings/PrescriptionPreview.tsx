import React, { useRef, useState, useEffect, useMemo } from "react";
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
        ? <img src={logoImage} alt="Logo" className="object-contain" style={{ width: logoSizePx, height: logoSizePx }} />
        : <div className="bg-gray-100 rounded flex items-center justify-center text-gray-400"
               style={{ width: logoSizePx, height: logoSizePx, fontSize: "0.4rem" }}>LOGO</div>;

    const frBlock = (
        <div className="text-left">
            <div className="font-bold leading-tight mb-0.5" style={{ color: accentColor, fontSize: doctorNameSize }}>{form.nameFr || "Nom du Docteur"}</div>
            <div className="text-gray-600 leading-tight mb-0.5" style={{ fontSize: specialtySize }}>{form.specialtyFr || "Spécialité"}</div>
            {services.map((s, i) => <div key={i} className="text-gray-700" style={{ fontSize: specialtySize * 0.9 }}>{s.fr}</div>)}
        </div>
    );
    const arBlock = (
        <div className="text-right" dir="rtl">
            <div className="font-bold leading-tight mb-0.5" style={{ color: accentColor, fontSize: doctorNameSize }}>{form.nameAr || "اسم الطبيب"}</div>
            <div className="text-gray-600 leading-tight mb-0.5" style={{ fontSize: specialtySize }}>{form.specialtyAr || "التخصص"}</div>
            {services.map((s, i) => <div key={i} className="text-gray-700" style={{ fontSize: specialtySize * 0.9 }}>{s.ar}</div>)}
        </div>
    );
    const logoBlock = (
        <div className="flex flex-col items-center justify-center mt-1">
            {logoPart}
            {showInscNo && <div className="text-[0.5rem] whitespace-nowrap mt-1 font-semibold" style={{ color: accentColor }}>N° Ordre : {form.inscriptionNumber || "0000"}</div>}
        </div>
    );

    const minH = `${Math.max(40, logoSizePx + 10)}px`;
    const mb   = `${Math.max(16, logoSizePx * 0.35)}px`;

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
                return <div className="flex items-stretch" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="flex flex-col items-center justify-center px-2 shrink-0"
                         style={{ width: logoSizePx + 16, borderRight: `2px solid ${accentColor}` }}>
                        {logoPart}
                        {showInscNo && <div className="text-[0.45rem] mt-1 whitespace-nowrap font-semibold" style={{ color: accentColor }}>N° Ordre : {form.inscriptionNumber || "0000"}</div>}
                    </div>
                    <div className="flex-1 flex flex-col justify-center pl-3">{frBlock}</div>
                </div>;
            case "ar-logo-right":
                return <div className="flex items-stretch" style={{ marginBottom: mb, minHeight: minH }}>
                    <div className="flex-1 flex flex-col justify-center pr-3" dir="rtl">{arBlock}</div>
                    <div className="flex flex-col items-center justify-center px-2 shrink-0"
                         style={{ width: logoSizePx + 16, borderLeft: `2px solid ${accentColor}` }}>
                        {logoPart}
                        {showInscNo && <div className="text-[0.45rem] mt-1 whitespace-nowrap font-semibold" style={{ color: accentColor }}>N° Ordre : {form.inscriptionNumber || "0000"}</div>}
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
            content: <div className="flex flex-col items-center">{logoPart}</div>,
        },
        { id: "nameFr",      content: <div className="font-bold" style={{ color: accentColor, fontSize: doctorNameSize }}>{form.nameFr || "Nom du Docteur"}</div> },
        { id: "nameAr",      content: <div className="font-bold text-right" dir="rtl" style={{ color: accentColor, fontSize: doctorNameSize }}>{form.nameAr || "اسم الطبيب"}</div> },
        { id: "specialtyFr", content: <div style={{ fontSize: specialtySize, color: "#4b5563" }}>{form.specialtyFr || "Spécialité"}{services.map((s, i) => <div key={i} style={{ fontSize: specialtySize * 0.9 }}>{s.fr}</div>)}</div> },
        { id: "specialtyAr", content: <div dir="rtl" className="text-right" style={{ fontSize: specialtySize, color: "#4b5563" }}>{form.specialtyAr || "التخصص"}{services.map((s, i) => <div key={i} style={{ fontSize: specialtySize * 0.9 }}>{s.ar}</div>)}</div> },
        { id: "inscription", content: <div style={{ fontSize: "0.5rem", color: accentColor }}>N° {form.inscriptionNumber || "0000"}</div> },
        { id: "divider",     content: <div style={{ width: "100%", borderBottom: divStyle === "double" ? "3px double #9ca3af" : `1px ${divStyle} #9ca3af` }} />, fullWidth: true },
        { id: "title",       content: <div className="font-bold underline tracking-wider text-center" style={{ color: accentColor, fontSize: titleSize }}>{titleText}</div> },
        { id: "patientInfo", content: <div style={{ fontSize: bodySize }}><div><strong>Nom :</strong> ................................</div><div><strong>Âge :</strong> .........</div></div> },
        { id: "dateCity",    content: <div style={{ fontSize: bodySize }}>{form.city || "Ville"}, le : ...</div>, },
        { id: "footer",      content: <div className="text-center text-gray-600" style={{ fontSize: "0.6rem", borderTop: "1px solid #d1d5db", paddingTop: 2 }}><div>{form.address || "Adresse"}</div><div>{form.phoneNumber1}{form.phoneNumber2 && ` | ${form.phoneNumber2}`}</div></div>, fullWidth: true },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ], [form.nameFr, form.nameAr, form.specialtyFr, form.specialtyAr, form.inscriptionNumber, form.address, form.phoneNumber1, form.phoneNumber2, form.city, accentColor, doctorNameSize, specialtySize, titleSize, bodySize, divStyle, titleText, logoSizePx, showInscNo, services]);

    return (
        <div className="sticky top-8">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Lora:ital,wght@0,400;0,600;0,700;1,400&family=Merriweather:wght@400;700&family=Montserrat:wght@400;600;700&family=Playfair+Display:wght@400;600;700&family=Roboto:wght@400;500;700&display=swap');`}</style>

            {/* Toolbar */}
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="text-lg font-semibold">Aperçu en direct</h3>
                <div className="flex items-center gap-1.5">
                    <button type="button" onClick={() => setShowResetConfirm(true)} title="Tout réinitialiser"
                        className="p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 transition-colors text-amber-600">
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
            {showResetConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
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
                </div>
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
                            {/* Guidelines */}
                            {guides.x !== null && (
                                <div className="absolute top-0 bottom-0 z-0 pointer-events-none" style={{ left: `${guides.x}%`, width: '1px', backgroundColor: '#e8115b', boxShadow: '0 0 3px #e8115b60' }} />
                            )}
                            {guides.y !== null && (
                                <div className="absolute left-0 right-0 z-0 pointer-events-none" style={{ top: `${guides.y}%`, height: '1px', backgroundColor: '#e8115b', boxShadow: '0 0 3px #e8115b60' }} />
                            )}

                            {designElements.filter(({ id }) => !hidden.has(id)).map(({ id, content, fullWidth }) => {
                                const pos = positions[id];
                                const color = ELEMENT_COLORS[id];
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
                                            zIndex: 10,
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
                        <div className="p-6 h-full flex flex-col">
                            {renderHeader()}
                            {divStyle !== "none" && (
                                <div className="my-2" style={{ borderBottom: divStyle === "double" ? "3px double #9ca3af" : `1px ${divStyle} #9ca3af` }} />
                            )}
                            <div className="flex justify-between mt-4" style={{ fontSize: bodySize }}>
                                <div className="space-y-1">
                                    <div><strong>Nom :</strong> ......................................</div>
                                    <div><strong>Âge :</strong> ...........</div>
                                </div>
                                <div className="text-right"><div>{form.city || "Ville"}, le : ....................</div></div>
                            </div>
                            <div className="text-center font-bold underline my-8 tracking-wider" style={{ color: accentColor, fontSize: titleSize }}>{titleText}</div>
                            <div className="flex-grow space-y-4 opacity-20">
                                <div className="h-2 w-3/4 bg-gray-300 rounded" /><div className="h-2 w-1/2 bg-gray-300 rounded ml-4" />
                                <div className="h-2 w-2/3 bg-gray-300 rounded" /><div className="h-2 w-1/3 bg-gray-300 rounded ml-4" />
                            </div>
                            <div className="mt-auto pt-2 border-t border-gray-300 text-center text-[0.6rem] text-gray-600">
                                <div>{form.address || "Adresse de la clinique"}</div>
                                <div>Tél: {form.phoneNumber1 || "00 00 00 00 00"}{form.phoneNumber2 && ` | Mob: ${form.phoneNumber2}`}</div>
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
