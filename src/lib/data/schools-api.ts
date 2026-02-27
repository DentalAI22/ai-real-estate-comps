/**
 * School data fetcher.
 * MVP: Generates realistic mock school data near given coordinates.
 * Production: Swap with GreatSchools API, Niche API, or Education.com data.
 */

import type { SchoolData } from '@/types';
import { hashString, seededRandom, calculateDistance } from '@/lib/utils';

// ─── School Name Components ────────────────────────────────────────────────────

const SCHOOL_FIRST_NAMES = [
  'Washington', 'Lincoln', 'Jefferson', 'Roosevelt', 'Kennedy',
  'Adams', 'Franklin', 'Madison', 'Jackson', 'Hamilton',
  'Martin Luther King Jr.', 'Oakwood', 'Riverside', 'Westview',
  'Eastside', 'Northgate', 'Southridge', 'Lakewood', 'Hillcrest',
  'Pinecrest', 'Cedar Grove', 'Meadowbrook', 'Valley View',
  'Highland', 'Sunset', 'Spring Creek', 'Heritage', 'Legacy',
  'Discovery', 'Innovation', 'Summit', 'Crossroads',
];

const SCHOOL_TYPE_INFO: Record<
  SchoolData['type'],
  { suffix: string; grades: string; enrollmentRange: [number, number]; ratingBias: number }
> = {
  Elementary: { suffix: 'Elementary School', grades: 'K-5', enrollmentRange: [250, 650], ratingBias: 0 },
  Middle: { suffix: 'Middle School', grades: '6-8', enrollmentRange: [400, 900], ratingBias: -0.3 },
  High: { suffix: 'High School', grades: '9-12', enrollmentRange: [800, 2500], ratingBias: -0.2 },
  Private: { suffix: 'Academy', grades: 'K-12', enrollmentRange: [100, 500], ratingBias: 1.2 },
  Charter: { suffix: 'Charter School', grades: 'K-8', enrollmentRange: [150, 600], ratingBias: 0.3 },
};

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch school data near a given location.
 *
 * MVP: Generates 5-8 realistic schools seeded by the coordinates.
 * Each school has a deterministic name, type, rating, distance, and student-teacher ratio.
 * Ratings are influenced by a location-quality factor derived from the coordinates.
 *
 * @param lat - Latitude of the subject property
 * @param lng - Longitude of the subject property
 * @returns Array of nearby schools
 */
export async function fetchSchoolData(
  lat: number,
  lng: number
): Promise<SchoolData[]> {
  const seed = hashString(`schools:${lat.toFixed(4)},${lng.toFixed(4)}`);
  const rng = seededRandom(seed);

  const schoolCount = 5 + Math.floor(rng() * 4); // 5-8 schools
  const schools: SchoolData[] = [];

  // Location quality factor (0-1) affects ratings — deterministic per location
  const locationQuality = rng();

  // Decide how many of each type
  const types: SchoolData['type'][] = [];
  // Always at least 2 elementary, 1 middle, 1 high
  types.push('Elementary', 'Elementary', 'Middle', 'High');
  // Fill remaining slots
  const extraTypes: SchoolData['type'][] = ['Elementary', 'Middle', 'Private', 'Charter', 'Elementary'];
  for (let i = types.length; i < schoolCount; i++) {
    types.push(extraTypes[Math.floor(rng() * extraTypes.length)]);
  }

  for (let i = 0; i < schoolCount; i++) {
    const schoolRng = seededRandom(seed + i * 3571);

    const type = types[i];
    const info = SCHOOL_TYPE_INFO[type];

    // Generate school name
    const nameIdx = Math.floor(schoolRng() * SCHOOL_FIRST_NAMES.length);
    const name = `${SCHOOL_FIRST_NAMES[nameIdx]} ${info.suffix}`;

    // Distance from subject (0.3 to 5 miles, biased closer)
    const distance = Math.round(
      (0.3 + schoolRng() * schoolRng() * 4.7) * 100
    ) / 100;

    // Rating: 1-10, influenced by location quality and type bias
    const baseRating = 3 + locationQuality * 5 + info.ratingBias;
    const ratingNoise = (schoolRng() - 0.5) * 3;
    const rating = Math.round(
      Math.max(1, Math.min(10, baseRating + ratingNoise))
    );

    // Enrollment within range for type
    const [minEnroll, maxEnroll] = info.enrollmentRange;
    const enrollment = Math.round(
      minEnroll + schoolRng() * (maxEnroll - minEnroll)
    );

    schools.push({
      name,
      type,
      rating,
      distance,
      enrollment,
      grades: info.grades,
    });
  }

  // Sort by distance
  schools.sort((a, b) => a.distance - b.distance);

  return schools;
}
