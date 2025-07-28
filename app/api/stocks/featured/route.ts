import { NextResponse } from 'next/server';

// Simple in-memory cache for Vercel deployment
const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

interface CacheEntry {
  data: any;
  timestamp: number;
}

const FMP_API_KEY = process.env.FMP_API_KEY;
const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

async function fetchFromFMP(endpoint: string) {
  const url = `${FMP_BASE_URL}${endpoint}?apikey=${FMP_API_KEY}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status}`);
  }
  
  return response.json();
}

function getCachedData(key: string): any | null {
  const entry = cache.get(key) as CacheEntry;
  if (entry && (Date.now() - entry.timestamp) < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCachedData(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now()
  });
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

    // Featured stock symbols (most interesting companies)
    const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    
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
      lastUpdated: new Date().toISOString()
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