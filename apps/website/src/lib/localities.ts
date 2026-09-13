// Static locality -> coordinates lookup for the manual "search near a place" flow. Avoids a
// paid Google Places Autocomplete dependency for the MVP; radius filtering itself is always
// done in Postgres via properties_within_radius() regardless of how the center point was
// picked. Extend this list as the business expands beyond Thane.
export interface KnownLocality {
  label: string;
  lat: number;
  lng: number;
}

export const THANE_LOCALITIES: KnownLocality[] = [
  { label: "Vasant Vihar, Thane West", lat: 19.2114, lng: 72.9781 },
  { label: "Thane West", lat: 19.1972, lng: 72.9634 },
  { label: "Thane East", lat: 19.189, lng: 72.988 },
  { label: "Manpada", lat: 19.201, lng: 72.9755 },
  { label: "Majiwada", lat: 19.2038, lng: 72.9709 },
  { label: "Wagle Estate", lat: 19.1934, lng: 72.9636 },
  { label: "Ghodbunder Road", lat: 19.2465, lng: 72.9789 },
  { label: "Pokhran Road", lat: 19.2079, lng: 72.9815 },
  { label: "Kasarvadavali", lat: 19.2578, lng: 72.9822 },
  { label: "Kolshet", lat: 19.2225, lng: 72.9668 },
  { label: "Mulund", lat: 19.1726, lng: 72.9425 },
];

export const RADIUS_OPTIONS_KM = [1, 3, 5, 10, 20];
