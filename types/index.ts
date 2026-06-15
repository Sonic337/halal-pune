export interface Branch {
  area: string;
  mapsUrl: string;
  lat?: number;
  lng?: number;
}

export interface Restaurant {
  name: string;
  tagline: string;
  rating?: number;
  reviewCount?: number;
  cuisines: string[];
  branches: Branch[];
}
