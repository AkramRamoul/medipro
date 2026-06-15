import { clsx, type ClassValue } from "clsx";
import { formatDistanceToNow, isToday } from "date-fns";
import { fr } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Returns the age in full years from a date-of-birth string (YYYY-MM-DD or ISO). */
export function calculateAge(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
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
  // Enhanced hashing for more distinct color distribution
  let hash = 0;
  for (let i = 0; i < initials.length; i++) {
    hash = initials.charCodeAt(i) + ((hash << 5) - hash);
  }

  // Use a curated set of hues or a more vibrant palette
  const hue = Math.abs(hash) % 360;
  
  // Create a gradient for a more "lush" look
  const color1 = `hsl(${hue}, 70%, 60%)`;
  const color2 = `hsl(${(hue + 20) % 360}, 80%, 50%)`;
  
  // Better contrast check for foreground text
  const isBright = (hue > 45 && hue < 190); // Yellow/Green/Cyan spectrum is bright
  const fg = isBright ? "rgba(0,0,0,0.6)" : "#ffffff";

  // Use a modern SVG with:
  // 1. A linear gradient background
  // 2. A subtle inner border for depth
  // 3. Better typography alignment
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128">
      <defs>
        <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${color1}" />
          <stop offset="100%" stop-color="${color2}" />
        </linearGradient>
      </defs>
      <circle cx="64" cy="64" r="64" fill="url(#avatarGrad)" />
      <circle cx="64" cy="64" r="62" fill="none" stroke="white" stroke-opacity="0.1" stroke-width="1" />
      <text
        x="50%"
        y="50%"
        dy=".1em"
        text-anchor="middle"
        dominant-baseline="middle"
        font-family="Inter, system-ui, -apple-system, sans-serif"
        font-size="52"
        font-weight="700"
        letter-spacing="-0.02em"
        fill="${fg}"
        style="text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        ${initials.toUpperCase()}
      </text>
    </svg>
  `;

  return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`;
}
