import { NextRequest, NextResponse } from 'next/server';

// Extended company pool for daily rotation
const COMPANY_POOL = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'CRM', 'ORCL', 'ADBE',
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA', 'UNH', 'JNJ', 'PFE',
  'WMT', 'HD', 'PG', 'KO', 'PEP', 'MCD', 'NKE', 'COST', 'XOM', 'CVX'
];

// Default fallback companies
const DEFAULT_COMPANIES = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

/**
 * Get current featured companies with deterministic daily rotation
 * This function is pure and deterministic - same date always returns same companies
 */
function getCurrentFeaturedCompanies(): { companies: string[], rotationDate: string, rotationId: number } {
  const now = new Date();
  
  // Get current date in EST/EDT (where market operates)
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  const today = easternTime.toDateString(); // e.g., "Thu Jul 31 2025"
  
  // Calculate day of year for rotation seed
  const startOfYear = new Date(easternTime.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((easternTime.getTime() - startOfYear.getTime()) / 86400000) + 1;
  
  console.log(`🗓️ Daily rotation calculation: Date=${today}, DayOfYear=${dayOfYear}, Pool=${COMPANY_POOL.length} companies`);
  
  // Use day of year as rotation seed for deterministic selection
  const selectedCompanies: string[] = [];
  const usedIndices = new Set<number>();
  
  // Select 5 unique companies using deterministic algorithm
  for (let i = 0; i < 5; i++) {
    let attempts = 0;
    let index: number;
    
    do {
      // Create deterministic but varied selection
      const seedBase = dayOfYear + i * 37 + attempts * 13; // Prime numbers for better distribution
      index = seedBase % COMPANY_POOL.length;
      attempts++;
    } while (usedIndices.has(index) && attempts < COMPANY_POOL.length);
    
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      selectedCompanies.push(COMPANY_POOL[index]);
    }
  }
  
  // Ensure we have exactly 5 companies (fallback if algorithm fails)
  while (selectedCompanies.length < 5) {
    for (const company of DEFAULT_COMPANIES) {
      if (!selectedCompanies.includes(company) && selectedCompanies.length < 5) {
        selectedCompanies.push(company);
      }
    }
  }
  
  const finalSelection = selectedCompanies.slice(0, 5);
  console.log(`📅 Selected companies for ${today}: ${finalSelection.join(', ')}`);
  
  return {
    companies: finalSelection,
    rotationDate: today,
    rotationId: dayOfYear
  };
}

/**
 * Calculate next rotation time (6 AM Eastern next day)
 */
function getNextRotationTime(): string {
  const now = new Date();
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  
  // Set to tomorrow 6 AM Eastern
  const nextRotation = new Date(easternTime);
  nextRotation.setDate(nextRotation.getDate() + 1);
  nextRotation.setHours(6, 0, 0, 0);
  
  // Convert back to UTC for consistent API response
  return nextRotation.toISOString();
}

export async function GET(req: NextRequest) {
  try {
    const rotationResult = getCurrentFeaturedCompanies();
    const nextRotation = getNextRotationTime();
    const now = new Date();
    
    return NextResponse.json({
      success: true,
      data: {
        isRunning: true,
        lastRun: now.toISOString(),
        currentFeaturedCompanies: rotationResult.companies,
        nextScheduledRun: nextRotation,
        companyPoolSize: COMPANY_POOL.length,
        rotationDate: rotationResult.rotationDate,
        rotationId: rotationResult.rotationId,
        algorithm: 'deterministic-daily'
      },
      timestamp: now.toISOString()
    });
    
  } catch (error) {
    console.error('Error in scheduler status:', error);
    
    // Robust fallback
    return NextResponse.json({
      success: true,
      data: {
        isRunning: false,
        lastRun: new Date().toISOString(),
        currentFeaturedCompanies: DEFAULT_COMPANIES,
        nextScheduledRun: getNextRotationTime(),
        companyPoolSize: DEFAULT_COMPANIES.length,
        rotationDate: new Date().toDateString(),
        rotationId: 0,
        algorithm: 'fallback',
        error: 'Using fallback companies'
      },
      timestamp: new Date().toISOString()
    });
  }
} 