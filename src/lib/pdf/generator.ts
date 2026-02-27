/**
 * PDF report generator using @react-pdf/renderer.
 * Produces a professional, multi-page comparable market analysis PDF.
 *
 * Design: Navy headers (#1a2744), gold accents (#c9a84c), clean white body.
 * Pages: Cover, Executive Summary, Subject Property, Comp Analysis,
 *        Market Trends, Neighborhood, Value Conclusion, Disclaimers.
 *
 * If branding is provided (Branded tier), the PDF includes agent logo,
 * headshot, company info, and custom colors.
 */

import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  renderToBuffer,
  Font,
} from '@react-pdf/renderer';
import type { GeneratedReport, BrandingProfile, CompSale } from '@/types';
import { formatCurrency, formatNumber, formatDate, stateNameFromCode } from '@/lib/utils';

// ─── Color Palette ─────────────────────────────────────────────────────────────

interface Colors {
  navy: string;
  navyLight: string;
  gold: string;
  goldLight: string;
  white: string;
  gray100: string;
  gray200: string;
  gray400: string;
  gray600: string;
  gray800: string;
  black: string;
  green: string;
  red: string;
}

const COLORS: Colors = {
  navy: '#1a2744',
  navyLight: '#2d3f5e',
  gold: '#c9a84c',
  goldLight: '#f0e6c8',
  white: '#ffffff',
  gray100: '#f7f7f8',
  gray200: '#e5e7eb',
  gray400: '#9ca3af',
  gray600: '#4b5563',
  gray800: '#1f2937',
  black: '#000000',
  green: '#16a34a',
  red: '#dc2626',
};

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: COLORS.gray800,
    backgroundColor: COLORS.white,
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 45,
  },
  coverPage: {
    fontFamily: 'Helvetica',
    backgroundColor: COLORS.navy,
    color: COLORS.white,
    paddingHorizontal: 50,
    paddingVertical: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Header / Footer
  header: {
    position: 'absolute',
    top: 15,
    left: 45,
    right: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.gray200,
  },
  headerText: {
    fontSize: 7,
    color: COLORS.gray400,
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 45,
    right: 45,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.gray200,
  },
  footerText: {
    fontSize: 7,
    color: COLORS.gray400,
  },
  // Section headings
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.gold,
  },
  subsectionTitle: {
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navyLight,
    marginTop: 14,
    marginBottom: 6,
  },
  // Text styles
  body: {
    fontSize: 10,
    lineHeight: 1.5,
    color: COLORS.gray800,
    marginBottom: 8,
  },
  bold: {
    fontFamily: 'Helvetica-Bold',
  },
  small: {
    fontSize: 8,
    color: COLORS.gray600,
    lineHeight: 1.4,
  },
  // Value callout box
  valueBox: {
    backgroundColor: COLORS.navy,
    borderRadius: 6,
    padding: 18,
    marginVertical: 12,
    alignItems: 'center',
  },
  valueLabel: {
    fontSize: 10,
    color: COLORS.gold,
    marginBottom: 4,
    textTransform: 'uppercase' as const,
    letterSpacing: 1,
  },
  valueAmount: {
    fontSize: 28,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    marginBottom: 4,
  },
  valueRange: {
    fontSize: 10,
    color: COLORS.gray400,
  },
  // Table styles
  table: {
    marginVertical: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.gray200,
    paddingVertical: 5,
    alignItems: 'center',
  },
  tableHeaderRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.navy,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 2,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textTransform: 'uppercase' as const,
  },
  tableCell: {
    fontSize: 9,
    color: COLORS.gray800,
    paddingHorizontal: 4,
  },
  tableCellRight: {
    fontSize: 9,
    color: COLORS.gray800,
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  // Comp card
  compCard: {
    backgroundColor: COLORS.gray100,
    borderRadius: 4,
    padding: 12,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  compHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  compTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
  },
  compPrice: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.green,
  },
  // Stat grid
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 8,
  },
  statBox: {
    width: '25%',
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.navy,
  },
  statLabel: {
    fontSize: 7,
    color: COLORS.gray600,
    marginTop: 2,
    textTransform: 'uppercase' as const,
  },
  // Gold divider
  goldDivider: {
    height: 2,
    backgroundColor: COLORS.gold,
    marginVertical: 12,
  },
  // Adjustment row
  adjustmentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  adjustmentLabel: {
    fontSize: 9,
    color: COLORS.gray600,
  },
  adjustmentPositive: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.green,
  },
  adjustmentNegative: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.red,
  },
  adjustmentZero: {
    fontSize: 9,
    color: COLORS.gray400,
  },
  // Cover elements
  coverGoldBar: {
    width: 80,
    height: 3,
    backgroundColor: COLORS.gold,
    marginVertical: 20,
  },
  coverTitle: {
    fontSize: 32,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textAlign: 'center',
    marginBottom: 6,
  },
  coverSubtitle: {
    fontSize: 14,
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: 4,
  },
  coverAddress: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textAlign: 'center',
    marginTop: 30,
  },
  coverDetail: {
    fontSize: 11,
    color: COLORS.gray400,
    textAlign: 'center',
    marginTop: 4,
  },
  coverDate: {
    fontSize: 10,
    color: COLORS.gray400,
    textAlign: 'center',
    marginTop: 30,
  },
  // Branding
  brandingBlock: {
    position: 'absolute',
    bottom: 50,
    left: 50,
    right: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.navyLight,
  },
  brandingText: {
    fontSize: 9,
    color: COLORS.gray400,
    textAlign: 'center',
  },
  brandingName: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: COLORS.white,
    textAlign: 'center',
  },
});

