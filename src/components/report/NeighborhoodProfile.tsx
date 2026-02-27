import React from 'react';
import {
  GraduationCap,
  Shield,
  AlertTriangle,
  Star,
  Building2,
} from 'lucide-react';
import { formatCurrency, formatNumber, classNames } from '@/lib/utils';
import type { NeighborhoodData, SchoolData, CrimeData } from '@/types';

interface NeighborhoodProfileProps {
  neighborhoodData: NeighborhoodData | null;
  schoolData: SchoolData[] | null;
  crimeData: CrimeData | null;
  className?: string;
}

function StarRating({ rating, max = 10 }: { rating: number | null; max?: number }) {
  if (rating === null) {
    return <span className="text-xs text-gray-400">No rating</span>;
  }
  const filled = Math.round((rating / max) * 5);
  return (
    <div className="flex items-center space-x-0.5">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={classNames(
            'w-3.5 h-3.5',
            i < filled ? 'text-gold-400 fill-gold-400' : 'text-gray-200'
          )}
        />
      ))}
      <span className="ml-1.5 text-xs font-medium text-gray-600">{rating}/10</span>
    </div>
  );
}

function CrimeBar({
  label,
  value,
  maxValue,
}: {
  label: string;
  value: number;
  maxValue: number;
}) {
  const pct = Math.min((value / maxValue) * 100, 100);
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-xs font-medium text-navy-900">{value.toFixed(1)}</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={classNames(
            'h-full rounded-full transition-all',
            pct < 40 ? 'bg-green-400' : pct < 70 ? 'bg-yellow-400' : 'bg-red-400'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function NeighborhoodProfile({
  neighborhoodData,
  schoolData,
  crimeData,
  className,
}: NeighborhoodProfileProps) {
  return (
    <div className={classNames('space-y-8', className)}>
      {/* Demographics stat cards */}
      {neighborhoodData && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Building2 className="w-4 h-4 text-gold-500" />
            <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider">
              Demographics
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Median Income</p>
              <p className="text-lg font-display font-bold text-navy-900 mt-1">
                {formatCurrency(neighborhoodData.medianIncome)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Population</p>
              <p className="text-lg font-display font-bold text-navy-900 mt-1">
                {formatNumber(neighborhoodData.population)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Median Home Value</p>
              <p className="text-lg font-display font-bold text-navy-900 mt-1">
                {formatCurrency(neighborhoodData.medianHomeValue)}
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Homeownership Rate</p>
              <p className="text-lg font-display font-bold text-navy-900 mt-1">
                {(neighborhoodData.homeOwnershipRate * 100).toFixed(0)}%
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500">Median Age</p>
              <p className="text-lg font-display font-bold text-navy-900 mt-1">
                {neighborhoodData.medianAge}
              </p>
            </div>
            {neighborhoodData.walkScore !== null && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">Walk Score</p>
                <p className="text-lg font-display font-bold text-navy-900 mt-1">
                  {neighborhoodData.walkScore}
                </p>
              </div>
            )}
            {neighborhoodData.transitScore !== null && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">Transit Score</p>
                <p className="text-lg font-display font-bold text-navy-900 mt-1">
                  {neighborhoodData.transitScore}
                </p>
              </div>
            )}
            {neighborhoodData.bikeScore !== null && (
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-xs text-gray-500">Bike Score</p>
                <p className="text-lg font-display font-bold text-navy-900 mt-1">
                  {neighborhoodData.bikeScore}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Schools */}
      {schoolData && schoolData.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <GraduationCap className="w-4 h-4 text-gold-500" />
            <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider">
              Nearby Schools
            </h3>
          </div>
          <div className="space-y-3">
            {schoolData.map((school) => (
              <div
                key={school.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm font-medium text-navy-900 truncate">{school.name}</p>
                  <p className="text-xs text-gray-500">
                    {school.type} &middot; Grades {school.grades} &middot; {school.distance}{' '}
                    mi
                  </p>
                </div>
                <StarRating rating={school.rating} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Crime stats */}
      {crimeData && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-4 h-4 text-gold-500" />
            <h3 className="text-sm font-semibold text-navy-900 uppercase tracking-wider">
              Crime Statistics
            </h3>
          </div>
          <div className="bg-gray-50 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-navy-900">
                Crime Index: {crimeData.crimeIndex}
              </span>
              <span
                className={classNames(
                  'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold',
                  crimeData.comparedToNational === 'lower'
                    ? 'bg-green-50 text-green-700'
                    : crimeData.comparedToNational === 'average'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-red-50 text-red-700'
                )}
              >
                {crimeData.comparedToNational === 'lower'
                  ? 'Below National Avg'
                  : crimeData.comparedToNational === 'average'
                    ? 'Near National Avg'
                    : 'Above National Avg'}
              </span>
            </div>
            <CrimeBar
              label="Violent Crime Rate"
              value={crimeData.violentCrimeRate}
              maxValue={10}
            />
            <CrimeBar
              label="Property Crime Rate"
              value={crimeData.propertyCrimeRate}
              maxValue={10}
            />
            <p className="text-xs text-gray-400 pt-1">
              Source: FBI UCR {crimeData.year}. Index scale 1-100, national average = 50.
            </p>
          </div>
        </div>
      )}

      {/* Flood zone placeholder */}
      <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-xl">
        <AlertTriangle className="w-5 h-5 text-blue-500 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-blue-800">Flood Zone Status</p>
          <p className="text-xs text-blue-600 mt-0.5">
            FEMA flood zone data available in Pro and Branded reports. Consult your local
            floodplain administrator for official determinations.
          </p>
        </div>
      </div>
    </div>
  );
}
