'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedStockCard } from './EnhancedStockCard';

// Featured symbols will be fetched from the daily scheduler

interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  predictions: {
    nextDay: { price: number; changePercent: number; confidence: number };
    nextWeek: { price: number; changePercent: number; confidence: number };
    nextMonth: { price: number; changePercent: number; confidence: number };
  };
  analysis: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    riskLevel: 'low' | 'medium' | 'high';
    keyFactors: string[];
    confidence: number;
    reasoning: string;
    sources: Array<{
      type: 'news' | 'analyst' | 'technical' | 'earnings' | 'economic' | 'sentiment';
      title: string;
      impact: 'positive' | 'negative' | 'neutral';
      confidence: number;
      url: string;
      source: string;
      date: string;
    }>;
  };
  source: string;
  lastUpdated: string;
}

async function fetchFeaturedCompanies(): Promise<string[]> {
  try {
    console.log('📅 Fetching today\'s featured companies from scheduler...');
    // Try to fetch from backend scheduler first
    try {
      const response = await fetch('/api/scheduler/status');
      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data?.currentFeaturedCompanies) {
          console.log('✅ Got featured companies from scheduler:', result.data.currentFeaturedCompanies);
          return result.data.currentFeaturedCompanies;
        }
      }
    } catch (error) {
      console.log('⚠️ Scheduler not available, using defaults');
    }
    
    // Fallback to default companies if scheduler is not available
    const defaultCompanies = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    console.log('📊 Using default companies:', defaultCompanies);
    return defaultCompanies;
  } catch (error) {
    console.error('❌ Error fetching featured companies:', error);
    return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']; // Ultimate fallback
  }
}

async function fetchStockInsight(symbol: string): Promise<StockData | null> {
  try {
    console.log(`🔌 Fetching data for ${symbol}...`);
    const response = await fetch(`/api/insights/simple/${symbol}`);
    console.log(`📡 Response for ${symbol}:`, response.status, response.ok);
    
    const result = await response.json();
    console.log(`📋 Result for ${symbol}:`, { success: result.success, hasData: !!result.data, symbol: result.data?.symbol });
    
    if (result.success && result.data) {
      console.log(`✅ Successfully parsed ${symbol} data`);
      return result.data;
    } else {
      console.warn(`❌ Failed to fetch data for ${symbol}:`, result.error);
      return null;
    }
  } catch (error) {
    console.error(`💥 Error fetching ${symbol}:`, error);
    return null;
  }
}

export function ClientOnlyStockCards() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  console.log('🔍 ClientOnlyStockCards render - loading:', loading, 'stocks:', stocks.length);

  useEffect(() => {
    console.log('🚀 useEffect triggered - starting data load');
    
    async function loadStockData() {
      console.log('📍 loadStockData function started');
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('⏰ Loading timeout - falling back to error state');
        setError('Loading timeout - please refresh the page');
        setLoading(false);
      }, 10000); // 10 second timeout
      
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching real stock data from FMP API...');
        
        // First get today's featured companies
        const featuredSymbols = await fetchFeaturedCompanies();
        console.log('📊 Featured symbols for today:', featuredSymbols);
        
        // Test a single fetch first
        console.log('🧪 Testing single fetch for first symbol...');
        const testResponse = await fetch(`/api/insights/simple/${featuredSymbols[0]}`);
        const testResult = await testResponse.json();
        console.log('🧪 Test result:', testResult.success, testResult.data?.symbol);
        
        // Fetch data for all symbols in parallel
        const promises = featuredSymbols.map((symbol: string) => {
          console.log(`🔗 Creating promise for ${symbol}`);
          return fetchStockInsight(symbol);
        });
        
        console.log('⏳ Awaiting all promises...');
        const results = await Promise.all(promises);
        console.log('📋 Raw results:', results.map(r => r?.symbol || 'null'));
        
        // Filter out null results and keep successful fetches
        const validStocks = results.filter((stock): stock is StockData => stock !== null);
        console.log('✅ Valid stocks:', validStocks.map(s => s.symbol));
        
        if (validStocks.length === 0) {
          throw new Error('No stock data could be retrieved');
        }
        
        console.log(`✅ Successfully fetched ${validStocks.length} stocks from FMP API`);
        console.log(`📊 Setting stocks state with:`, validStocks.map(s => s.symbol));
        setStocks(validStocks);
        console.log(`🎯 Stocks state should now be updated`);
        clearTimeout(timeoutId);
        
      } catch (err) {
        console.error('❌ Error loading stock data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stock data');
        clearTimeout(timeoutId);
      } finally {
        console.log('🏁 Setting loading to false');
        setLoading(false);
        console.log('✔️ Loading state updated to false');
      }
    }

    loadStockData();
  }, []);

  // Real-time timer updates every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {[1, 2, 3, 4, 5].map((index) => (
          <div
            key={index}
            className={`animate-fade-in-up ${
              index === 5 ? 'lg:col-span-2 lg:max-w-lg lg:mx-auto' : ''
            }`}
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 h-96">
              <div className="animate-pulse space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    console.log('❌ Rendering error state:', error);
    return (
      <div className="text-center py-16">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-3xl p-8 max-w-md mx-auto">
          <div className="text-red-600 dark:text-red-400">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-xl font-semibold mb-2">Unable to Load Market Data</h3>
            <p className="text-sm text-red-500 dark:text-red-400 mb-6">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  console.log('🎉 Rendering actual stock cards! Stocks:', stocks.length);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {stocks.map((stock, index) => (
        <div
          key={stock.symbol}
          className={`animate-fade-in-up ${
            stocks.length === 5 && index === 4 ? 'lg:col-span-2 lg:max-w-lg lg:mx-auto' : ''
          }`}
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <EnhancedStockCard data={stock} />
        </div>
      ))}
    </div>
  );
} 