// ─── Utility Components ────────────────────────────────────────────────────────

function PageHeader({ address, reportId }: { address: string; reportId: string }) {
  return React.createElement(View, { style: styles.header, fixed: true },
    React.createElement(Text, { style: styles.headerText }, `Comparable Market Analysis — ${address}`),
    React.createElement(Text, { style: styles.headerText }, `Report #${reportId.slice(0, 8)}`)
  );
}

function PageFooter({ companyName }: { companyName?: string }) {
  return React.createElement(View, { style: styles.footer, fixed: true },
    React.createElement(Text, { style: styles.footerText },
      companyName ?? 'AI Real Estate Comps'
    ),
    React.createElement(Text, {
      style: styles.footerText,
      render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) =>
        `Page ${pageNumber} of ${totalPages}`,
    })
  );
}

function AdjustmentLine({ label, amount }: { label: string; amount: number }) {
  const absAmount = Math.abs(amount);
  const formatted = formatCurrency(absAmount);
  const display = amount > 0 ? `+${formatted}` : amount < 0 ? `-${formatted}` : '$0';
  const valueStyle = amount > 0
    ? styles.adjustmentPositive
    : amount < 0
      ? styles.adjustmentNegative
      : styles.adjustmentZero;

  return React.createElement(View, { style: styles.adjustmentRow },
    React.createElement(Text, { style: styles.adjustmentLabel }, label),
    React.createElement(Text, { style: valueStyle }, display)
  );
}

function GoldDivider() {
  return React.createElement(View, { style: styles.goldDivider });
}

// ─── Page Components ───────────────────────────────────────────────────────────

function CoverPage({
  report,
  branding,
}: {
  report: GeneratedReport;
  branding?: BrandingProfile;
}) {
  const subject = report.subjectProperty;

  const children = [
    React.createElement(View, { key: 'spacer-top', style: { flex: 1 } }),
    React.createElement(View, { key: 'bar', style: styles.coverGoldBar }),
    React.createElement(Text, { key: 'title', style: styles.coverTitle }, 'Comparable Market Analysis'),
    React.createElement(Text, { key: 'subtitle', style: styles.coverSubtitle }, 'Residential Property Valuation Report'),
    React.createElement(View, { key: 'bar2', style: styles.coverGoldBar }),
    React.createElement(Text, { key: 'addr', style: styles.coverAddress }, subject.address),
    React.createElement(Text, { key: 'city', style: styles.coverDetail },
      `${subject.city}, ${stateNameFromCode(subject.state)} ${subject.zip}`
    ),
    React.createElement(Text, { key: 'value', style: [styles.coverDetail, { marginTop: 20, fontSize: 14, color: COLORS.gold }] },
      `Estimated Value: ${formatCurrency(report.valueEstimate)}`
    ),
    React.createElement(Text, { key: 'range', style: styles.coverDetail },
      `Range: ${formatCurrency(report.valueLow)} — ${formatCurrency(report.valueHigh)}`
    ),
    React.createElement(Text, { key: 'date', style: styles.coverDate },
      `Report Generated: ${formatDate(report.createdAt)}`
    ),
    report.addressedTo
      ? React.createElement(Text, { key: 'addressee', style: [styles.coverDate, { marginTop: 8 }] },
          `Prepared for: ${report.addressedTo}`
        )
      : null,
    React.createElement(View, { key: 'spacer-bottom', style: { flex: 1 } }),
  ];

  if (branding) {
    children.push(
      React.createElement(View, { key: 'branding', style: styles.brandingBlock },
        React.createElement(View, null,
          React.createElement(Text, { style: styles.brandingName }, branding.agentName),
          React.createElement(Text, { style: styles.brandingText }, branding.agentTitle),
          React.createElement(Text, { style: styles.brandingText }, branding.companyName),
          React.createElement(Text, { style: styles.brandingText }, `${branding.phone} | ${branding.email}`)
        )
      )
    );
  }

  return React.createElement(
    Page, { size: 'LETTER', style: styles.coverPage },
    ...children.filter(Boolean)
  );
}

