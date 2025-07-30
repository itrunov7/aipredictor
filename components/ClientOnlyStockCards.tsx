'use client';

import React, { useState, useEffect } from 'react';
import { EnhancedStockCard } from './EnhancedStockCard';

const FEATURED_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

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

async function fetchStockInsight(symbol: string): Promise<StockData | null> {
  try {
    const response = await fetch(`/api/insights/simple/${symbol}`);
    const result = await response.json();
    
    if (result.success && result.data) {
      return result.data;
    } else {
      console.warn(`Failed to fetch data for ${symbol}:`, result.error);
      return null;
    }
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error);
    return null;
  }
}

export function ClientOnlyStockCards() {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStockData() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching real stock data from FMP API...');
        
        // Fetch data for all symbols in parallel
        const promises = FEATURED_SYMBOLS.map(symbol => fetchStockInsight(symbol));
        const results = await Promise.all(promises);
        
        // Filter out null results and keep successful fetches
        const validStocks = results.filter((stock): stock is StockData => stock !== null);
        
        if (validStocks.length === 0) {
          throw new Error('No stock data could be retrieved');
        }
        
        console.log(`✅ Successfully fetched ${validStocks.length} stocks from FMP API`);
        setStocks(validStocks);
        
      } catch (err) {
        console.error('❌ Error loading stock data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load stock data');
      } finally {
        setLoading(false);
      }
    }

    loadStockData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
        {FEATURED_SYMBOLS.map((symbol, index) => (
          <div
            key={symbol}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 h-96">
              <div className="animate-pulse space-y-6">
                <div className="flex items-center justify-between">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-lg w-24"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                </div>
                <div>
                  <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mb-2"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                  <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {stocks.map((stock, index) => (
        <div
          key={stock.symbol}
          className="animate-fade-in-up"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <EnhancedStockCard data={stock} />
        </div>
      ))}
    </div>
  );
} 