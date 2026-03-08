import { Plus, Trash2, Stethoscope } from "lucide-react";
import { ServiceItem } from "../types";

interface Props {
    services: ServiceItem[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onChange: (index: number, lang: "fr" | "ar", value: string) => void;
}

export function ServicesSection({ services, onAdd, onRemove, onChange }: Props) {
    const arabicRegex = /^[\u0600-\u06FF\s\u0660-\u0669.,،ء-ي]*$/;

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-muted">
                <div className="flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-primary" />
                    <h3 className="font-semibold text-sm uppercase tracking-wider">Services & Expertise</h3>
                </div>
                {services.length < 3 && (
                    <button
                        type="button"
                        onClick={onAdd}
                        className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground h-8 px-3 text-xs gap-1"
                    >
                        <Plus className="w-3 h-3" /> Ajouter
                    </button>
                )}
            </div>
            <div className="space-y-4">
                {services.map((service, index) => {
                    const isArValid = service.ar === "" || arabicRegex.test(service.ar);

                    return (
                        <div
                            key={index}
                            className="relative group p-4 border rounded-lg bg-muted/20 space-y-4"
                        >
                            {services.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => onRemove(index)}
                                    className="absolute top-2 right-2 p-1 text-muted-foreground hover:text-destructive transition-colors"
                                    aria-label="Supprimer le service"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label htmlFor={`service-fr-${index}`} className="sr-only">Service (Français)</label>
                                    <textarea
                                        id={`service-fr-${index}`}
                                        placeholder="Service (FR)"
                                        value={service.fr}
                                        onChange={(e) => onChange(index, "fr", e.target.value)}
                                        className="w-full p-2 border rounded-md bg-background text-sm resize-none focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                        rows={2}
                                    />
                                </div>
                                <div className="space-y-2" dir="rtl">
                                    <label htmlFor={`service-ar-${index}`} className="sr-only">الخدمة</label>
                                    <textarea
                                        id={`service-ar-${index}`}
                                        placeholder="الخدمة (AR)"
                                        value={service.ar}
                                        onChange={(e) => onChange(index, "ar", e.target.value)}
                                        className={`w-full p-2 border rounded-md bg-background text-sm text-right resize-none outline-none transition-all ${!isArValid ? 'border-destructive focus:ring-destructive/20' : 'focus:ring-2 focus:ring-primary/20'}`}
                                        rows={2}
                                    />
                                    {!isArValid && (
                                        <p className="text-xs text-destructive mt-1 text-right">Veuillez utiliser des caractères arabes</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