function ExecutiveSummaryPage({
  report,
  branding,
}: {
  report: GeneratedReport;
  branding?: BrandingProfile;
}) {
  const subject = report.subjectProperty;
  const compCount = report.comps.length;

  return React.createElement(Page, { size: 'LETTER', style: styles.page },
    React.createElement(PageHeader, { address: subject.address, reportId: report.id }),
    React.createElement(Text, { style: styles.sectionTitle }, 'Executive Summary'),
    React.createElement(View, { style: styles.valueBox },
      React.createElement(Text, { style: styles.valueLabel }, 'Estimated Market Value'),
      React.createElement(Text, { style: styles.valueAmount }, formatCurrency(report.valueEstimate)),
      React.createElement(Text, { style: styles.valueRange },
        `Range: ${formatCurrency(report.valueLow)} — ${formatCurrency(report.valueHigh)}`
      )
    ),
    React.createElement(View, { style: styles.statGrid },
      React.createElement(View, { style: styles.statBox },
        React.createElement(Text, { style: styles.statValue }, String(compCount)),
        React.createElement(Text, { style: styles.statLabel }, 'Comps Analyzed')
      ),
      React.createElement(View, { style: styles.statBox },
        React.createElement(Text, { style: styles.statValue }, `${report.aiConfidence}%`),
        React.createElement(Text, { style: styles.statLabel }, 'Confidence')
      ),
      React.createElement(View, { style: styles.statBox },
        React.createElement(Text, { style: styles.statValue },
          compCount > 0
            ? `$${Math.round(subject.sqft > 0 ? report.valueEstimate / subject.sqft : 0)}`
            : 'N/A'
        ),
        React.createElement(Text, { style: styles.statLabel }, 'Price / Sq Ft')
      ),
      React.createElement(View, { style: styles.statBox },
        React.createElement(Text, { style: styles.statValue }, report.reportType.toUpperCase()),
        React.createElement(Text, { style: styles.statLabel }, 'Report Tier')
      )
    ),
    React.createElement(GoldDivider),
    React.createElement(Text, { style: styles.subsectionTitle }, 'Subject Property'),
    React.createElement(Text, { style: styles.body },
      `${subject.address}, ${subject.city}, ${stateNameFromCode(subject.state)} ${subject.zip}. ` +
      `${formatNumber(subject.sqft)} sqft ${subject.propertyType}, ` +
      `${subject.bedrooms} bed / ${subject.bathrooms} bath, built ${subject.yearBuilt}. ` +
      `Lot: ${formatNumber(subject.lotSqft)} sqft. ` +
      `${subject.garage !== 'None' ? subject.garage + ' garage. ' : ''}` +
      `${subject.pool ? 'Pool. ' : ''}`
    ),
    React.createElement(PageFooter, { companyName: branding?.companyName })
  );
}

