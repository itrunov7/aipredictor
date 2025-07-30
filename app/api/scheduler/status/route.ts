import { NextRequest, NextResponse } from 'next/server';

// Default featured companies (fallback when backend is not available)
const DEFAULT_COMPANIES = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

// Simple cache for featured companies (in production, use Redis or similar)
let cachedFeaturedCompanies: string[] | null = null;
let lastRotation: Date | null = null;

/**
 * Get current featured companies with simple rotation logic
 */
function getCurrentFeaturedCompanies(): string[] {
  const now = new Date();
  const today = now.toDateString();
  
  // Check if we need to rotate (daily rotation)
  if (!lastRotation || lastRotation.toDateString() !== today) {
    // Simple rotation based on day of year
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000);
    
    // Extended pool for more variety
    const companyPool = [
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'CRM', 'ORCL', 'ADBE',
      'JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA', 'UNH', 'JNJ', 'PFE',
      'WMT', 'HD', 'PG', 'KO', 'PEP', 'MCD', 'NKE', 'COST', 'XOM', 'CVX'
    ];
    
    // Deterministic selection based on day
    const selectedCompanies: string[] = [];
    const seed = dayOfYear;
    
    // Simple pseudo-random selection to ensure same companies for same day
    for (let i = 0; i < 5; i++) {
      const index = (seed + i * 7) % companyPool.length;
      const company = companyPool[index];
      
      if (!selectedCompanies.includes(company)) {
        selectedCompanies.push(company);
      } else {
        // If duplicate, try next available
        for (let j = 0; j < companyPool.length; j++) {
          const alternateIndex = (index + j) % companyPool.length;
          const alternateCompany = companyPool[alternateIndex];
          if (!selectedCompanies.includes(alternateCompany)) {
            selectedCompanies.push(alternateCompany);
            break;
          }
        }
      }
    }
    
    // Ensure we have exactly 5 companies
    while (selectedCompanies.length < 5) {
      for (const company of DEFAULT_COMPANIES) {
        if (!selectedCompanies.includes(company) && selectedCompanies.length < 5) {
          selectedCompanies.push(company);
        }
      }
    }
    
    cachedFeaturedCompanies = selectedCompanies.slice(0, 5);
    lastRotation = now;
    
    console.log(`📅 Daily rotation: Selected companies for ${today}:`, cachedFeaturedCompanies);
  }
  
  return cachedFeaturedCompanies || DEFAULT_COMPANIES;
}

export async function GET(req: NextRequest) {
  try {
    const featuredCompanies = getCurrentFeaturedCompanies();
    
    return NextResponse.json({
      success: true,
      data: {
        isRunning: false, // Simplified for frontend
        lastRun: lastRotation?.toISOString() || new Date().toISOString(),
        currentFeaturedCompanies: featuredCompanies,
        nextScheduledRun: 'Daily at 6:00 AM EST',
        companyPoolSize: 30,
        rotationDate: lastRotation?.toDateString() || new Date().toDateString()
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error getting scheduler status:', error);
    
    // Fallback response
    return NextResponse.json({
      success: true,
      data: {
        isRunning: false,
        lastRun: new Date().toISOString(),
        currentFeaturedCompanies: DEFAULT_COMPANIES,
        nextScheduledRun: 'Daily at 6:00 AM EST',
        companyPoolSize: 5,
        error: 'Fallback mode'
      },
      timestamp: new Date().toISOString()
    });
  }
} 