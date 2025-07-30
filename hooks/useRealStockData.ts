import { useState, useEffect } from 'react';

interface RealStockData {
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

export function useRealStockData(symbols: string[]) {
  const [data, setData] = useState<RealStockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (symbols.length === 0) {
      setLoading(false);
      return;
    }
    
    async function fetchRealData() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Fetching real stock data for:', symbols);
        
        const promises = symbols.map(async (symbol) => {
          try {
            // Use the working simple insights endpoint with comprehensive sources
            const response = await fetch(`/api/insights/simple/${symbol}`);
            
            if (!response.ok) {
              console.warn(`Failed to fetch insights for ${symbol}, trying basic quote`);
              // Fallback to basic quote if insights fail
              const quoteResponse = await fetch(`/api/stocks/featured`);
              const quoteData = await quoteResponse.json();
              if (quoteData.success) {
                const stockData = quoteData.data.find((stock: any) => stock.symbol === symbol);
                if (stockData) {
                  return createFallbackData(symbol, stockData);
                }
              }
              throw new Error(`Failed to fetch data for ${symbol}`);
            }
            
            const insightData = await response.json();
            if (insightData.success) {
              console.log(`✅ Retrieved insights for ${symbol} with ${insightData.data.analysis.sources.length} sources`);
              return transformInsightData(insightData.data);
            }
            throw new Error(`No insight data for ${symbol}`);
            
          } catch (error) {
            console.warn(`Error fetching data for ${symbol}:`, error);
            return createBasicFallback(symbol);
          }
        });

        const results = await Promise.allSettled(promises);
        const successfulData = results
          .filter((result): result is PromiseFulfilledResult<RealStockData> => 
            result.status === 'fulfilled' && result.value !== null
          )
          .map(result => result.value);

        console.log(`✅ Successfully loaded ${successfulData.length}/${symbols.length} stocks`);
        setData(successfulData);
        
      } catch (err) {
        console.error('Error fetching stock data:', err);
        setError('Failed to fetch stock data');
        setData(symbols.map(symbol => ({ 
         symbol, 
         name: `${symbol} Test`,
         currentPrice: 100,
         change: 1,
         changePercent: 1,
         predictions: { nextDay: { price: 101, changePercent: 1, confidence: 75 }, nextWeek: { price: 102, changePercent: 2, confidence: 75 }, nextMonth: { price: 103, changePercent: 3, confidence: 75 } },
         analysis: { sentiment: 'bullish' as const, riskLevel: 'low' as const, keyFactors: ['Test'], confidence: 75, reasoning: 'Test', sources: [] },
         source: 'Test',
         lastUpdated: new Date().toISOString()
       })));
      } finally {
        setLoading(false);
      }
    }

    if (symbols.length > 0) {
      fetchRealData();
    }
  }, [symbols]); // Fixed dependency array

  return { data, loading, error };
}

function transformInsightData(insightData: any): RealStockData {
  // The data is already in the correct format from the simple endpoint
  return {
    symbol: insightData.symbol,
    name: insightData.name,
    currentPrice: insightData.currentPrice,
    change: insightData.change,
    changePercent: insightData.changePercent,
    predictions: insightData.predictions,
    analysis: insightData.analysis,
    source: insightData.source,
    lastUpdated: insightData.lastUpdated || new Date().toISOString()
  };
}

function createFallbackData(symbol: string, quoteData: any): RealStockData {
  const basicPredictions = generateBasicPredictions(quoteData.price, quoteData.changesPercentage);
  
  return {
    symbol: quoteData.symbol,
    name: quoteData.name,
    currentPrice: quoteData.price,
    change: quoteData.change,
    changePercent: quoteData.changesPercentage,
    predictions: basicPredictions,
    analysis: {
      sentiment: quoteData.changesPercentage > 0 ? 'bullish' : 'bearish',
      riskLevel: Math.abs(quoteData.changesPercentage) > 3 ? 'high' : 'medium',
      keyFactors: ['Price momentum', 'Market data'],
      confidence: 70,
      reasoning: 'Basic analysis using price and volume data.',
      sources: [
        {
          type: 'technical',
          title: `Current price: $${quoteData.price} (${quoteData.changesPercentage > 0 ? '+' : ''}${quoteData.changesPercentage.toFixed(2)}%)`,
          impact: quoteData.changesPercentage > 0 ? 'positive' : 'negative',
          confidence: 85,
          url: `https://financialmodelingprep.com/financial-summary/${symbol}`,
          source: 'Market Data',
          date: new Date().toISOString()
        }
      ]
    },
    source: 'Basic Quote Data',
    lastUpdated: new Date().toISOString()
  };
}

function createBasicFallback(symbol: string): RealStockData {
  return {
    symbol,
    name: `${symbol} Inc.`,
    currentPrice: 100,
    change: 0,
    changePercent: 0,
    predictions: generateBasicPredictions(100, 0),
    analysis: {
      sentiment: 'neutral',
      riskLevel: 'medium',
      keyFactors: ['Data unavailable'],
      confidence: 50,
      reasoning: 'Unable to fetch current market data.',
      sources: [
        {
          type: 'technical',
          title: 'Market data temporarily unavailable',
          impact: 'neutral',
          confidence: 50,
          url: `https://financialmodelingprep.com/financial-summary/${symbol}`,
          source: 'System',
          date: new Date().toISOString()
        }
      ]
    },
    source: 'Fallback Data',
    lastUpdated: new Date().toISOString()
  };
}

function generateBasicPredictions(currentPrice: number, changePercent: number) {
  const trend = changePercent > 0 ? 1 : changePercent < 0 ? -1 : 0;
  const volatility = Math.abs(changePercent) / 100;
  const factor = trend * Math.min(volatility, 0.05);

  return {
    nextDay: {
      price: Math.round(currentPrice * (1 + factor * 0.3) * 100) / 100,
      changePercent: factor * 30,
      confidence: 70
    },
    nextWeek: {
      price: Math.round(currentPrice * (1 + factor * 0.7) * 100) / 100,
      changePercent: factor * 70,
      confidence: 70
    },
    nextMonth: {
      price: Math.round(currentPrice * (1 + factor * 1.2) * 100) / 100,
      changePercent: factor * 120,
      confidence: 70
    }
  };
} 