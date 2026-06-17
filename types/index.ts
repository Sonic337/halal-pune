export interface Branch {
  area: string;
  mapsUrl: string;
  lat?: number;
  lng?: number;
  rating?: number;
  reviewCount?: number;
}

export interface Restaurant {
  name: string;
  tagline: string;
  rating?: number;
  reviewCount?: number;
  cuisines: string[];
  branches: Branch[];
  dietType?: "pure-veg" | "veg-nonveg" | "non-veg";
  fishNote?: string;
  menuUrl?: string;
  phone?: string;
}
