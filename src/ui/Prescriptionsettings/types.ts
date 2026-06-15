export type TemplateLayout =
    | "bilingual"
    | "fr-only"
    | "ar-only"
    | "fr-logo-left"
    | "ar-logo-right"
    | "bilingual-logo-left"
    | "bilingual-logo-right"
    | "centered";


export interface FormState {
    nameFr: string;
    nameAr: string;
    specialtyFr: string;
    specialtyAr: string;
    servicesFr: string;
    servicesAr: string;
    inscriptionNumber: string;
    address: string;
    phoneNumber1: string;
    phoneNumber2: string;
    city: string;
    accentColor: string;
    fontFamily: "serif" | "sans-serif" | "lora" | "merriweather" | "playfair" | "inter" | "roboto" | "montserrat";
    doctorNameFontSize: number;
    specialtyFontSize: number;
    titleFontSize: number;
    bodyFontSize: number;
    logoSize: number;
    watermarkOpacity: number;
    dividerStyle: "solid" | "dashed" | "double" | "none";
    titleText: string;
    showInscriptionNumber: boolean;
    templateLayout: TemplateLayout;
}

export interface ServiceItem {
    fr: string;
    ar: string;
}

export type FormData = FormState & {
    services: ServiceItem[];
};
