export interface Branch {
  area: string;
  mapsUrl: string;
}

export interface Restaurant {
  name: string;
  tagline: string;
  cuisines: string[];
  branches: Branch[];
}
