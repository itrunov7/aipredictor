/**
 * OpenAI-Powered Stock Prediction Service
 * Uses GPT models for sophisticated market analysis and predictions
 */

import { OpenAI } from 'openai';

// Types for our prediction system
export interface StockDataInput {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  marketCap: number;
  volume: number;
  avgVolume: number;
  pe: number;
  eps: number;
  dayHigh: number;
  dayLow: number;
  yearHigh: number;
  yearLow: number;
  priceAvg50: number;
  priceAvg200: number;
}

export interface PredictionResult {
  symbol: string;
  currentPrice: number;
  predictions: {
    nextDay: {
      price: number;
      change: number;
      changePercent: number;
      confidence: number;
    };
    nextWeek: {
      price: number;
      change: number;
      changePercent: number;
      confidence: number;
    };
    nextMonth: {
      price: number;
      change: number;
      changePercent: number;
      confidence: number;
    };
  };
  analysis: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    riskLevel: 'low' | 'medium' | 'high';
    keyFactors: string[];
    strengths: string[];
    concerns: string[];
  };
  reasoning: string;
  confidence: number;
  lastUpdated: Date;
}

export class OpenAIPredictionService {
  private openai: OpenAI;
  private model: string = 'gpt-4';

  constructor(apiKey?: string) {
    if (!apiKey && typeof process !== 'undefined') {
      apiKey = process.env.OPENAI_API_KEY;
    }
    
    if (!apiKey) {
      throw new Error('OpenAI API key is required');
    }

    this.openai = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true // For client-side usage in development
    });
  }

  /**
   * Generate AI-powered stock prediction
   */
  async generatePrediction(stockData: StockDataInput): Promise<PredictionResult> {
    try {
      const prompt = this.buildAnalysisPrompt(stockData);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a senior financial analyst with 20+ years of experience in equity research and quantitative analysis. You specialize in S&P 500 stock analysis and short-term price predictions. Provide detailed, data-driven analysis with specific price targets and reasoning.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3, // Lower temperature for more consistent predictions
        max_tokens: 1500
      });

      const analysis = completion.choices[0]?.message?.content;
      if (!analysis) {
        throw new Error('No analysis generated');
      }

      return this.parseAnalysis(stockData, analysis);

    } catch (error) {
      console.error('OpenAI Prediction Error:', error);
      
      // Fallback to basic prediction if OpenAI fails
      return this.generateFallbackPrediction(stockData);
    }
  }

  /**
   * Build comprehensive analysis prompt
   */
  private buildAnalysisPrompt(stock: StockDataInput): string {
    const technicalSummary = this.generateTechnicalSummary(stock);
    
    return `
Analyze the following S&P 500 stock and provide price predictions for the next day, week, and month:

COMPANY: ${stock.name} (${stock.symbol})

CURRENT METRICS:
- Current Price: $${stock.price}
- Daily Change: ${stock.change >= 0 ? '+' : ''}${stock.change} (${stock.changesPercentage}%)
- Market Cap: $${(stock.marketCap / 1e9).toFixed(1)}B
- P/E Ratio: ${stock.pe}
- EPS: $${stock.eps}
- Volume: ${(stock.volume / 1e6).toFixed(1)}M (Avg: ${(stock.avgVolume / 1e6).toFixed(1)}M)

TECHNICAL LEVELS:
- Day Range: $${stock.dayLow} - $${stock.dayHigh}
- 52-Week Range: $${stock.yearLow} - $${stock.yearHigh}
- 50-Day Average: $${stock.priceAvg50}
- 200-Day Average: $${stock.priceAvg200}

TECHNICAL ANALYSIS:
${technicalSummary}

Please provide your analysis in the following JSON format:

{
  "nextDayPrediction": {
    "price": number,
    "confidence": number (60-95)
  },
  "nextWeekPrediction": {
    "price": number, 
    "confidence": number (60-95)
  },
  "nextMonthPrediction": {
    "price": number,
    "confidence": number (60-95)
  },
  "sentiment": "bullish" | "bearish" | "neutral",
  "riskLevel": "low" | "medium" | "high",
  "keyFactors": ["factor1", "factor2", "factor3"],
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"],
  "reasoning": "Detailed explanation of your analysis and predictions (2-3 sentences)"
}

Focus on:
1. Technical momentum and chart patterns
2. Volume analysis and market sentiment
3. Support/resistance levels
4. Recent price action relative to moving averages
5. Risk assessment based on volatility

Be specific with price targets and provide realistic confidence levels.
    `;
  }

  /**
   * Generate technical analysis summary
   */
  private generateTechnicalSummary(stock: StockDataInput): string {
    const summaryPoints = [];

    // Price vs moving averages
    if (stock.price > stock.priceAvg200) {
      summaryPoints.push(`Trading ${((stock.price / stock.priceAvg200 - 1) * 100).toFixed(1)}% above 200-day MA`);
    } else {
      summaryPoints.push(`Trading ${((1 - stock.price / stock.priceAvg200) * 100).toFixed(1)}% below 200-day MA`);
    }

    if (stock.price > stock.priceAvg50) {
      summaryPoints.push(`Above 50-day MA (bullish short-term trend)`);
    } else {
      summaryPoints.push(`Below 50-day MA (bearish short-term trend)`);
    }

    // Volume analysis
    const volumeRatio = stock.volume / stock.avgVolume;
    if (volumeRatio > 1.5) {
      summaryPoints.push(`High volume (${volumeRatio.toFixed(1)}x average) - strong interest`);
    } else if (volumeRatio < 0.5) {
      summaryPoints.push(`Low volume (${volumeRatio.toFixed(1)}x average) - limited interest`);
    }

    // Position in 52-week range
    const yearPosition = (stock.price - stock.yearLow) / (stock.yearHigh - stock.yearLow);
    if (yearPosition > 0.8) {
      summaryPoints.push(`Near 52-week highs (${(yearPosition * 100).toFixed(0)}% of range)`);
    } else if (yearPosition < 0.2) {
      summaryPoints.push(`Near 52-week lows (${(yearPosition * 100).toFixed(0)}% of range)`);
    }

    return summaryPoints.join('\n- ');
  }

  /**
   * Parse OpenAI analysis response
   */
  private parseAnalysis(stockData: StockDataInput, analysis: string): PredictionResult {
    try {
      // Extract JSON from the response
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in analysis');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        symbol: stockData.symbol,
        currentPrice: stockData.price,
        predictions: {
          nextDay: {
            price: parsed.nextDayPrediction.price,
            change: parsed.nextDayPrediction.price - stockData.price,
            changePercent: ((parsed.nextDayPrediction.price / stockData.price - 1) * 100),
            confidence: parsed.nextDayPrediction.confidence
          },
          nextWeek: {
            price: parsed.nextWeekPrediction.price,
            change: parsed.nextWeekPrediction.price - stockData.price,
            changePercent: ((parsed.nextWeekPrediction.price / stockData.price - 1) * 100),
            confidence: parsed.nextWeekPrediction.confidence
          },
          nextMonth: {
            price: parsed.nextMonthPrediction.price,
            change: parsed.nextMonthPrediction.price - stockData.price,
            changePercent: ((parsed.nextMonthPrediction.price / stockData.price - 1) * 100),
            confidence: parsed.nextMonthPrediction.confidence
          }
        },
        analysis: {
          sentiment: parsed.sentiment,
          riskLevel: parsed.riskLevel,
          keyFactors: parsed.keyFactors || [],
          strengths: parsed.strengths || [],
          concerns: parsed.concerns || []
        },
        reasoning: parsed.reasoning,
        confidence: (parsed.nextDayPrediction.confidence + parsed.nextWeekPrediction.confidence + parsed.nextMonthPrediction.confidence) / 3,
        lastUpdated: new Date()
      };

    } catch (error) {
      console.error('Error parsing OpenAI analysis:', error);
      return this.generateFallbackPrediction(stockData);
    }
  }

  /**
   * Generate fallback prediction if OpenAI fails
   */
  private generateFallbackPrediction(stockData: StockDataInput): PredictionResult {
    const volatility = Math.abs(stockData.changesPercentage) / 100;
    const trend = stockData.changesPercentage > 0 ? 1 : -1;
    
    // Simple momentum-based prediction
    const momentumFactor = trend * Math.min(volatility, 0.05);
    
    const nextDayPrice = stockData.price * (1 + momentumFactor * 0.3);
    const nextWeekPrice = stockData.price * (1 + momentumFactor * 0.7);
    const nextMonthPrice = stockData.price * (1 + momentumFactor * 1.2);

    return {
      symbol: stockData.symbol,
      currentPrice: stockData.price,
      predictions: {
        nextDay: {
          price: Math.round(nextDayPrice * 100) / 100,
          change: nextDayPrice - stockData.price,
          changePercent: ((nextDayPrice / stockData.price - 1) * 100),
          confidence: 75
        },
        nextWeek: {
          price: Math.round(nextWeekPrice * 100) / 100,
          change: nextWeekPrice - stockData.price,
          changePercent: ((nextWeekPrice / stockData.price - 1) * 100),
          confidence: 70
        },
        nextMonth: {
          price: Math.round(nextMonthPrice * 100) / 100,
          change: nextMonthPrice - stockData.price,
          changePercent: ((nextMonthPrice / stockData.price - 1) * 100),
          confidence: 65
        }
      },
      analysis: {
        sentiment: trend > 0 ? 'bullish' : 'bearish',
        riskLevel: volatility > 0.03 ? 'high' : volatility > 0.015 ? 'medium' : 'low',
        keyFactors: ['Recent price momentum', 'Market volatility', 'Technical indicators'],
        strengths: trend > 0 ? ['Positive momentum'] : [],
        concerns: trend < 0 ? ['Negative momentum'] : ['Market uncertainty']
      },
      reasoning: `Based on current momentum and volatility analysis. ${trend > 0 ? 'Positive' : 'Negative'} trend suggests ${trend > 0 ? 'continued upward' : 'potential downward'} movement.`,
      confidence: 70,
      lastUpdated: new Date()
    };
  }

  /**
   * Generate market sentiment analysis
   */
  async generateMarketSentiment(stocks: StockDataInput[]): Promise<{
    overallSentiment: 'bullish' | 'bearish' | 'neutral';
    marketMood: string;
    keyThemes: string[];
    riskFactors: string[];
  }> {
    try {
      const marketSummary = this.buildMarketSummary(stocks);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'You are a senior market strategist analyzing overall S&P 500 market sentiment and trends.'
          },
          {
            role: 'user',
            content: `
Analyze the current market sentiment based on these featured S&P 500 stocks:

${marketSummary}

Provide a JSON response with:
{
  "overallSentiment": "bullish" | "bearish" | "neutral",
  "marketMood": "Brief description of current market mood",
  "keyThemes": ["theme1", "theme2", "theme3"],
  "riskFactors": ["risk1", "risk2"]
}
            `
          }
        ],
        temperature: 0.3,
        max_tokens: 500
      });

      const analysis = completion.choices[0]?.message?.content;
      if (analysis) {
        const jsonMatch = analysis.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
      }

    } catch (error) {
      console.error('Market sentiment analysis error:', error);
    }

    // Fallback sentiment analysis
    const avgChange = stocks.reduce((sum, stock) => sum + stock.changesPercentage, 0) / stocks.length;
    
    return {
      overallSentiment: avgChange > 1 ? 'bullish' : avgChange < -1 ? 'bearish' : 'neutral',
      marketMood: avgChange > 0 ? 'Cautiously optimistic with mixed signals' : 'Defensive positioning amid uncertainty',
      keyThemes: ['Technology leadership', 'Market rotation', 'Earnings focus'],
      riskFactors: ['Economic uncertainty', 'Interest rate sensitivity']
    };
  }

  private buildMarketSummary(stocks: StockDataInput[]): string {
    return stocks.map(stock => 
      `${stock.name} (${stock.symbol}): $${stock.price} (${stock.changesPercentage >= 0 ? '+' : ''}${stock.changesPercentage}%)`
    ).join('\n');
  }
}

// Export singleton instance
export const openaiPredictions = new OpenAIPredictionService(); 