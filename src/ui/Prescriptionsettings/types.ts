export type TemplateLayout =
    | "bilingual"
    | "fr-only"
    | "ar-only"
    | "fr-logo-left"
    | "ar-logo-right"
    | "bilingual-logo-left"
    | "bilingual-logo-right"
    | "centered";

export type LayoutElementId =
    | "logo"
    | "nameFr"
    | "nameAr"
    | "specialtyFr"
    | "specialtyAr"
    | "inscription"
    | "divider"
    | "title"
    | "patientInfo"
    | "dateCity"
    | "footer";

export interface ElementPosition {
    x: number; // % of paper width  (0–100)
    y: number; // % of paper height (0–100)
}

export type CustomPositions = Record<LayoutElementId, ElementPosition>;

export const DEFAULT_ELEMENT_POSITIONS: CustomPositions = {
    logo:        { x: 42, y: 2  },
    nameFr:      { x: 5,  y: 2  },
    nameAr:      { x: 60, y: 2  },
    specialtyFr: { x: 5,  y: 9  },
    specialtyAr: { x: 60, y: 9  },
    inscription: { x: 40, y: 17 },
    divider:     { x: 0,  y: 24 },
    patientInfo: { x: 5,  y: 32 },
    dateCity:    { x: 55, y: 32 },
    title:       { x: 28, y: 44 },
    footer:      { x: 0,  y: 91 },
};

export const ELEMENT_LABELS: Record<LayoutElementId, string> = {
    logo:        "Logo",
    nameFr:      "Nom (FR)",
    nameAr:      "الاسم (AR)",
    specialtyFr: "Spécialité (FR)",
    specialtyAr: "التخصص (AR)",
    inscription: "N° Inscription",
    divider:     "Séparateur",
    title:       "Titre",
    patientInfo: "Nom/âge patient",
    dateCity:    "Ville & date",
    footer:      "Pied de page",
};

export const ELEMENT_COLORS: Record<LayoutElementId, string> = {
    logo:        "#7c3aed",
    nameFr:      "#1d4ed8",
    nameAr:      "#15803d",
    specialtyFr: "#0369a1",
    specialtyAr: "#166534",
    inscription: "#b45309",
    divider:     "#6b7280",
    title:       "#b91c1c",
    patientInfo: "#6d28d9",
    dateCity:    "#0f766e",
    footer:      "#374151",
};

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
    customPositions?: CustomPositions;
    useCustomLayout?: boolean;
    hiddenElements?: LayoutElementId[];
}

export interface ServiceItem {
    fr: string;
    ar: string;
}

export type FormData = FormState & {
    services: ServiceItem[];
};
