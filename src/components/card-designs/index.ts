import type { DesignTemplate } from "./types";
import BlackElegance from "./BlackElegance";
import VibrantGradient from "./VibrantGradient";
import CorporateClean from "./CorporateClean";

export const templates: DesignTemplate[] = [
  {
    id: "black-elegance",
    name: "Black Elegance",
    description: "High-contrast black with gold accents",
    component: BlackElegance,
  },
  {
    id: "vibrant-gradient",
    name: "Vibrant Gradient",
    description: "Bold purple-to-pink gradient",
    component: VibrantGradient,
  },
  {
    id: "corporate-clean",
    name: "Corporate Clean",
    description: "Minimal white with a colored accent bar",
    component: CorporateClean,
  },
];

export function getTemplate(id: string): DesignTemplate {
  return templates.find((t) => t.id === id) ?? templates[0];
}
