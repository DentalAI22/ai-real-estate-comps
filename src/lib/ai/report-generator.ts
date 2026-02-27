/**
 * AI-powered report generator.
 * Orchestrates Claude API calls to produce the full narrative report.
 * Falls back to template-based narratives if the API is unavailable.
 */

import type {
  PropertyDetails,
  CompSale,
  GeneratedReport,
  ReportConfig,
  ReportType,
  NeighborhoodData,
  SchoolData,
  CrimeData,
  MarketTrends,
} from '@/types';
import { REPORT_SYSTEM_PROMPT } from './prompts';
import { analyzeComps, type AnalyzedComp } from './comp-analyzer';
import { generateMarketNarrative } from './market-narrative';
import type { NeighborhoodProfile } from '@/lib/data/enrichment';
import { formatCurrency, formatNumber, generateId, stateNameFromCode } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ReportGenerationInput {
  subject: PropertyDetails;
  comps: CompSale[];
  enrichment: NeighborhoodProfile | null;
  config: ReportConfig;
  userId: string;
  reportType: ReportType;
}

// ─── Claude API Integration ────────────────────────────────────────────────────

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';

interface ClaudeMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Call the Anthropic Claude API with the given system prompt and messages.
 * Returns the assistant's text response.
 */
async function callClaude(
  systemPrompt: string,
  messages: ClaudeMessage[],
  maxTokens: number = 4096
): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('ANTHROPIC_API_KEY not set — falling back to template narrative.');
    return null;
  }

  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Claude API error (${response.status}): ${errorText}`);
      return null;
    }

    const data = await response.json();
    const textBlock = data.content?.find(
      (block: { type: string }) => block.type === 'text'
    );
    return textBlock?.text ?? null;
  } catch (error) {
    console.error('Claude API call failed:', error);
    return null;
  }
}

// ─── Data Formatting for Prompt ────────────────────────────────────────────────

/**
 * Format the subject property and comps into a structured text block
 * for inclusion in the Claude prompt.
 */
function formatDataForPrompt(
  subject: PropertyDetails,
  analyzedComps: AnalyzedComp[],
  enrichment: NeighborhoodProfile | null
): string {
  const lines: string[] = [];

  // Subject property
  lines.push('## SUBJECT PROPERTY');
  lines.push(`Address: ${subject.address}`);
  lines.push(`City/State/Zip: ${subject.city}, ${subject.state} ${subject.zip}`);
  lines.push(`County: ${subject.county}`);
  lines.push(`Property Type: ${subject.propertyType}`);
  lines.push(`Sq Ft: ${formatNumber(subject.sqft)}`);
  lines.push(`Bedrooms: ${subject.bedrooms} | Bathrooms: ${subject.bathrooms}`);
  lines.push(`Year Built: ${subject.yearBuilt}`);
  lines.push(`Lot Size: ${formatNumber(subject.lotSqft)} sqft`);
  lines.push(`Stories: ${subject.stories}`);
  lines.push(`Garage: ${subject.garage}`);
  lines.push(`Pool: ${subject.pool ? 'Yes' : 'No'}`);
  lines.push(`Assessed Value: ${formatCurrency(subject.assessedValue)}`);
  lines.push(`Annual Tax: ${formatCurrency(subject.taxAmount)}`);
  if (subject.lastSalePrice > 0) {
    lines.push(`Last Sale: ${formatCurrency(subject.lastSalePrice)} on ${subject.lastSaleDate}`);
  }
  lines.push('');

  // Comparable sales
  lines.push(`## COMPARABLE SALES (${analyzedComps.length} comps)`);
  lines.push('');

  analyzedComps.forEach((comp, idx) => {
    const b = comp.adjustmentBreakdown;
    lines.push(`### Comp ${idx + 1}: ${comp.address}`);
    lines.push(`Sale Price: ${formatCurrency(comp.salePrice)} | Sale Date: ${comp.saleDate}`);
    lines.push(`Distance: ${comp.distanceFromSubject} miles`);
    lines.push(`Sq Ft: ${formatNumber(comp.sqft)} | Beds: ${comp.bedrooms} | Baths: ${comp.bathrooms}`);
    lines.push(`Year Built: ${comp.yearBuilt} | Lot: ${formatNumber(comp.lotSqft)} sqft`);
    lines.push(`Garage: ${comp.garage} | Pool: ${comp.pool ? 'Yes' : 'No'}`);
    lines.push(`Price Source: ${comp.priceSource} | Doc Type: ${comp.documentType}`);
    if (comp.daysOnMarket !== undefined) lines.push(`Days on Market: ${comp.daysOnMarket}`);
    if (comp.listPrice) lines.push(`List Price: ${formatCurrency(comp.listPrice)}`);
    lines.push('');
    lines.push('Adjustments:');
    lines.push(`  Sq Ft: ${b.sqft >= 0 ? '+' : ''}${formatCurrency(b.sqft)}`);
    lines.push(`  Bedrooms: ${b.bedrooms >= 0 ? '+' : ''}${formatCurrency(b.bedrooms)}`);
    lines.push(`  Bathrooms: ${b.bathrooms >= 0 ? '+' : ''}${formatCurrency(b.bathrooms)}`);
    lines.push(`  Age: ${b.age >= 0 ? '+' : ''}${formatCurrency(b.age)}`);
    lines.push(`  Lot: ${b.lot >= 0 ? '+' : ''}${formatCurrency(b.lot)}`);
    lines.push(`  Pool: ${b.pool >= 0 ? '+' : ''}${formatCurrency(b.pool)}`);
    lines.push(`  Garage: ${b.garage >= 0 ? '+' : ''}${formatCurrency(b.garage)}`);
    lines.push(`  Condition: ${b.condition >= 0 ? '+' : ''}${formatCurrency(b.condition)}`);
    lines.push(`  Location: ${b.location >= 0 ? '+' : ''}${formatCurrency(b.location)}`);
    lines.push(`  Market Conditions: ${b.marketConditions >= 0 ? '+' : ''}${formatCurrency(b.marketConditions)}`);
    lines.push(`  ─────────────────`);
    lines.push(`  Net Adjustment: ${b.total >= 0 ? '+' : ''}${formatCurrency(b.total)}`);
    lines.push(`  Gross Adjustment: ${formatCurrency(b.grossAdjustment)} (${b.grossAdjustmentPct}% of sale price)`);
    lines.push(`  Adjusted Value: ${formatCurrency(b.adjustedValue)}`);
    lines.push(`  Quality Rating: ${b.qualityRating}`);
    lines.push('');
  });

  // Enrichment data
  if (enrichment) {
    lines.push('## NEIGHBORHOOD DATA');
    const d = enrichment.demographics;
    lines.push(`Median Income: ${formatCurrency(d.medianIncome)}`);
    lines.push(`Median Home Value: ${formatCurrency(d.medianHomeValue)}`);
    lines.push(`Population: ${formatNumber(d.population)} (Growth: ${d.populationGrowthPct}%)`);
    lines.push(`Median Age: ${d.medianAge}`);
    lines.push(`College Educated: ${d.collegeEducatedPct}%`);
    lines.push(`Owner Occupied: ${d.ownerOccupiedPct}%`);
    lines.push(`Unemployment Rate: ${d.unemploymentRate}%`);
    lines.push(`Poverty Rate: ${d.povertyRate}%`);
    lines.push(`Median Rent: ${formatCurrency(d.medianRent)}`);
    lines.push('');

    const n = enrichment.neighborhood;
    if (n.walkScore !== null) lines.push(`Walk Score: ${n.walkScore}/100`);
    if (n.transitScore !== null) lines.push(`Transit Score: ${n.transitScore}/100`);
    if (n.bikeScore !== null) lines.push(`Bike Score: ${n.bikeScore}/100`);
    lines.push('');

    lines.push('Schools:');
    enrichment.schools.forEach((s) => {
      lines.push(`  - ${s.name} (${s.type}, ${s.grades}) — Rating: ${s.rating}/10, Distance: ${s.distance} mi`);
    });
    lines.push('');

    const c = enrichment.crime;
    lines.push(`Crime Index: ${c.crimeIndex} (Compared to National: ${c.comparedToNational})`);
    lines.push(`Violent Crime Rate: ${c.violentCrimeRate} per 100k`);
    lines.push(`Property Crime Rate: ${c.propertyCrimeRate} per 100k`);
  }

  return lines.join('\n');
}

