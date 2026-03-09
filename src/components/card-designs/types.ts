export interface BusinessCard {
  id?: string;
  slug?: string;
  full_name: string;
  designation?: string | null;
  company_name?: string | null;
  company_logo_url?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  location?: string | null;
  social_links?: Record<string, string> | null;
  template_id: string;
  accent_color?: string | null;
  status?: string;
}

export interface DesignTemplate {
  id: string;
  name: string;
  description: string;
  component: React.ComponentType<CardDesignProps>;
}

export interface CardDesignProps {
  card: BusinessCard;
  scale?: number;
}
