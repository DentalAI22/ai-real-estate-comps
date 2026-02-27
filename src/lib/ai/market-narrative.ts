/**
 * Market narrative generator.
 * Analyzes comp trends to produce a market conditions narrative.
 * Uses template-based generation with optional AI enhancement.
 */

import type { CompSale } from '@/types';
import type { CensusData } from '@/lib/data/census-api';
import { formatCurrency, formatNumber } from '@/lib/utils';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface MarketMetrics {
  avgPricePerSqft: number;
  medianSalePrice: number;
  avgSalePrice: number;
  minPrice: number;
  maxPrice: number;
  avgDaysOnMarket: number;
  avgListToSaleRatio: number;
  salesVolume: number;
  oldestSale: Date;
  newestSale: Date;
  appreciationTrend: 'appreciating' | 'stable' | 'declining';
  annualAppreciationEst: number;
  marketType: 'buyers' | 'balanced' | 'sellers';
}

// ─── Analysis Helpers ──────────────────────────────────────────────────────────

/**
 * Calculate aggregate market metrics from comparable sales.
 */
function calculateMetrics(comps: CompSale[]): MarketMetrics {
  if (comps.length === 0) {
    return {
      avgPricePerSqft: 0,
      medianSalePrice: 0,
      avgSalePrice: 0,
      minPrice: 0,
      maxPrice: 0,
      avgDaysOnMarket: 0,
      avgListToSaleRatio: 0,
      salesVolume: 0,
      oldestSale: new Date(),
      newestSale: new Date(),
      appreciationTrend: 'stable',
      annualAppreciationEst: 0,
      marketType: 'balanced',
    };
  }

  const prices = comps.map((c) => c.salePrice).sort((a, b) => a - b);
  const ppsf = comps
    .filter((c) => c.sqft > 0)
    .map((c) => c.salePrice / c.sqft);
  const dates = comps.map((c) => new Date(c.saleDate)).sort((a, b) => a.getTime() - b.getTime());

  const avgPricePerSqft =
    ppsf.length > 0
      ? Math.round(ppsf.reduce((a, b) => a + b, 0) / ppsf.length)
      : 0;

  const medianSalePrice =
    prices.length % 2 === 0
      ? Math.round((prices[prices.length / 2 - 1] + prices[prices.length / 2]) / 2)
      : prices[Math.floor(prices.length / 2)];

  const avgSalePrice = Math.round(
    prices.reduce((a, b) => a + b, 0) / prices.length
  );

  const daysOnMarket = comps
    .filter((c) => c.daysOnMarket !== undefined)
    .map((c) => c.daysOnMarket!);
  const avgDaysOnMarket =
    daysOnMarket.length > 0
      ? Math.round(
          daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length
        )
      : 0;

  // List-to-sale ratio
  const ratios = comps
    .filter((c) => c.listPrice && c.listPrice > 0)
    .map((c) => c.salePrice / c.listPrice!);
  const avgListToSaleRatio =
    ratios.length > 0
      ? Math.round((ratios.reduce((a, b) => a + b, 0) / ratios.length) * 1000) / 1000
      : 0;

  // Appreciation trend: compare average price of older half vs newer half
  const midIdx = Math.floor(comps.length / 2);
  const sortedByDate = [...comps].sort(
    (a, b) => new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
  );
  const olderHalf = sortedByDate.slice(0, midIdx);
  const newerHalf = sortedByDate.slice(midIdx);

  const olderAvgPpsf =
    olderHalf.length > 0
      ? olderHalf
          .filter((c) => c.sqft > 0)
          .reduce((sum, c) => sum + c.salePrice / c.sqft, 0) /
        olderHalf.filter((c) => c.sqft > 0).length
      : 0;
  const newerAvgPpsf =
    newerHalf.length > 0
      ? newerHalf
          .filter((c) => c.sqft > 0)
          .reduce((sum, c) => sum + c.salePrice / c.sqft, 0) /
        newerHalf.filter((c) => c.sqft > 0).length
      : 0;

  let appreciationTrend: MarketMetrics['appreciationTrend'] = 'stable';
  let annualAppreciationEst = 0;

  if (olderAvgPpsf > 0 && newerAvgPpsf > 0) {
    const changePct = (newerAvgPpsf - olderAvgPpsf) / olderAvgPpsf;
    // Annualize based on the time span
    const monthSpan =
      (dates[dates.length - 1].getTime() - dates[0].getTime()) /
      (1000 * 60 * 60 * 24 * 30);
    if (monthSpan > 0) {
      annualAppreciationEst =
        Math.round(((changePct / monthSpan) * 12) * 1000) / 10; // as percentage
    }

    if (changePct > 0.03) appreciationTrend = 'appreciating';
    else if (changePct < -0.03) appreciationTrend = 'declining';
  }

  // Market type: based on days on market and list-to-sale ratio
  let marketType: MarketMetrics['marketType'] = 'balanced';
  if (avgDaysOnMarket > 0) {
    if (avgDaysOnMarket < 30 && avgListToSaleRatio > 0.98) {
      marketType = 'sellers';
    } else if (avgDaysOnMarket > 60 && avgListToSaleRatio < 0.96) {
      marketType = 'buyers';
    }
  }

  return {
    avgPricePerSqft,
    medianSalePrice,
    avgSalePrice,
    minPrice: prices[0],
    maxPrice: prices[prices.length - 1],
    avgDaysOnMarket,
    avgListToSaleRatio,
    salesVolume: comps.length,
    oldestSale: dates[0],
    newestSale: dates[dates.length - 1],
    appreciationTrend,
    annualAppreciationEst,
    marketType,
  };
}

// ─── Narrative Templates ───────────────────────────────────────────────────────