function CompAnalysisPage({
  report,
  comps,
  pageLabel,
  branding,
}: {
  report: GeneratedReport;
  comps: CompSale[];
  pageLabel: string;
  branding?: BrandingProfile;
}) {
  const subject = report.subjectProperty;

  return React.createElement(Page, { size: 'LETTER', style: styles.page },
    React.createElement(PageHeader, { address: subject.address, reportId: report.id }),
    React.createElement(Text, { style: styles.sectionTitle }, `Comparable Sales Analysis ${pageLabel}`),
    ...comps.map((comp, idx) =>
      React.createElement(View, { key: comp.id, style: styles.compCard, wrap: false },
        React.createElement(View, { style: styles.compHeader },
          React.createElement(Text, { style: styles.compTitle },
            `Comp ${idx + 1}: ${comp.address}`
          ),
          React.createElement(Text, { style: styles.compPrice }, formatCurrency(comp.salePrice))
        ),
        React.createElement(Text, { style: styles.small },
          `Sold ${comp.saleDate} | ${comp.distanceFromSubject} mi away | ` +
          `${formatNumber(comp.sqft)} sqft | ${comp.bedrooms}bd/${comp.bathrooms}ba | ` +
          `Built ${comp.yearBuilt}${comp.daysOnMarket !== undefined ? ` | ${comp.daysOnMarket} DOM` : ''}`
        ),
        React.createElement(View, { style: { marginTop: 6 } },
          React.createElement(AdjustmentLine, { label: 'Square Footage', amount: comp.adjustments.sqft }),
          React.createElement(AdjustmentLine, { label: 'Bedrooms', amount: comp.adjustments.bedrooms }),
          React.createElement(AdjustmentLine, { label: 'Bathrooms', amount: comp.adjustments.bathrooms }),
          React.createElement(AdjustmentLine, { label: 'Age/Year Built', amount: comp.adjustments.age }),
          React.createElement(AdjustmentLine, { label: 'Lot Size', amount: comp.adjustments.lot }),
          React.createElement(AdjustmentLine, { label: 'Pool', amount: comp.adjustments.pool }),
          React.createElement(AdjustmentLine, { label: 'Garage', amount: comp.adjustments.garage }),
          React.createElement(AdjustmentLine, { label: 'Condition', amount: comp.adjustments.condition }),
          React.createElement(AdjustmentLine, { label: 'Location', amount: comp.adjustments.location }),
          React.createElement(AdjustmentLine, { label: 'Market Conditions', amount: comp.adjustments.marketConditions }),
          React.createElement(View, { style: { borderTopWidth: 1, borderTopColor: COLORS.gray200, marginTop: 4, paddingTop: 4 } },
            React.createElement(View, { style: styles.adjustmentRow },
              React.createElement(Text, { style: [styles.adjustmentLabel, { fontFamily: 'Helvetica-Bold' }] }, 'Adjusted Value'),
              React.createElement(Text, { style: [styles.adjustmentPositive, { fontSize: 10 }] }, formatCurrency(comp.adjustedValue))
            )
          )
        )
      )
    ),
    React.createElement(PageFooter, { companyName: branding?.companyName })
  );
}

function ValueConclusionPage({
  report,
  branding,
}: {
  report: GeneratedReport;
  branding?: BrandingProfile;
}) {
  const subject = report.subjectProperty;

  return React.createElement(Page, { size: 'LETTER', style: styles.page },
    React.createElement(PageHeader, { address: subject.address, reportId: report.id }),
    React.createElement(Text, { style: styles.sectionTitle }, 'Value Conclusion'),
    React.createElement(View, { style: styles.valueBox },
      React.createElement(Text, { style: styles.valueLabel }, 'Final Estimated Market Value'),
      React.createElement(Text, { style: styles.valueAmount }, formatCurrency(report.valueEstimate)),
      React.createElement(Text, { style: styles.valueRange },
        `Low: ${formatCurrency(report.valueLow)}  |  High: ${formatCurrency(report.valueHigh)}`
      ),
      React.createElement(Text, { style: [styles.valueRange, { marginTop: 6 }] },
        `Confidence: ${report.aiConfidence}%  |  Based on ${report.comps.length} comparable sales`
      )
    ),
    React.createElement(GoldDivider),
    React.createElement(Text, { style: styles.subsectionTitle }, 'Methodology'),
    React.createElement(Text, { style: styles.body },
      'This valuation is derived from a quality-weighted analysis of comparable sales within the subject area. ' +
      'Each comp was individually adjusted for differences in size, features, condition, location, and market ' +
      'conditions using standard appraisal methodology. Comps rated Excellent or Good receive higher weight ' +
      'in the final reconciliation. The value range reflects the inherent uncertainty in the estimate.'
    ),
    React.createElement(GoldDivider),
    React.createElement(Text, { style: styles.subsectionTitle }, 'Disclaimer'),
    React.createElement(Text, { style: styles.small },
      'This is a Comparable Market Analysis (CMA) generated using public records data and automated analysis. ' +
      'It is NOT a formal appraisal and should not be used as a substitute for a licensed appraisal when one ' +
      'is required by a lender or for legal purposes. The estimated values are based on available comparable ' +
      'sales data and standard adjustment methodology. Actual market value may vary based on property condition, ' +
      'interior features not captured in public records, recent improvements, and current market conditions. ' +
      'This report is valid for 30 days from the date of generation.'
    ),
    React.createElement(Text, { style: [styles.small, { marginTop: 8 }] },
      `Report ID: ${report.id}\nGenerated: ${formatDate(report.createdAt)}\nExpires: ${formatDate(report.expiresAt)}`
    ),
    React.createElement(PageFooter, { companyName: branding?.companyName })
  );
}

