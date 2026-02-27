/**
 * Neighborhood enrichment service.
 * Combines census, school, and crime data into a unified NeighborhoodProfile.
 */

import type { NeighborhoodData, SchoolData, CrimeData } from '@/types';
import { fetchCensusData, type CensusData } from './census-api';
import { fetchSchoolData } from './schools-api';
import { fetchCrimeData } from './crime-api';
import { hashString, seededRandom } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface NeighborhoodProfile {
  demographics: CensusData;
  neighborhood: NeighborhoodData;
  schools: SchoolData[];
  crime: CrimeData;
}

// ─── Amenity Data for Mock Generation ──────────────────────────────────────────

const AMENITY_TYPES = [
  { type: 'Grocery Store', names: ['Whole Foods', 'Trader Joe\'s', 'Kroger', 'Safeway', 'Publix', 'HEB', 'Aldi'] },
  { type: 'Restaurant', names: ['The Local Bistro', 'Main Street Grill', 'Sakura Sushi', 'Chipotle', 'Panera Bread'] },
  { type: 'Coffee Shop', names: ['Starbucks', 'Peet\'s Coffee', 'Blue Bottle Coffee', 'Dunkin\'', 'Local Brew'] },
  { type: 'Park', names: ['Central Park', 'Memorial Park', 'Riverside Park', 'Heritage Park', 'Community Park'] },
  { type: 'Hospital', names: ['Regional Medical Center', 'Community Hospital', 'St. Mary\'s Hospital', 'Memorial Hospital'] },
  { type: 'Gym', names: ['Planet Fitness', 'LA Fitness', 'Equinox', 'Orange Theory', 'YMCA'] },
  { type: 'Shopping', names: ['Target', 'Walmart', 'Costco', 'Home Depot', 'Best Buy'] },
  { type: 'Library', names: ['Public Library - Main Branch', 'Community Library', 'Regional Library'] },
  { type: 'School', names: ['Elementary School', 'Middle School', 'High School'] },
  { type: 'Transit', names: ['Bus Station', 'Metro Station', 'Train Depot', 'Park & Ride'] },
];

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Enrich a location with full neighborhood data.
 *
 * Calls census, school, and crime data providers in parallel, then assembles
 * a comprehensive NeighborhoodProfile with demographics, amenities,
 * walkability scores, and safety data.
 *
 * @param zip - 5-digit zip code
 * @param lat - Latitude
 * @param lng - Longitude
 * @returns Complete neighborhood profile
 */
export async function enrichNeighborhood(
  zip: string,
  lat: number,
  lng: number
): Promise<NeighborhoodProfile> {
  // Fetch all data sources in parallel
  const [demographics, schools, crime] = await Promise.all([
    fetchCensusData(zip),
    fetchSchoolData(lat, lng),
    fetchCrimeData(zip),
  ]);

  // Generate supplementary neighborhood data
  const neighborhood = buildNeighborhoodData(demographics, zip, lat, lng);

  return {
    demographics,
    neighborhood,
    schools,
    crime,
  };
}

/**
 * Build NeighborhoodData from demographics and location.
 * Generates walkability scores and nearby amenities deterministically.
 */
function buildNeighborhoodData(
  census: CensusData,
  zip: string,
  lat: number,
  lng: number
): NeighborhoodData {
  const seed = hashString(`neighborhood:${zip}`);
  const rng = seededRandom(seed);

  // Walk/Transit/Bike scores: correlated with population density & urbanity
  // Higher income + higher population density = more walkable
  const urbanFactor = Math.min(1, census.population / 50000);
  const densityEstimate = Math.round(
    census.population / (5 + rng() * 15) // people per square mile estimate
  );

  const walkScore = Math.round(
    Math.max(10, Math.min(100, 30 + urbanFactor * 55 + (rng() - 0.3) * 25))
  );
  const transitScore = Math.round(
    Math.max(0, Math.min(100, walkScore * (0.5 + rng() * 0.4)))
  );
  const bikeScore = Math.round(
    Math.max(5, Math.min(100, walkScore * (0.4 + rng() * 0.5)))
  );

  // Generate nearby amenities
  const amenityCount = 5 + Math.floor(rng() * 8); // 5-12 amenities
  const amenities: NeighborhoodData['nearbyAmenities'] = [];

  const usedTypes = new Set<string>();

  for (let i = 0; i < amenityCount; i++) {
    const amenityRng = seededRandom(seed + i * 2237);
    const typeIdx = Math.floor(amenityRng() * AMENITY_TYPES.length);
    const amenityType = AMENITY_TYPES[typeIdx];

    // Avoid too many duplicates of same type
    const typeKey = `${amenityType.type}-${Math.floor(amenityRng() * 3)}`;
    if (usedTypes.has(typeKey)) continue;
    usedTypes.add(typeKey);

    const nameIdx = Math.floor(amenityRng() * amenityType.names.length);
    const distance = Math.round((0.1 + amenityRng() * amenityRng() * 3.9) * 10) / 10;

    amenities.push({
      name: amenityType.names[nameIdx],
      type: amenityType.type,
      distance,
    });
  }

  // Sort amenities by distance
  amenities.sort((a, b) => a.distance - b.distance);

  return {
    medianIncome: census.medianIncome,
    medianAge: census.medianAge,
    population: census.population,
    populationDensity: densityEstimate,
    medianHomeValue: census.medianHomeValue,
    homeOwnershipRate: census.ownerOccupiedPct,
    walkScore,
    transitScore: transitScore > 5 ? transitScore : null,
    bikeScore: bikeScore > 5 ? bikeScore : null,
    nearbyAmenities: amenities,
  };
}
