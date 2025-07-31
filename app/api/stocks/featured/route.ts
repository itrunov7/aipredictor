import { NextResponse } from 'next/server';

// Import same rotation logic as scheduler for consistency
const COMPANY_POOL = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'CRM', 'ORCL', 'ADBE',
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'V', 'MA', 'UNH', 'JNJ', 'PFE',
  'WMT', 'HD', 'PG', 'KO', 'PEP', 'MCD', 'NKE', 'COST', 'XOM', 'CVX'
];

const DEFAULT_COMPANIES = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

/**
 * Get current featured companies - same logic as scheduler
 */
function getCurrentFeaturedCompanies(): string[] {
  const now = new Date();
  
  // Get current date in EST/EDT (where market operates)
  const easternTime = new Date(now.toLocaleString("en-US", {timeZone: "America/New_York"}));
  
  // Calculate day of year for rotation seed
  const startOfYear = new Date(easternTime.getFullYear(), 0, 1);
  const dayOfYear = Math.floor((easternTime.getTime() - startOfYear.getTime()) / 86400000) + 1;
  
  // Use day of year as rotation seed for deterministic selection
  const selectedCompanies: string[] = [];
  const usedIndices = new Set<number>();
  
  // Select 5 unique companies using deterministic algorithm
  for (let i = 0; i < 5; i++) {
    let attempts = 0;
    let index: number;
    
    do {
      // Create deterministic but varied selection (same algorithm as scheduler)
      const seedBase = dayOfYear + i * 37 + attempts * 13;
      index = seedBase % COMPANY_POOL.length;
      attempts++;
    } while (usedIndices.has(index) && attempts < COMPANY_POOL.length);
    
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      selectedCompanies.push(COMPANY_POOL[index]);
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
  
  return selectedCompanies.slice(0, 5);
}

// Mock function for FMP API (for demo purposes)
function fetchFromFMP(endpoint: string): Promise<any[]> {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const symbol = endpoint.split('/').pop();
      resolve([{
        symbol,
        name: `${symbol} Corporation`,
        price: 150 + Math.random() * 200,
        changesPercentage: (Math.random() - 0.5) * 10
      }]);
    }, 100);
  });
}

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

function getCachedData(key: string): any {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < 24 * 60 * 60 * 1000) { // 24 hour cache
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export async function GET() {
  try {
    const cacheKey = 'featured_stocks_daily';
    
    // Check cache first
    let cachedData = getCachedData(cacheKey);
    if (cachedData) {
      return NextResponse.json({
        success: true,
        data: cachedData,
        count: cachedData.length,
        cached: true,
        lastUpdated: new Date().toISOString()
      });
    }

    // Get today's featured symbols from rotation algorithm
    const symbols = getCurrentFeaturedCompanies();
    console.log(`📊 Fetching data for today's featured companies: ${symbols.join(', ')}`);
    
    // Fetch data for all symbols in parallel
    const stockPromises = symbols.map(symbol => 
      fetchFromFMP(`/quote/${symbol}`)
    );

    const stockResults = await Promise.all(stockPromises);
    
    // Flatten and filter results
    const stocks = stockResults
      .flat()
      .filter(stock => stock && stock.symbol)
      .slice(0, 5);

    if (stocks.length === 0) {
      return NextResponse.json({
        success: false,
        error: 'No stock data available'
      }, { status: 404 });
    }

    // Cache the results
    setCachedData(cacheKey, stocks);

    return NextResponse.json({
      success: true,
      data: stocks,
      count: stocks.length,
      cached: false,
      lastUpdated: new Date().toISOString(),
      featuredSymbols: symbols
    });

  } catch (error: any) {
    console.error('Error fetching featured stocks:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch stock data',
      details: error.message
    }, { status: 500 });
  }
} 