function NeighborhoodPage({
  report,
  branding,
}: {
  report: GeneratedReport;
  branding?: BrandingProfile;
}) {
  const subject = report.subjectProperty;
  const neighborhood = report.neighborhoodData;
  const schools = report.schoolData;
  const crime = report.crimeData;

  if (!neighborhood && !schools && !crime) return null;

  return React.createElement(Page, { size: 'LETTER', style: styles.page },
    React.createElement(PageHeader, { address: subject.address, reportId: report.id }),
    React.createElement(Text, { style: styles.sectionTitle }, 'Neighborhood Profile'),

    neighborhood ? React.createElement(View, null,
      React.createElement(View, { style: styles.statGrid },
        React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statValue }, formatCurrency(neighborhood.medianIncome)),
          React.createElement(Text, { style: styles.statLabel }, 'Median Income')
        ),
        React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statValue }, formatNumber(neighborhood.population)),
          React.createElement(Text, { style: styles.statLabel }, 'Population')
        ),
        React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statValue }, formatCurrency(neighborhood.medianHomeValue)),
          React.createElement(Text, { style: styles.statLabel }, 'Median Home Value')
        ),
        React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statValue }, `${neighborhood.homeOwnershipRate}%`),
          React.createElement(Text, { style: styles.statLabel }, 'Homeownership')
        )
      ),
      neighborhood.walkScore !== null ? React.createElement(View, { style: [styles.statGrid, { marginTop: 4 }] },
        React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statValue }, String(neighborhood.walkScore)),
          React.createElement(Text, { style: styles.statLabel }, 'Walk Score')
        ),
        neighborhood.transitScore !== null ? React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statValue }, String(neighborhood.transitScore)),
          React.createElement(Text, { style: styles.statLabel }, 'Transit Score')
        ) : null,
        neighborhood.bikeScore !== null ? React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statValue }, String(neighborhood.bikeScore)),
          React.createElement(Text, { style: styles.statLabel }, 'Bike Score')
        ) : null
      ) : null
    ) : null,

    schools && schools.length > 0 ? React.createElement(View, null,
      React.createElement(GoldDivider),
      React.createElement(Text, { style: styles.subsectionTitle }, 'Nearby Schools'),
      React.createElement(View, { style: styles.table },
        React.createElement(View, { style: styles.tableHeaderRow },
          React.createElement(Text, { style: [styles.tableHeaderCell, { width: '35%', paddingLeft: 4 }] }, 'School'),
          React.createElement(Text, { style: [styles.tableHeaderCell, { width: '15%' }] }, 'Type'),
          React.createElement(Text, { style: [styles.tableHeaderCell, { width: '15%' }] }, 'Grades'),
          React.createElement(Text, { style: [styles.tableHeaderCell, { width: '15%', textAlign: 'center' }] }, 'Rating'),
          React.createElement(Text, { style: [styles.tableHeaderCell, { width: '20%', textAlign: 'right', paddingRight: 4 }] }, 'Distance')
        ),
        ...schools.map((school, idx) =>
          React.createElement(View, { key: idx, style: [styles.tableRow, idx % 2 === 0 ? { backgroundColor: COLORS.gray100 } : {}] },
            React.createElement(Text, { style: [styles.tableCell, { width: '35%' }] }, school.name),
            React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, school.type),
            React.createElement(Text, { style: [styles.tableCell, { width: '15%' }] }, school.grades),
            React.createElement(Text, { style: [styles.tableCell, { width: '15%', textAlign: 'center' }] },
              school.rating !== null ? `${school.rating}/10` : 'N/A'
            ),
            React.createElement(Text, { style: [styles.tableCellRight, { width: '20%' }] }, `${school.distance} mi`)
          )
        )
      )
    ) : null,

    crime ? React.createElement(View, null,
      React.createElement(GoldDivider),
      React.createElement(Text, { style: styles.subsectionTitle }, 'Safety & Crime'),
      React.createElement(View, { style: styles.statGrid },
        React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statValue }, String(crime.crimeIndex)),
          React.createElement(Text, { style: styles.statLabel }, 'Crime Index')
        ),
        React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statValue }, String(crime.violentCrimeRate)),
          React.createElement(Text, { style: styles.statLabel }, 'Violent (per 100k)')
        ),
        React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: styles.statValue }, String(crime.propertyCrimeRate)),
          React.createElement(Text, { style: styles.statLabel }, 'Property (per 100k)')
        ),
        React.createElement(View, { style: styles.statBox },
          React.createElement(Text, { style: [
            styles.statValue,
            { color: crime.comparedToNational === 'lower' ? COLORS.green : crime.comparedToNational === 'higher' ? COLORS.red : COLORS.gray800 }
          ] },
            crime.comparedToNational === 'lower' ? 'Below Avg' : crime.comparedToNational === 'higher' ? 'Above Avg' : 'Average'
          ),
          React.createElement(Text, { style: styles.statLabel }, 'vs National')
        )
      ),
      React.createElement(Text, { style: styles.small }, `Source: Estimated from public data, ${crime.year}. National average crime index: 270.`)
    ) : null,

    React.createElement(PageFooter, { companyName: branding?.companyName })
  );
}

