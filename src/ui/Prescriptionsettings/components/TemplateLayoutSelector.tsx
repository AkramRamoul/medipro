import { LayoutTemplate, CheckCircle2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { motion, AnimatePresence } from "framer-motion";
import { FormData, TemplateLayout } from "../types";

const TEMPLATES: { id: TemplateLayout; label: string; desc: string }[] = [
    { id: "bilingual", label: "Bilingue", desc: "FR + Logo + AR" },
    { id: "fr-only", label: "Français", desc: "FR + Logo droite" },
    { id: "ar-only", label: "Arabe", desc: "Logo gauche + AR" },
    { id: "fr-logo-left", label: "FR – Logo gauche", desc: "Logo + FR" },
    { id: "ar-logo-right", label: "AR – Logo droite", desc: "AR + Logo" },
    { id: "bilingual-logo-left", label: "Bilingue FG", desc: "Logo + FR + AR" },
    { id: "bilingual-logo-right", label: "Bilingue FD", desc: "FR + AR + Logo" },
    { id: "centered", label: "Centré", desc: "Logo + Textes centrés" },
];

const MiniPreview = ({ type, active }: { type: TemplateLayout; active: boolean }) => {
    const primary = active ? "bg-primary" : "bg-slate-400 dark:bg-slate-500";
    const secondary = active ? "bg-primary/50" : "bg-slate-300 dark:bg-slate-600";
    const logoColor = active ? "bg-blue-500 dark:bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-slate-300 dark:bg-slate-600";

    const Txt = ({ w, sec }: { w: number, sec?: boolean }) => (
        <div className={`h-1 rounded-full ${sec ? secondary : primary}`} style={{ width: w }} />
    );
    const Logo = () => (
        <div className={`w-4 h-4 rounded-md flex items-center justify-center ${logoColor} shrink-0`}>
            <div className="w-1.5 h-1.5 bg-white/90 rounded-[2px]" />
        </div>
    );

    const Block = ({ align = "left" }: { align?: "left" | "right" | "center" }) => (
        <div className={`flex flex-col gap-1 w-full ${align === "right" ? "items-end" : align === "center" ? "items-center" : "items-start"}`}>
            <Txt w={16} />
            <Txt w={10} sec />
        </div>
    );

    const layouts = {
        "bilingual": (
            <div className="flex justify-between items-start w-full gap-1">
                <div className="flex-1"><Block /></div>
                <Logo />
                <div className="flex-1"><Block align="right" /></div>
            </div>
        ),
        "fr-only": (
            <div className="flex justify-between items-start w-full gap-2">
                <div className="flex-1"><Block /></div>
                <Logo />
            </div>
        ),
        "ar-only": (
            <div className="flex justify-between items-start w-full gap-2">
                <Logo />
                <div className="flex-1"><Block align="right" /></div>
            </div>
        ),
        "fr-logo-left": (
            <div className="flex items-start w-full gap-2">
                <Logo />
                <div className="flex-1 border-l border-slate-200 dark:border-slate-700 pl-2"><Block /></div>
            </div>
        ),
        "ar-logo-right": (
            <div className="flex items-start w-full gap-2">
                <div className="flex-1 border-r border-slate-200 dark:border-slate-700 pr-2"><Block align="right" /></div>
                <Logo />
            </div>
        ),
        "bilingual-logo-left": (
            <div className="flex items-start w-full gap-1.5">
                <Logo />
                <div className="flex-1"><Block /></div>
                <div className="flex-1"><Block align="right" /></div>
            </div>
        ),
        "bilingual-logo-right": (
            <div className="flex items-start w-full gap-1.5">
                <div className="flex-1"><Block /></div>
                <div className="flex-1"><Block align="right" /></div>
                <Logo />
            </div>
        ),
        "centered": (
            <div className="flex flex-col items-center w-full gap-2">
                <Logo />
                <div className="flex justify-between w-full gap-2">
                    <div className="flex-1"><Block align="center" /></div>
                    <div className="flex-1"><Block align="center" /></div>
                </div>
            </div>
        ),
    };

    return (
        <div className="w-full flex items-center justify-center h-14 bg-white dark:bg-slate-900/50 rounded-md border border-slate-100 dark:border-slate-800 p-2 shadow-sm">
            {layouts[type] || layouts["bilingual"]}
        </div>
    );
};

export function TemplateLayoutSelector() {
    const { control, setValue } = useFormContext<FormData>();
    const templateLayout = useWatch({ control, name: "templateLayout" });
    const useCustomLayout = useWatch({ control, name: "useCustomLayout" });

    return (
        <section className="space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-border/50">
                <div className="p-1.5 rounded-lg bg-primary/10">
                    <LayoutTemplate className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold text-sm tracking-wide text-foreground/90 uppercase">Mise en page de l'en-tête</h3>
            </div>

            <AnimatePresence>
                {useCustomLayout && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, height: 0 }}
                        animate={{ opacity: 1, y: 0, height: "auto" }}
                        exit={{ opacity: 0, y: -10, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-sm mb-4">
                            <LayoutTemplate className="w-5 h-5 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 leading-relaxed">
                                Vous utilisez une <strong>mise en page personnalisée (glisser-déposer)</strong>. <br />
                                Pour revenir aux modèles standards, cliquez sur l'icône de rafraîchissement au-dessus de l'aperçu.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className={`grid grid-cols-2 md:grid-cols-4 gap-3 lg:gap-4 transition-all duration-500 ${useCustomLayout ? "opacity-30 pointer-events-none grayscale-[0.8] blur-[1px]" : ""}`}
                layout
            >
                {TEMPLATES.map((tpl) => {
                    const isActive = templateLayout === tpl.id;
                    return (
                        <motion.button
                            key={tpl.id}
                            type="button"
                            disabled={!!useCustomLayout}
                            onClick={() => setValue("templateLayout", tpl.id, { shouldValidate: true })}
                            whileHover={{ y: -2, scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative group flex flex-col items-center gap-3 p-3 lg:p-4 rounded-xl border-2 text-left transition-all overflow-hidden ${isActive
                                    ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                    : "border-border/50 bg-muted/10 hover:bg-muted/50 hover:border-border hover:shadow-sm"
                                }`}
                        >
                            {/* Active background glow */}
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
                            )}

                            {/* Checkmark for active state */}
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        initial={{ scale: 0, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0, opacity: 0 }}
                                        className="absolute top-2 right-2 text-primary bg-background rounded-full"
                                    >
                                        <CheckCircle2 className="w-4 h-4" />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <MiniPreview type={tpl.id} active={isActive} />

                            <div className="w-full text-center relative z-10 pt-1">
                                <div className={`text-xs font-bold leading-tight mb-1 transition-colors ${isActive ? "text-primary" : "text-foreground/80 group-hover:text-foreground"}`}>
                                    {tpl.label}
                                </div>
                                <div className="text-[10px] text-muted-foreground font-medium leading-tight line-clamp-1">
                                    {tpl.desc}
                                </div>
                            </div>
                        </motion.button>
                    );
                })}
            </motion.div>
        </section>
    );
}

