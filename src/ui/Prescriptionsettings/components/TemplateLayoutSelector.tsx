import React from "react";
import { LayoutTemplate } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { FormData, TemplateLayout } from "../types";

const TEMPLATES: { id: TemplateLayout; label: string; desc: string; preview: React.ReactNode }[] = [
    {
        id: "bilingual",
        label: "Bilingue",
        desc: "FR + Logo + AR",
        preview: (
            <div className="flex items-start gap-0.5 text-[6px] leading-tight w-full">
                <div className="flex-1 text-left space-y-0.5">
                    <div className="bg-current rounded-sm h-1 w-8" />
                    <div className="bg-current opacity-50 rounded-sm h-0.5 w-6" />
                </div>
                <div className="w-4 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full border border-current opacity-60" />
                </div>
                <div className="flex-1 text-right space-y-0.5">
                    <div className="bg-current rounded-sm h-1 w-8 ml-auto" />
                    <div className="bg-current opacity-50 rounded-sm h-0.5 w-6 ml-auto" />
                </div>
            </div>
        ),
    },
    {
        id: "fr-only",
        label: "Français",
        desc: "FR + Logo à droite",
        preview: (
            <div className="flex items-start gap-1 text-[6px] leading-tight w-full">
                <div className="flex-1 text-left space-y-0.5">
                    <div className="bg-current rounded-sm h-1 w-10" />
                    <div className="bg-current opacity-50 rounded-sm h-0.5 w-7" />
                </div>
                <div className="w-4 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full border border-current opacity-60" />
                </div>
            </div>
        ),
    },
    {
        id: "ar-only",
        label: "Arabe",
        desc: "Logo à gauche + AR",
        preview: (
            <div className="flex items-start gap-1 text-[6px] leading-tight w-full">
                <div className="w-4 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full border border-current opacity-60" />
                </div>
                <div className="flex-1 text-right space-y-0.5">
                    <div className="bg-current rounded-sm h-1 w-10 ml-auto" />
                    <div className="bg-current opacity-50 rounded-sm h-0.5 w-7 ml-auto" />
                </div>
            </div>
        ),
    },
    {
        id: "fr-logo-left",
        label: "FR – Logo gauche",
        desc: "Logo à gauche + FR",
        preview: (
            <div className="flex items-start gap-1 text-[6px] leading-tight w-full">
                <div className="w-4 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full border border-current opacity-60" />
                </div>
                <div className="flex-1 text-left space-y-0.5">
                    <div className="bg-current rounded-sm h-1 w-10" />
                    <div className="bg-current opacity-50 rounded-sm h-0.5 w-7" />
                </div>
            </div>
        ),
    },
    {
        id: "ar-logo-right",
        label: "AR – Logo droite",
        desc: "AR + Logo à droite",
        preview: (
            <div className="flex items-start gap-1 text-[6px] leading-tight w-full">
                <div className="flex-1 text-right space-y-0.5">
                    <div className="bg-current rounded-sm h-1 w-10 ml-auto" />
                    <div className="bg-current opacity-50 rounded-sm h-0.5 w-7 ml-auto" />
                </div>
                <div className="w-4 flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full border border-current opacity-60" />
                </div>
            </div>
        ),
    },
];

export function TemplateLayoutSelector() {
    const { control, setValue } = useFormContext<FormData>();
    const templateLayout = useWatch({ control, name: "templateLayout" });

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-muted">
                <LayoutTemplate className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">Modèle de mise en page</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {TEMPLATES.map((tpl) => (
                    <button
                        key={tpl.id}
                        type="button"
                        onClick={() => setValue("templateLayout", tpl.id, { shouldValidate: true })}
                        className={`flex flex-col gap-2 p-3 rounded-lg border-2 transition-all text-left ${templateLayout === tpl.id
                                ? "border-primary bg-primary/5 text-primary"
                                : "border-muted bg-muted/20 text-muted-foreground hover:border-primary/40 hover:text-foreground"
                            }`}
                    >
                        <div className="w-full h-8 bg-background rounded border flex items-center px-2 py-1">
                            {tpl.preview}
                        </div>
                        <div>
                            <div className="text-xs font-semibold leading-tight">{tpl.label}</div>
                            <div className="text-[10px] opacity-70 leading-tight">{tpl.desc}</div>
                        </div>
                    </button>
                ))}
            </div>
        </section>
    );
}
