import { Facility } from './types';

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export async function fetchNearbyFacilities(lat: number, lon: number, radiusKm: number = 5): Promise<Facility[]> {
  const radiusMeters = radiusKm * 1000;
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"~"hospital|clinic|pharmacy|doctors"](around:${radiusMeters},${lat},${lon});
      way["amenity"~"hospital|clinic|pharmacy|doctors"](around:${radiusMeters},${lat},${lon});
      relation["amenity"~"hospital|clinic|pharmacy|doctors"](around:${radiusMeters},${lat},${lon});
    );
    out center;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  if (!response.ok) {
    throw new Error('Failed to fetch facilities');
  }

  const data = await response.json();

  return data.elements
    .filter((element: any) => (element.lat || element.center?.lat) && (element.lon || element.center?.lon))
    .map((element: any) => {
      const elLat = element.lat || element.center?.lat;
      const elLon = element.lon || element.center?.lon;
    const distance = calculateDistance(lat, lon, elLat, elLon);
    
    // Generate a pseudo-random rating based on the ID so it's consistent
    const pseudoRandom = (element.id % 15) / 10; // 0.0 to 1.4
    const rating = 3.5 + pseudoRandom;

    const tags = element.tags || {};
    let amenity = tags.amenity || 'facility';
    if (amenity === 'doctors') amenity = 'medical';
    const name = tags.name || `Unnamed ${amenity}`;
    const emergency = tags.emergency === 'yes';
    
    // Simplistic "open now" logic for demo: 
    // If it's a hospital or has 24/7, it's open. Otherwise, pseudo-randomly open based on ID.
    const openNow = amenity === 'hospital' || tags.opening_hours === '24/7' || (element.id % 2 === 0);

    return {
      id: element.id,
      name,
      amenity,
      lat: elLat,
      lon: elLon,
      distance,
      emergency,
      openNow,
      rating: Number(rating.toFixed(1)),
      address: tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}`.trim() : undefined,
    };
  }).sort((a: Facility, b: Facility) => a.distance - b.distance);
}
