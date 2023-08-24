export interface Star {
  // [Integer] The database primary key.
  id: number;
  // [Integer] The star's ID in the Hipparcos catalog, if known.
  hip: number | null;
  // [Integer] The star's ID in the Henry Draper catalog, if known.
  hd: number | null;
  // [Integer] The star's ID in the Harvard Revised catalog, which is the same as its number in the Yale Bright Star Catalog.
  hr: number | null;
  // The star's ID in the third edition of the Gliese Catalog of Nearby Stars.
  gl: string | null;
  // The Bayer / Flamsteed designation, primarily from the Fifth Edition of the Yale Bright Star Catalog. This is a combination of the two designations. The Flamsteed number, if present, is given first; then a three-letter abbreviation for the Bayer Greek letter; the Bayer superscript number, if present; and finally, the three-letter constellation abbreviation. Thus Alpha Andromedae has the field value "21Alp And", and Kappa1 Sculptoris (no Flamsteed number) has "Kap1Scl".
  bf: string | null;
  // A common name for the star, such as "Barnard's Star" or "Sirius". These are taken from the International Astronomical Union (https://www.iau.org/public/themes/naming_stars/, specifically, I'm using a formatted version from https://github.com/mirandadam/iau-starnames)
  proper: string | null;
  // The star's right ascension and declination, for epoch and equinox 2000.0.
  ra: number;
  dec: number;
  // The star's distance in parsecs, the most common unit in astrometry. To convert parsecs to light years, multiply by 3.262. A value >= 100000 indicates missing or dubious (e.g., negative) parallax data in Hipparcos.
  dist: number;
  // The star's proper motion in right ascension and declination, in milliarcseconds per year.
  pmra: number;
  pmdec: number;
  //The star's radial velocity in km/sec, where known.
  rv: number;
  // The star's apparent visual magnitude.
  mag: number;
  // The star's absolute visual magnitude (its apparent magnitude from a distance of 10 parsecs).
  absmag: number;
  // The star's spectral type, if known.
  spect: string | null;
  // The star's color index (blue magnitude - visual magnitude), where known.
  ci: number;
  // The Cartesian coordinates of the star, in a system based on the equatorial coordinates as seen from Earth. + X is in the direction of the vernal equinox(at epoch 2000), +Z towards the north celestial pole, and + Y in the direction of R.A. 6 hours, declination 0 degrees.
  x: number;
  y: number;
  z: number;
  // The Cartesian velocity components of the star, in the same coordinate system described immediately above.They are determined from the proper motion and the radial velocity(when known).The velocity unit is parsecs per year; these are small values(around 1 millionth of a parsec per year), but they enormously simplify calculations using parsecs as base units for celestial mapping.
  vx: number;
  vy: number;
  vz: number;
  //The positions in radians, and proper motions in radians per year.
  rarad: number;
  decrad: number;
  pmrarad: number;
  pmdecrad: number;
  //The Bayer designation as a distinct value
  bayer: string | null;
  //The Flamsteed number as a distinct value
  flam: string | null;
  //The standard constellation abbreviation
  con: string | null;
  // [Integer, Integer, String] Identifies a star in a multiple star system.comp = ID of companion star, comp_primary = ID of primary star for this component, and base = catalog ID or name for this multi - star system.Currently only used for Gliese stars.
  comp: number;
  comp_primary: number;
  base: string | null;
  //Star's luminosity as a multiple of Solar luminosity.
  lum: number;
  // Star's standard variable star designation, when known.
  var: string | null;
  // Star's approximate magnitude range, for variables. This value is based on the Hp magnitudes for the range in the original Hipparcos catalog, adjusted to the V magnitude scale to match the "mag" field.
  var_min: number | null;
  var_max: number | null;
}