function trendDescription(trend: MarketMetrics['appreciationTrend'], rate: number): string {
  const absRate = Math.abs(rate);
  switch (trend) {
    case 'appreciating':
      return `an appreciating trend with values increasing at an estimated annual rate of ${absRate}%`;
    case 'declining':
      return `a declining trend with values decreasing at an estimated annual rate of ${absRate}%`;
    case 'stable':
      return `a stable market with values holding relatively flat (estimated ${rate > 0 ? '+' : ''}${rate}% annually)`;
  }
}

function marketTypeDescription(type: MarketMetrics['marketType']): string {
  switch (type) {
    case 'sellers':
      return "a seller's market where demand outpaces supply, giving sellers negotiating leverage";
    case 'buyers':
      return "a buyer's market with elevated inventory and longer marketing times, giving buyers more options and negotiating power";
    case 'balanced':
      return 'a balanced market where supply and demand are roughly in equilibrium';
  }
}

function formatDateRange(oldest: Date, newest: Date): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  return `${months[oldest.getMonth()]} ${oldest.getFullYear()} to ${months[newest.getMonth()]} ${newest.getFullYear()}`;
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a market narrative from comparable sales data.
 *
 * Produces 2-3 paragraphs analyzing price trends, market temperature,
 * supply/demand dynamics, and price per square foot.
 * Falls back to template-based generation (no AI dependency for MVP).
 *
 * @param comps - Array of comparable sales
 * @param zip - Subject property zip code
 * @param enrichment - Optional census data for additional context
 * @returns Market narrative as a string
 */
export async function generateMarketNarrative(
  comps: CompSale[],
  zip: string,
  enrichment?: CensusData
): Promise<string> {
  if (comps.length === 0) {
    return 'Insufficient comparable sales data to generate a market narrative. No comps were found within the specified search criteria.';
  }

  const m = calculateMetrics(comps);

  // Paragraph 1: Price trends and volume
  const dateRange = formatDateRange(m.oldestSale, m.newestSale);
  const para1 = `Based on ${m.salesVolume} comparable sales recorded from ${dateRange}, the local market in the ${zip} area is showing ${trendDescription(m.appreciationTrend, m.annualAppreciationEst)}. The median sale price among analyzed comps is ${formatCurrency(m.medianSalePrice)}, with prices ranging from ${formatCurrency(m.minPrice)} to ${formatCurrency(m.maxPrice)}. The average price per square foot is $${formatNumber(m.avgPricePerSqft)}, which ${enrichment && enrichment.medianHomeValue > 0 ? `compares to a census-reported median home value of ${formatCurrency(enrichment.medianHomeValue)} for the broader zip code area` : 'reflects current market conditions in this submarket'}.`;

  // Paragraph 2: Market temperature and dynamics
  let para2: string;
  if (m.avgDaysOnMarket > 0) {
    const listToSaleStr =
      m.avgListToSaleRatio > 0
        ? ` Properties are selling at approximately ${Math.round(m.avgListToSaleRatio * 100)}% of their list price.`
        : '';
    para2 = `Current conditions suggest ${marketTypeDescription(m.marketType)}. The average days on market for comparable properties is ${m.avgDaysOnMarket} days.${listToSaleStr} The volume of ${m.salesVolume} sales in this period ${m.salesVolume >= 10 ? 'indicates healthy market activity with adequate transaction data for reliable analysis' : m.salesVolume >= 5 ? 'provides a reasonable basis for analysis, though additional comps would increase confidence' : 'is limited, suggesting either low turnover in this area or restrictive search parameters — the analysis should be interpreted with caution'}.`;
  } else {
    para2 = `Current conditions suggest ${marketTypeDescription(m.marketType)}. The volume of ${m.salesVolume} comparable sales ${m.salesVolume >= 10 ? 'provides strong support for the analysis' : 'is adequate for a preliminary assessment, though broader search criteria may yield additional supporting data'}.`;
  }

  // Paragraph 3: Outlook
  let outlook: string;
  if (enrichment) {
    const growthContext =
      enrichment.populationGrowthPct > 1.5
        ? `Strong population growth of ${enrichment.populationGrowthPct}% suggests continued housing demand.`
        : enrichment.populationGrowthPct > 0
          ? `Moderate population growth of ${enrichment.populationGrowthPct}% supports stable demand.`
          : `Flat or declining population trends may put downward pressure on demand.`;

    const incomeContext =
      enrichment.medianIncome > 80000
        ? `The area's median household income of ${formatCurrency(enrichment.medianIncome)} indicates strong purchasing power.`
        : enrichment.medianIncome > 55000
          ? `The area's median household income of ${formatCurrency(enrichment.medianIncome)} is near the national average, supporting steady demand at current price levels.`
          : `The area's median household income of ${formatCurrency(enrichment.medianIncome)} may limit price growth unless wage growth accelerates.`;

    outlook = `Looking ahead, ${growthContext} ${incomeContext} Based on current trends, values in this submarket are expected to ${m.appreciationTrend === 'appreciating' ? 'continue their upward trajectory, though the pace may moderate' : m.appreciationTrend === 'declining' ? 'face continued pressure, with stabilization possible if economic conditions improve' : 'remain relatively stable, with modest appreciation in line with broader economic growth'}.`;
  } else {
    outlook = `Based on current comparable sales trends, the market appears ${m.appreciationTrend === 'appreciating' ? 'healthy with upward momentum' : m.appreciationTrend === 'declining' ? 'under some pressure, warranting careful monitoring' : 'stable and predictable'}. As always, local economic conditions, interest rate changes, and inventory levels will continue to influence near-term price trends.`;
  }

  return `${para1}\n\n${para2}\n\n${outlook}`;
}
