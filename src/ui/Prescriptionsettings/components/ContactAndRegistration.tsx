import React from "react";
import { Info, Hash, MapPin, Phone } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { FormData } from "../types";

export function ContactAndRegistration() {
    const { register } = useFormContext<FormData>();

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-muted">
                <Info className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm uppercase tracking-wider">Contact & Inscription</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="inscriptionNumber" className="text-sm font-medium flex items-center gap-1">
                        <Hash className="w-3 h-3" /> N° d'ordre
                    </label>
                    <input
                        id="inscriptionNumber"
                        type="text"
                        {...register("inscriptionNumber")}
                        placeholder="Ex: 12345"
                        className="w-full p-2.5 border rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Ville
                    </label>
                    <input
                        id="city"
                        type="text"
                        {...register("city")}
                        placeholder="Ex: Alger"
                        className="w-full p-2.5 border rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label htmlFor="address" className="text-sm font-medium">Adresse complète</label>
                <input
                    id="address"
                    type="text"
                    {...register("address")}
                    placeholder="Rue, Quartier, Bâtiment..."
                    className="w-full p-2.5 border rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label htmlFor="phoneNumber1" className="text-sm font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Tél Fixe
                    </label>
                    <input
                        id="phoneNumber1"
                        type="tel"
                        {...register("phoneNumber1")}
                        placeholder="021 XX XX XX"
                        className="w-full p-2.5 border rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label htmlFor="phoneNumber2" className="text-sm font-medium flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Mobile
                    </label>
                    <input
                        id="phoneNumber2"
                        type="tel"
                        {...register("phoneNumber2")}
                        placeholder="05XX XX XX XX"
                        className="w-full p-2.5 border rounded-md bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                    />
                </div>
            </div>
        </section>
    );
}
