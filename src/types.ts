export interface Facility {
  id: number;
  name: string;
  amenity: string;
  lat: number;
  lon: number;
  distance: number;
  emergency: boolean;
  openNow: boolean;
  address?: string;
  rating: number;
}
