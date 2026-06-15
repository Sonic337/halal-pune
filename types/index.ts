export interface Branch {
  area: string;
  mapsUrl: string;
  lat?: number;
  lng?: number;
}

export interface Restaurant {
  name: string;
  tagline: string;
  cuisines: string[];
  branches: Branch[];
}
