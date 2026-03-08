import React from "react";
import { Layout, SlidersHorizontal, Type, Minus, Eye, EyeOff } from "lucide-react";
import { FormState } from "../types";

interface Props {
    form: FormState;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setFieldValue: (key: keyof FormState, value: any) => void;
}

export function VisualAndLayoutSettings({ form, onChange, setFieldValue }: Props) {
    return (
        <>
            {/* Personalization Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-muted">
                    <Layout className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider">Personnalisation Visuelle</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                        <label htmlFor="accentColor" className="text-sm font-medium">Couleur d'accentuation</label>
                        <div className="flex items-center gap-3">
                            <input
                                id="accentColor"
                                type="color"
                                name="accentColor"
                                value={form.accentColor}
                                onChange={onChange}
                                className="w-12 h-12 p-1 rounded-md cursor-pointer border shadow-sm"
                            />
                            <div className="flex flex-wrap gap-2">
                                {["#000000", "#2563eb", "#16a34a", "#dc2626", "#7c3aed"].map((color) => (
                                    <button
                                        key={color}
                                        type="button"
                                        title={`Couleur ${color}`}
                                        onClick={() => setFieldValue("accentColor", color)}
                                        className={`w-6 h-6 rounded-full border border-white shadow-sm ring-1 ring-black/10 transition-transform hover:scale-110 ${form.accentColor === color ? 'scale-125 ring-primary' : ''}`}
                                        style={{ backgroundColor: color }}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-[10px] text-muted-foreground">
                            Cette couleur sera utilisée pour votre nom et le titre "ORDONNANCE".
                        </p>
                    </div>

                    <div className="space-y-3">
                        <label className="text-sm font-medium">Style d'écriture</label>
                        <div className="flex p-1 bg-muted rounded-lg w-full max-w-[200px]">
                            <button
                                type="button"
                                onClick={() => setFieldValue("fontFamily", "serif")}
                                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${form.fontFamily === "serif" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Classique (Serif)
                            </button>
                            <button
                                type="button"
                                onClick={() => setFieldValue("fontFamily", "sans-serif")}
                                className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-md transition-all ${form.fontFamily === "sans-serif" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                            >
                                Moderne (Sans)
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Layout & Sizing Section */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-muted">
                    <SlidersHorizontal className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider">Mise en Page</h3>
                </div>

                {/* Font Sizes */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2">
                        <Type className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-sm font-medium">Tailles de police</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {([
                            { key: "doctorNameFontSize" as const, label: "Nom du docteur", min: 10, max: 22 },
                            { key: "specialtyFontSize" as const, label: "Spécialité", min: 8, max: 16 },
                            { key: "titleFontSize" as const, label: "Titre (ORDONNANCE)", min: 14, max: 28 },
                            { key: "bodyFontSize" as const, label: "Corps de texte", min: 8, max: 16 },
                        ]).map(({ key, label, min, max }) => (
                            <div key={key} className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <label htmlFor={`range-${key}`} className="text-xs text-muted-foreground">{label}</label>
                                    <span className="text-xs font-mono font-semibold bg-muted px-1.5 py-0.5 rounded">{form[key]}px</span>
                                </div>
                                <input
                                    id={`range-${key}`}
                                    type="range"
                                    min={min}
                                    max={max}
                                    value={form[key] as number}
                                    onChange={(e) => setFieldValue(key, Number(e.target.value))}
                                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logo & Watermark */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label htmlFor="logoSize" className="text-xs text-muted-foreground">Taille du logo</label>
                            <span className="text-xs font-mono font-semibold bg-muted px-1.5 py-0.5 rounded">{form.logoSize}px</span>
                        </div>
                        <input
                            id="logoSize"
                            type="range"
                            min={40}
                            max={120}
                            value={form.logoSize}
                            onChange={(e) => setFieldValue("logoSize", Number(e.target.value))}
                            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label htmlFor="watermarkOpacity" className="text-xs text-muted-foreground">Opacité du filigrane</label>
                            <span className="text-xs font-mono font-semibold bg-muted px-1.5 py-0.5 rounded">{form.watermarkOpacity}%</span>
                        </div>
                        <input
                            id="watermarkOpacity"
                            type="range"
                            min={0}
                            max={20}
                            value={form.watermarkOpacity}
                            onChange={(e) => setFieldValue("watermarkOpacity", Number(e.target.value))}
                            className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                    </div>
                </div>

                {/* Divider Style */}
                <div className="space-y-2">
                    <label className="text-xs text-muted-foreground flex items-center gap-1">
                        <Minus className="w-3 h-3" /> Style du séparateur
                    </label>
                    <div className="flex p-1 bg-muted rounded-lg w-full max-w-xs">
                        {([
                            { value: "solid" as const, label: "Continu" },
                            { value: "dashed" as const, label: "Tirets" },
                            { value: "double" as const, label: "Double" },
                            { value: "none" as const, label: "Aucun" },
                        ]).map(({ value, label }) => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setFieldValue("dividerStyle", value)}
                                className={`flex-1 py-1.5 px-2 text-xs font-medium rounded-md transition-all ${form.dividerStyle === value
                                    ? "bg-background shadow-sm text-foreground"
                                    : "text-muted-foreground hover:text-foreground"
                                    }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Title Text & Show N° */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label htmlFor="titleText" className="text-sm font-medium">Texte du titre</label>
                        <input
                            id="titleText"
                            type="text"
                            name="titleText"
                            value={form.titleText}
                            onChange={onChange}
                            placeholder="ORDONNANCE"
                            className="w-full p-2.5 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                        />
                    </div>
                    <div className="space-y-2">
                        <span className="text-sm font-medium block mb-1">Affichage du N° d'ordre</span>
                        <button
                            type="button"
                            onClick={() => setFieldValue("showInscriptionNumber", !form.showInscriptionNumber)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-md border transition-all text-sm font-medium w-full justify-center ${form.showInscriptionNumber
                                ? "bg-primary/10 border-primary/30 text-primary"
                                : "bg-muted/50 border-muted text-muted-foreground"
                                }`}
                        >
                            {form.showInscriptionNumber ? (
                                <><Eye className="w-4 h-4" /> Visible sur l'ordonnance</>
                            ) : (
                                <><EyeOff className="w-4 h-4" /> Masqué sur l'ordonnance</>
                            )}
                        </button>
                    </div>
                </div>
            </section>
        </>
    );
}
