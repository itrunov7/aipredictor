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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
        {FEATURED_SYMBOLS.map((symbol, index) => (
          <div
            key={symbol}
            className="animate-fade-in-up"
            style={{ animationDelay: `${index * 150}ms` }}
          >
            <div className="glass-card p-6 h-96">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
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
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">
          <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-semibold">Failed to Load Stock Data</h3>
          <p className="text-sm text-gray-600 mt-2">{error}</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-16">
      {stocks.map((stock, index) => (
        <div
          key={stock.symbol}
          className="animate-fade-in-up min-w-0"
          style={{ animationDelay: `${index * 150}ms` }}
        >
          <EnhancedStockCard data={stock} />
        </div>
      ))}
    </div>
  );
} 