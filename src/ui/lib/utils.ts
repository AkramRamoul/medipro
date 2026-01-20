import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNow, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(rawDate: string) {
  const date = new Date(rawDate);
  return date.toLocaleDateString("en-GB");
}

export function getLastVisitBadgeClass(lastVisit: string | Date) {
  const date = new Date(lastVisit);
  const now = new Date();
  const diffDays = Math.ceil(
    Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays < 30)
    return "bg-green-500/15 text-green-700 hover:bg-green-500/25";

  if (diffDays < 180)
    return "bg-yellow-500/15 text-yellow-700 hover:bg-yellow-500/25";

  return "bg-slate-500/15 text-slate-700 hover:bg-slate-500/25";
}

export function formatLastVisit(lastVisit: string | Date) {
  const date = new Date(lastVisit);

  if (isToday(date)) return "Aujourd'hui";
  return formatDistanceToNow(date, { locale: fr, addSuffix: true });
}

export function initialsAvatar(initials: string) {
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360;
  const saturation = 75;
  const lightness = 55;

  const bg = `hsl(${hue}, ${saturation}%, ${lightness}%)`;

  const fg = lightness > 60 ? "#1f2937" : "#ffffff";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128">
      <rect width="100%" height="100%" rx="64" fill="${bg}" />
      <text
        x="50%"
        y="50%"
        dy=".35em"
        text-anchor="middle"
        font-family="Inter, system-ui, sans-serif"
        font-size="48"
        font-weight="700"
        fill="${fg}">
        ${initials}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
