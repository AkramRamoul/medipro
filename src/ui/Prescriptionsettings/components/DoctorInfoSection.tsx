import React from "react";
import { User } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { FormData } from "../types";

export function DoctorInfoSection() {
    const { register, control } = useFormContext<FormData>();
    const arabicRegex = /^[\u0600-\u06FF\s\u0660-\u0669.,،ء-ي]*$/;

    const nameAr = useWatch({ control, name: "nameAr" }) || "";
    const specialtyAr = useWatch({ control, name: "specialtyAr" }) || "";

    const isNameArValid = nameAr === "" || arabicRegex.test(nameAr);
    const isSpecialtyArValid = specialtyAr === "" || arabicRegex.test(specialtyAr);

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-muted">
                <User className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">Informations du Docteur</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="nameFr" className="text-sm font-medium">Nom (Français)</label>
                    <input
                        id="nameFr"
                        placeholder="Dr. Nom Prénom"
                        type="text"
                        {...register("nameFr")}
                        className="w-full p-2.5 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2 text-right" dir="rtl">
                    <label htmlFor="nameAr" className="text-sm font-medium">اسم الطبيب</label>
                    <input
                        id="nameAr"
                        type="text"
                        maxLength={50}
                        placeholder="الدكتور(ة) اسم الطبيب"
                        {...register("nameAr")}
                        className={`w-full p-2.5 border rounded-md bg-background text-foreground outline-none transition-all ${!isNameArValid ? 'border-destructive focus:ring-destructive/20' : 'focus:ring-2 focus:ring-primary/20'}`}
                    />
                    {!isNameArValid && (
                        <p className="text-xs text-destructive mt-1">Veuillez utiliser des caractères arabes</p>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="space-y-2">
                    <label htmlFor="specialtyFr" className="text-sm font-medium">Spécialité (Français)</label>
                    <input
                        id="specialtyFr"
                        maxLength={50}
                        type="text"
                        placeholder="Ex: Dermatologue"
                        {...register("specialtyFr")}
                        className="w-full p-2.5 border rounded-md bg-background text-foreground focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2 text-right" dir="rtl">
                    <label htmlFor="specialtyAr" className="text-sm font-medium">التخصص</label>
                    <input
                        id="specialtyAr"
                        type="text"
                        placeholder="مثال: أمراض الجلد"
                        {...register("specialtyAr")}
                        className={`w-full p-2.5 border rounded-md bg-background text-foreground outline-none transition-all ${!isSpecialtyArValid ? 'border-destructive focus:ring-destructive/20' : 'focus:ring-2 focus:ring-primary/20'}`}
                    />
                    {!isSpecialtyArValid && (
                        <p className="text-xs text-destructive mt-1">Veuillez utiliser des caractères arabes</p>
                    )}
                </div>
            </div>
        </section>
    );
}
