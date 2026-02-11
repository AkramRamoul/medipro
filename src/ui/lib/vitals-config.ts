import { Heart, Scale, Droplet, Thermometer, Activity } from "lucide-react";
import { type LucideIcon } from "lucide-react";

/**
 * Medical Vitals Visual Language System
 * Consistent colors, icons, and styling for vital signs across the app
 */

export interface VitalConfig {
    key: string;
    label: string;
    labelShort: string;
    unit: string;
    icon: LucideIcon;
    color: {
        primary: string;      // Main color (hex)
        light: string;        // Light background
        lightDark: string;    // Dark mode light background
        text: string;         // Text color
        textDark: string;     // Dark mode text
    };
    tailwind: {
        bg: string;
        bgDark: string;
        text: string;
        textDark: string;
        border: string;
        borderDark: string;
        iconBg: string;
        iconBgDark: string;
    };
    normalRange?: {
        min: number;
        max: number;
    };
}

export const VITALS_CONFIG: Record<string, VitalConfig> = {
    bloodPressure: {
        key: "bloodPressure",
        label: "Tension Artérielle",
        labelShort: "TA",
        unit: "mmHg",
        icon: Heart,
        color: {
            primary: "#ef4444",
            light: "#fef2f2",
            lightDark: "rgba(239, 68, 68, 0.15)",
            text: "#dc2626",
            textDark: "#fca5a5",
        },
        tailwind: {
            bg: "bg-red-50",
            bgDark: "dark:bg-red-950/20",
            text: "text-red-600",
            textDark: "dark:text-red-400",
            border: "border-red-200",
            borderDark: "dark:border-red-800",
            iconBg: "bg-red-100",
            iconBgDark: "dark:bg-red-900/40",
        },
        normalRange: { min: 90, max: 120 }, // systolic
    },

    heartRate: {
        key: "heartRate",
        label: "Fréquence Cardiaque",
        labelShort: "FC",
        unit: "bpm",
        icon: Activity,
        color: {
            primary: "#f43f5e",
            light: "#fff1f2",
            lightDark: "rgba(244, 63, 94, 0.15)",
            text: "#e11d48",
            textDark: "#fb7185",
        },
        tailwind: {
            bg: "bg-rose-50",
            bgDark: "dark:bg-rose-950/20",
            text: "text-rose-600",
            textDark: "dark:text-rose-400",
            border: "border-rose-200",
            borderDark: "dark:border-rose-800",
            iconBg: "bg-rose-100",
            iconBgDark: "dark:bg-rose-900/40",
        },
        normalRange: { min: 60, max: 100 },
    },

    weight: {
        key: "weight",
        label: "Poids",
        labelShort: "Poids",
        unit: "kg",
        icon: Scale,
        color: {
            primary: "#3b82f6",
            light: "#eff6ff",
            lightDark: "rgba(59, 130, 246, 0.15)",
            text: "#2563eb",
            textDark: "#93c5fd",
        },
        tailwind: {
            bg: "bg-blue-50",
            bgDark: "dark:bg-blue-950/20",
            text: "text-blue-600",
            textDark: "dark:text-blue-400",
            border: "border-blue-200",
            borderDark: "dark:border-blue-800",
            iconBg: "bg-blue-100",
            iconBgDark: "dark:bg-blue-900/40",
        },
    },

    glucose: {
        key: "glucose",
        label: "Glycémie",
        labelShort: "Glyc",
        unit: "g/L",
        icon: Droplet,
        color: {
            primary: "#8b5cf6",
            light: "#f5f3ff",
            lightDark: "rgba(139, 92, 246, 0.15)",
            text: "#7c3aed",
            textDark: "#c4b5fd",
        },
        tailwind: {
            bg: "bg-purple-50",
            bgDark: "dark:bg-purple-950/20",
            text: "text-purple-600",
            textDark: "dark:text-purple-400",
            border: "border-purple-200",
            borderDark: "dark:border-purple-800",
            iconBg: "bg-purple-100",
            iconBgDark: "dark:bg-purple-900/40",
        },
        normalRange: { min: 0.7, max: 1.1 },
    },

    temperature: {
        key: "temperature",
        label: "Température",
        labelShort: "Temp",
        unit: "°C",
        icon: Thermometer,
        color: {
            primary: "#f97316",
            light: "#fff7ed",
            lightDark: "rgba(249, 115, 22, 0.15)",
            text: "#ea580c",
            textDark: "#fdba74",
        },
        tailwind: {
            bg: "bg-orange-50",
            bgDark: "dark:bg-orange-950/20",
            text: "text-orange-600",
            textDark: "dark:text-orange-400",
            border: "border-orange-200",
            borderDark: "dark:border-orange-800",
            iconBg: "bg-orange-100",
            iconBgDark: "dark:bg-orange-900/40",
        },
        normalRange: { min: 36.1, max: 37.2 },
    },
};

/**
 * Get Tailwind classes for a vital's badge/chip styling
 */
export function getVitalBadgeClasses(vitalKey: keyof typeof VITALS_CONFIG): string {
    const config = VITALS_CONFIG[vitalKey];
    if (!config) return "";

    const { tailwind } = config;
    return `${tailwind.bg} ${tailwind.bgDark} ${tailwind.text} ${tailwind.textDark} ${tailwind.border} ${tailwind.borderDark}`;
}

/**
 * Get Tailwind classes for a vital's icon container
 */
export function getVitalIconClasses(vitalKey: keyof typeof VITALS_CONFIG): string {
    const config = VITALS_CONFIG[vitalKey];
    if (!config) return "";

    const { tailwind } = config;
    return `${tailwind.iconBg} ${tailwind.iconBgDark}`;
}

/**
 * Get the icon component for a vital
 */
export function getVitalIcon(vitalKey: keyof typeof VITALS_CONFIG): LucideIcon | null {
    return VITALS_CONFIG[vitalKey]?.icon || null;
}

/**
 * Check if a vital value is within normal range
 */
export function isVitalNormal(vitalKey: keyof typeof VITALS_CONFIG, value: number): boolean | null {
    const config = VITALS_CONFIG[vitalKey];
    if (!config?.normalRange) return null;

    return value >= config.normalRange.min && value <= config.normalRange.max;
}

/**
 * Get status color based on whether vital is normal
 */
export function getVitalStatusColor(vitalKey: keyof typeof VITALS_CONFIG, value: number): "normal" | "warning" | "unknown" {
    const isNormal = isVitalNormal(vitalKey, value);
    if (isNormal === null) return "unknown";
    return isNormal ? "normal" : "warning";
}

// Export individual configs for convenience
export const BP_CONFIG = VITALS_CONFIG.bloodPressure;
export const HEART_RATE_CONFIG = VITALS_CONFIG.heartRate;
export const WEIGHT_CONFIG = VITALS_CONFIG.weight;
export const GLUCOSE_CONFIG = VITALS_CONFIG.glucose;
export const TEMPERATURE_CONFIG = VITALS_CONFIG.temperature;
