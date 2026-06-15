import * as React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
    HelpCircle,
    Keyboard,
    Phone,
    Mail,
    Info,
    Clock,
    ArrowRight,
    ShieldCheck,
} from "lucide-react";

interface HelpDialogProps {
    trigger: React.ReactNode;
}

export function HelpDialog({ trigger }: HelpDialogProps) {
    const APP_VERSION = "1.0";
    const LICENSE_TYPE = "Licence à vie";

    const shortcutCategories = [
        {
            title: "Navigation globale",
            shortcuts: [
                { name: "Palette de commandes", keys: ["⌘", "K"] },
                { name: "Tableau de bord", keys: ["⌘", "D"] },
                { name: "Tous les patients", keys: ["⌘", "P"] },
                { name: "Consultations", keys: ["⌘", "C"] },
                { name: "Rendez-vous", keys: ["⌘", "R"] },
                { name: "Dépenses", keys: ["⌘", "E"] },
                { name: "Paramètres", keys: ["⌘", "S"] },
            ],
        },
        {
            title: "Actions rapides",
            shortcuts: [
                { name: "Nouvelle Ordonnance", keys: ["⌘", "N"] },
                { name: "Changer le thème (Clair/Sombre)", keys: ["⌘", "T"] },
            ],
        },
    ];

    return (
        <Dialog>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-2xl">
                <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 pb-4 border-b border-slate-100 dark:border-slate-900">
                    <DialogHeader className="space-y-1">
                        <DialogTitle className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
                            <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
                                <HelpCircle className="w-6 h-6" />
                            </div>
                            Centre d'Aide & Raccourcis
                        </DialogTitle>
                        <DialogDescription className="text-slate-500 dark:text-slate-400 text-[14px]">
                            Consultez les raccourcis clavier pour naviguer rapidement ou contactez notre assistance technique.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <Tabs defaultValue="shortcuts" className="w-full">
                    <div className="px-6 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20">
                        <TabsList className="flex gap-2 bg-transparent p-0 h-12">
                            <TabsTrigger
                                value="shortcuts"
                                className="flex items-center gap-2 border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent px-4 py-2 text-slate-600 dark:text-slate-400 data-[state=active]:text-primary dark:data-[state=active]:text-white font-medium transition-all"
                            >
                                <Keyboard className="w-4 h-4" />
                                Raccourcis Clavier
                            </TabsTrigger>
                            <TabsTrigger
                                value="support"
                                className="flex items-center gap-2 border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent px-4 py-2 text-slate-600 dark:text-slate-400 data-[state=active]:text-primary dark:data-[state=active]:text-white font-medium transition-all"
                            >
                                <Phone className="w-4 h-4" />
                                Support & Assistance
                            </TabsTrigger>
                            <TabsTrigger
                                value="about"
                                className="flex items-center gap-2 border-b-2 border-transparent data-[state=active]:border-primary rounded-none bg-transparent px-4 py-2 text-slate-600 dark:text-slate-400 data-[state=active]:text-primary dark:data-[state=active]:text-white font-medium transition-all"
                            >
                                <Info className="w-4 h-4" />
                                À propos
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-6 max-h-[400px] overflow-y-auto">
                        {/* Shortcuts Content */}
                        <TabsContent value="shortcuts" className="mt-0 focus-visible:outline-none space-y-6">
                            <div className="text-[13px] text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg border border-amber-200/50 dark:border-amber-900/30 flex items-start gap-2.5">
                                <span className="font-semibold mt-0.5">Note:</span>
                                <span>Vous pouvez également utiliser <kbd className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded text-[11px] font-mono border border-amber-300/30">Ctrl</kbd> à la place de <kbd className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded text-[11px] font-mono border border-amber-300/30">⌘</kbd> sur Windows et Linux.</span>
                            </div>

                            {shortcutCategories.map((category, idx) => (
                                <div key={idx} className="space-y-2.5">
                                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider text-[12px] opacity-75">
                                        {category.title}
                                    </h4>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {category.shortcuts.map((shortcut, sIdx) => (
                                            <div
                                                key={sIdx}
                                                className="flex justify-between items-center p-3 rounded-lg border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/30 hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors group"
                                            >
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                                    {shortcut.name}
                                                </span>
                                                <div className="flex items-center gap-1">
                                                    {shortcut.keys.map((key, kIdx) => (
                                                        <React.Fragment key={kIdx}>
                                                            <kbd className="pointer-events-none inline-flex h-6 min-w-6 select-none items-center justify-center rounded border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-1.5 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200 shadow-[0_1px_0_0_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_0_rgba(255,255,255,0.05)]">
                                                                {key}
                                                            </kbd>
                                                            {kIdx < shortcut.keys.length - 1 && (
                                                                <span className="text-[10px] text-slate-400 font-mono">+</span>
                                                            )}
                                                        </React.Fragment>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </TabsContent>

                        {/* Support Content */}
                        <TabsContent value="support" className="mt-0 focus-visible:outline-none space-y-5">
                            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                Notre service d'assistance technique est disponible pour vous accompagner dans la prise en main de l'application ou pour résoudre tout problème technique.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {/* Telephone */}
                                <a
                                    href="tel:+11234567890"
                                    className="flex flex-col p-4 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/30 hover:border-primary/30 dark:hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 w-fit mb-3">
                                        <Phone className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        Par Téléphone
                                    </span>
                                    <span className="text-[15px] font-semibold text-slate-900 dark:text-white mt-1 group-hover:text-primary transition-colors">
                                        +1 (123) 456-7890
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                                        Appeler directement <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </a>

                                {/* Email */}
                                <a
                                    href="mailto:support@example.com"
                                    className="flex flex-col p-4 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/30 hover:border-primary/30 dark:hover:border-primary/30 hover:bg-primary/5 dark:hover:bg-primary/5 transition-all group"
                                >
                                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 w-fit mb-3">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                        Par Email
                                    </span>
                                    <span className="text-[15px] font-semibold text-slate-900 dark:text-white mt-1 group-hover:text-primary transition-colors">
                                        support@example.com
                                    </span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 flex items-center gap-1">
                                        Envoyer un message <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </a>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-xl border border-slate-100 dark:border-slate-900 bg-slate-50/20 dark:bg-slate-900/10">
                                <Clock className="w-5 h-5 text-primary shrink-0" />
                                <div className="text-xs text-slate-600 dark:text-slate-400">
                                    <span className="font-semibold text-slate-900 dark:text-white block mb-0.5">Disponibilité du support</span>
                                    Du Lundi au Vendredi, de 9h00 à 18h00. Temps de réponse moyen sous 2 heures.
                                </div>
                            </div>
                        </TabsContent>

                        {/* About Content */}
                        <TabsContent value="about" className="mt-0 focus-visible:outline-none space-y-4">
                            <div className="flex flex-col items-center justify-center p-6 text-center border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/30 rounded-xl">
                                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 shadow-inner">
                                    <ShieldCheck className="w-10 h-10" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                    MediPro Clinic Management
                                </h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                                    Système d'information sécurisé de gestion de clinique médicale et dossiers patients.
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-3 text-sm">
                                <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/30">
                                    <span className="text-xs text-slate-400 dark:text-slate-500 block">Version Application</span>
                                    <span className="font-semibold text-slate-900 dark:text-white mt-0.5 block">{APP_VERSION}</span>
                                </div>
                                <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-900 bg-slate-50/30 dark:bg-slate-950/30">
                                    <span className="text-xs text-slate-400 dark:text-slate-500 block">Type de Licence</span>
                                    <span className="font-semibold text-slate-950 dark:text-emerald-400 mt-0.5 block flex items-center gap-1.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        {LICENSE_TYPE}
                                    </span>
                                </div>
                            </div>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