// ─── Document Assembly ─────────────────────────────────────────────────────────

function ReportDocument({
  report,
  branding,
}: {
  report: GeneratedReport;
  branding?: BrandingProfile;
}) {
  // Split comps into pages of 3
  const compPages: CompSale[][] = [];
  for (let i = 0; i < report.comps.length; i += 3) {
    compPages.push(report.comps.slice(i, i + 3));
  }

  const pages: React.ReactElement[] = [
    React.createElement(CoverPage, { key: 'cover', report, branding }),
    React.createElement(ExecutiveSummaryPage, { key: 'summary', report, branding }),
  ];

  compPages.forEach((comps, idx) => {
    const label = compPages.length > 1 ? `(${idx + 1} of ${compPages.length})` : '';
    pages.push(
      React.createElement(CompAnalysisPage, {
        key: `comps-${idx}`,
        report,
        comps,
        pageLabel: label,
        branding,
      })
    );
  });

  // Neighborhood page (only if data exists)
  if (report.neighborhoodData || report.schoolData || report.crimeData) {
    pages.push(
      React.createElement(NeighborhoodPage, { key: 'neighborhood', report, branding })
    );
  }

  // Value conclusion (always last content page)
  pages.push(
    React.createElement(ValueConclusionPage, { key: 'conclusion', report, branding })
  );

  return React.createElement(Document, {
    title: `CMA - ${report.subjectProperty.address}`,
    author: branding?.agentName ?? 'AI Real Estate Comps',
    subject: 'Comparable Market Analysis',
  }, ...pages);
}

// ─── Public API ────────────────────────────────────────────────────────────────

/**
 * Generate a PDF report from a completed GeneratedReport.
 *
 * Uses @react-pdf/renderer to produce a professional multi-page PDF with:
 * - Cover page (navy/gold design)
 * - Executive summary with value callout
 * - Detailed comp analysis with adjustment breakdowns
 * - Neighborhood profile (demographics, schools, crime)
 * - Value conclusion with methodology and disclaimers
 *
 * If a BrandingProfile is provided (Branded tier), the PDF includes
 * the agent's logo, headshot, company info, and custom colors.
 *
 * @param report - The complete generated report
 * @param branding - Optional agent branding profile for Branded tier
 * @returns PDF file as a Buffer
 */
export async function generateReportPDF(
  report: GeneratedReport,
  branding?: BrandingProfile
): Promise<Buffer> {
  const doc = React.createElement(ReportDocument, { report, branding }) as React.ReactElement;
  const buffer = await renderToBuffer(doc as any);
  return Buffer.from(buffer);
}