// ─── Template-Based Fallback Narrative ─────────────────────────────────────────

/**
 * Generate a template-based narrative when Claude API is unavailable.
 */
function generateTemplateNarrative(
  subject: PropertyDetails,
  analyzedComps: AnalyzedComp[],
  enrichment: NeighborhoodProfile | null
): string {
  const adjustedValues = analyzedComps.map((c) => c.adjustmentBreakdown.adjustedValue);
  const avgAdjusted =
    adjustedValues.length > 0
      ? Math.round(adjustedValues.reduce((a, b) => a + b, 0) / adjustedValues.length)
      : 0;
  const minAdjusted = adjustedValues.length > 0 ? Math.min(...adjustedValues) : 0;
  const maxAdjusted = adjustedValues.length > 0 ? Math.max(...adjustedValues) : 0;

  // Weight by quality
  const qualityWeights: Record<string, number> = {
    Excellent: 4,
    Good: 3,
    Fair: 2,
    Poor: 1,
  };
  let weightedSum = 0;
  let totalWeight = 0;
  analyzedComps.forEach((c) => {
    const w = qualityWeights[c.adjustmentBreakdown.qualityRating] || 1;
    weightedSum += c.adjustmentBreakdown.adjustedValue * w;
    totalWeight += w;
  });
  const weightedAvg = totalWeight > 0 ? Math.round(weightedSum / totalWeight) : avgAdjusted;

  const goodOrBetter = analyzedComps.filter(
    (c) =>
      c.adjustmentBreakdown.qualityRating === 'Excellent' ||
      c.adjustmentBreakdown.qualityRating === 'Good'
  );
  const confidenceLevel =
    goodOrBetter.length >= 5
      ? 'High'
      : goodOrBetter.length >= 3
        ? 'Medium'
        : 'Low';

  const valueLow = Math.round(weightedAvg * 0.95 / 1000) * 1000;
  const valueHigh = Math.round(weightedAvg * 1.05 / 1000) * 1000;

  const sections: string[] = [];

  // Executive Summary
  sections.push('# Executive Summary\n');
  sections.push(
    `This comparable market analysis evaluates **${subject.address}** in ${subject.city}, ${stateNameFromCode(subject.state)} ${subject.zip}. ` +
    `The subject is a ${subject.sqft.toLocaleString()} sqft ${subject.propertyType} with ${subject.bedrooms} bedrooms and ${subject.bathrooms} bathrooms, built in ${subject.yearBuilt}.\n`
  );
  sections.push(
    `Based on analysis of ${analyzedComps.length} comparable sales, the estimated market value is **${formatCurrency(weightedAvg)}**, ` +
    `within a range of ${formatCurrency(valueLow)} to ${formatCurrency(valueHigh)}. ` +
    `Confidence level: **${confidenceLevel}** (${goodOrBetter.length} of ${analyzedComps.length} comps rated Good or Excellent).\n`
  );

  // Subject Property
  sections.push('\n# Subject Property Analysis\n');
  sections.push(
    `The subject property at ${subject.address} is a ${subject.stories}-story ${subject.propertyType} ` +
    `situated on a ${formatNumber(subject.lotSqft)} sqft lot in ${subject.county}. ` +
    `Built in ${subject.yearBuilt}, the home offers ${formatNumber(subject.sqft)} square feet of living space ` +
    `with ${subject.bedrooms} bedrooms and ${subject.bathrooms} bathrooms. ` +
    `${subject.pool ? 'The property features a swimming pool. ' : ''}` +
    `${subject.garage !== 'None' ? `Parking is provided by a ${subject.garage.toLowerCase()} garage. ` : ''}` +
    `The county-assessed value is ${formatCurrency(subject.assessedValue)} with annual taxes of ${formatCurrency(subject.taxAmount)}.\n`
  );
  if (subject.lastSalePrice > 0) {
    sections.push(
      `The property last sold on ${subject.lastSaleDate} for ${formatCurrency(subject.lastSalePrice)}.\n`
    );
  }

  // Comp Analysis Summary
  sections.push('\n# Comparable Sales Analysis\n');
  sections.push(
    `${analyzedComps.length} comparable sales were identified and analyzed. ` +
    `After applying market-standard adjustments for differences in size, features, condition, location, and market conditions, ` +
    `the adjusted values range from ${formatCurrency(minAdjusted)} to ${formatCurrency(maxAdjusted)}.\n`
  );

  analyzedComps.slice(0, 6).forEach((comp, idx) => {
    const b = comp.adjustmentBreakdown;
    sections.push(
      `**Comp ${idx + 1}**: ${comp.address} — Sold ${comp.saleDate} for ${formatCurrency(comp.salePrice)}. ` +
      `Adjusted to ${formatCurrency(b.adjustedValue)} (net adjustment: ${b.total >= 0 ? '+' : ''}${formatCurrency(b.total)}, ` +
      `gross: ${b.grossAdjustmentPct}%). Quality: ${b.qualityRating}.\n`
    );
  });

  // Value Conclusion
  sections.push('\n# Value Conclusion\n');
  sections.push(
    `Based on the quality-weighted analysis of ${analyzedComps.length} comparable sales, ` +
    `the estimated market value of the subject property is **${formatCurrency(weightedAvg)}**, ` +
    `with a probable value range of **${formatCurrency(valueLow)} to ${formatCurrency(valueHigh)}**.\n`
  );
  sections.push(
    `The ${confidenceLevel.toLowerCase()} confidence level reflects ` +
    `${confidenceLevel === 'High' ? 'strong comp quality and adequate transaction volume in the subject area' : confidenceLevel === 'Medium' ? 'reasonable comp quality, though additional comparable data could increase reliability' : 'limited comparable data availability — this estimate should be supplemented with additional research'}.\n`
  );

  // Disclaimer
  sections.push('\n# Disclaimer\n');
  sections.push(
    'This is a comparable market analysis (CMA) generated using public records data and automated analysis. ' +
    'It is not a formal appraisal and should not be used as a substitute for a licensed appraisal ' +
    'when one is required by a lender or for legal purposes. The estimated values are based on ' +
    'available comparable sales data and standard adjustment methodology. Actual market value may ' +
    'vary based on property condition, features not captured in public records, and current market conditions.'
  );

  return sections.join('\n');
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a narrative for the report using the Claude API.
 * Falls back to template-based narrative if the API is unavailable.
 *
 * @param subject - Subject property details
 * @param comps - Array of comparable sales
 * @param adjustments - Analyzed comps with adjustment breakdowns
 * @param enrichment - Optional neighborhood enrichment data
 * @returns Narrative text for the report
 */
export async function generateNarrative(
  subject: PropertyDetails,
  comps: CompSale[],
  analyzedComps: AnalyzedComp[],
  enrichment: NeighborhoodProfile | null
): Promise<string> {
  const dataBlock = formatDataForPrompt(subject, analyzedComps, enrichment);

  const userMessage = `Please analyze the following subject property and comparable sales data, then produce a complete comparable market analysis report following the output structure in your instructions.\n\n${dataBlock}`;

  // Try Claude API first
  const aiNarrative = await callClaude(REPORT_SYSTEM_PROMPT, [
    { role: 'user', content: userMessage },
  ]);

  if (aiNarrative) {
    return aiNarrative;
  }

  // Fall back to template-based narrative
  return generateTemplateNarrative(subject, analyzedComps, enrichment);
}

/**
 * Generate a full report including analysis, narrative, and all enrichment data.
 *
 * @param input - All inputs for report generation
 * @returns Complete generated report
 */
export async function generateReport(
  input: ReportGenerationInput
): Promise<GeneratedReport> {
  const { subject, comps, enrichment, config, userId, reportType } = input;

  // 1. Analyze comps with adjustments
  const analyzedComps = analyzeComps(subject, comps);

  // 2. Calculate value estimate
  const adjustedValues = analyzedComps.map((c) => c.adjustmentBreakdown.adjustedValue);
  const qualityWeights: Record<string, number> = {
    Excellent: 4,
    Good: 3,
    Fair: 2,
    Poor: 1,
  };
  let weightedSum = 0;
  let totalWeight = 0;
  analyzedComps.forEach((c) => {
    const w = qualityWeights[c.adjustmentBreakdown.qualityRating] || 1;
    weightedSum += c.adjustmentBreakdown.adjustedValue * w;
    totalWeight += w;
  });
  const valueEstimate = totalWeight > 0 ? Math.round(weightedSum / totalWeight / 1000) * 1000 : 0;
  const valueLow = Math.round(valueEstimate * 0.95 / 1000) * 1000;
  const valueHigh = Math.round(valueEstimate * 1.05 / 1000) * 1000;

  // 3. AI confidence
  const goodOrBetter = analyzedComps.filter(
    (c) =>
      c.adjustmentBreakdown.qualityRating === 'Excellent' ||
      c.adjustmentBreakdown.qualityRating === 'Good'
  );
  const aiConfidence = Math.min(
    100,
    Math.round(
      (goodOrBetter.length / Math.max(analyzedComps.length, 1)) * 80 +
      Math.min(analyzedComps.length, 10) * 2
    )
  );

  // 4. Generate narrative (AI or template)
  let aiNarrative: string;
  if (config.includeAINarrative) {
    aiNarrative = await generateNarrative(subject, comps, analyzedComps, enrichment);
  } else {
    aiNarrative = generateTemplateNarrative(subject, analyzedComps, enrichment);
  }

  // 5. Build market trends if requested
  let marketTrends: MarketTrends | null = null;
  if (config.includeMarketTrends && analyzedComps.length > 0) {
    const marketNarrative = await generateMarketNarrative(
      analyzedComps,
      subject.zip,
      enrichment?.demographics
    );

    // Build trend data from comps
    const sortedByDate = [...analyzedComps].sort(
      (a, b) => new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
    );
    const trends = sortedByDate.map((c) => ({
      date: c.saleDate,
      medianPrice: c.salePrice,
      medianPricePerSqft: c.sqft > 0 ? Math.round(c.salePrice / c.sqft) : 0,
      inventoryCount: analyzedComps.length,
      daysOnMarket: c.daysOnMarket ?? 0,
      listToSaleRatio: c.listPrice ? Math.round((c.salePrice / c.listPrice) * 1000) / 1000 : 1,
    }));

    const avgDom = analyzedComps
      .filter((c) => c.daysOnMarket !== undefined)
      .reduce((sum, c, _, arr) => sum + (c.daysOnMarket ?? 0) / arr.length, 0);

    marketTrends = {
      trends,
      appreciationRate12Month: 4.0, // Estimated
      appreciationRate36Month: 3.5,
      forecastAppreciation12Month: 3.8,
      marketType: avgDom < 30 ? 'sellers' : avgDom > 60 ? 'buyers' : 'balanced',
      averageDaysOnMarket: Math.round(avgDom),
      monthsOfSupply: Math.round((analyzedComps.length / 12) * 10) / 10,
    };
  }

  // 6. Build neighborhood data
  let neighborhoodData: NeighborhoodData | null = null;
  let schoolData: SchoolData[] | null = null;
  let crimeData: CrimeData | null = null;

  if (enrichment) {
    if (config.includeNeighborhoodData) {
      neighborhoodData = enrichment.neighborhood;
    }
    if (config.includeSchoolData) {
      schoolData = enrichment.schools;
    }
    if (config.includeCrimeData) {
      crimeData = enrichment.crime;
    }
  }

  // 7. Assemble the report
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30); // Reports expire in 30 days

  const report: GeneratedReport = {
    id: generateId(),
    subjectProperty: subject,
    comps: analyzedComps.map((c) => {
      // Strip the adjustmentBreakdown to match CompSale type
      const { adjustmentBreakdown, ...compData } = c;
      return compData;
    }),
    aiNarrative,
    valueLow,
    valueHigh,
    valueEstimate,
    aiConfidence,
    neighborhoodData,
    schoolData,
    crimeData,
    marketTrends,
    pdfUrl: null, // Set after PDF generation
    reportType,
    config,
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    userId,
    addressedTo: config.addressedTo,
    customNotes: config.customNotes,
  };

  return report;
}
