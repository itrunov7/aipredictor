import { logger } from '../utils/logger';
import * as ss from 'simple-statistics';

interface HistoricalData {
  date: string;
  price: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
}

interface TechnicalData {
  rsi: number;
  sma20: number;
  sma50: number;
  sma200: number;
  ema12: number;
  ema26: number;
  macd: number;
  bollingerUpper: number;
  bollingerLower: number;
  bollingerMiddle: number;
  volume: number;
}

interface MarketData {
  sp500Change: number;
  vixLevel: number;
  tenYearYield: number;
  dollarIndex: number;
}

interface NewsData {
  sentimentScore: number; // -1 to 1
  newsVolume: number;
  relevanceScore: number;
}

interface PredictionInput {
  symbol: string;
  historicalPrices: HistoricalData[];
  technicalIndicators: TechnicalData;
  marketData: MarketData;
  newsData: NewsData;
  analystTargets: {
    high: number;
    low: number;
    average: number;
    count: number;
  };
}

interface PredictionOutput {
  symbol: string;
  predictions: {
    nextDay: {
      price: number;
      low: number;
      high: number;
      confidence: number;
    };
    nextWeek: {
      price: number;
      low: number;
      high: number;
      confidence: number;
    };
    nextMonth: {
      price: number;
      low: number;
      high: number;
      confidence: number;
    };
  };
  confidence: {
    overall: number;
    technical: number;
    fundamental: number;
    sentiment: number;
  };
  reasons: Array<{
    category: 'technical' | 'fundamental' | 'sentiment' | 'analyst' | 'macro';
    reason: string;
    impact: 'bullish' | 'bearish' | 'neutral';
    weight: number;
  }>;
  riskLevel: 'low' | 'medium' | 'high';
  lastUpdated: Date;
}

export class PredictionEngine {
  private readonly SMOOTHING_ALPHA = 0.3;
  private readonly VOLATILITY_LOOKBACK = 20;
  private readonly MIN_HISTORICAL_DAYS = 30;

  /**
   * Generate comprehensive stock predictions
   */
  async generatePrediction(input: PredictionInput): Promise<PredictionOutput> {
    try {
      logger.info(`Generating prediction for ${input.symbol}`);

      if (input.historicalPrices.length < this.MIN_HISTORICAL_DAYS) {
        throw new Error(`Insufficient historical data for ${input.symbol}. Need at least ${this.MIN_HISTORICAL_DAYS} days.`);
      }

      const currentPrice = input.historicalPrices[input.historicalPrices.length - 1].close;
      
      // Calculate volatility
      const volatility = this.calculateVolatility(input.historicalPrices);
      
      // Technical analysis predictions
      const technicalPrediction = this.calculateTechnicalPrediction(input);
      
      // Trend analysis
      const trendPrediction = this.calculateTrendPrediction(input.historicalPrices);
      
      // Market sentiment analysis
      const sentimentPrediction = this.calculateSentimentPrediction(input);
      
      // Analyst target influence
      const analystInfluence = this.calculateAnalystInfluence(input.analystTargets, currentPrice);
      
      // Combine predictions with weights
      const combinedPrediction = this.combinePredictions([
        { prediction: technicalPrediction, weight: 0.4 },
        { prediction: trendPrediction, weight: 0.3 },
        { prediction: sentimentPrediction, weight: 0.2 },
        { prediction: analystInfluence, weight: 0.1 },
      ]);

      // Calculate confidence levels
      const confidence = this.calculateConfidence(input, volatility);
      
      // Generate prediction ranges
      const predictions = this.generatePredictionRanges(
        currentPrice,
        combinedPrediction,
        volatility,
        confidence
      );

      // Generate reasons
      const reasons = this.generatePredictionReasons(input, technicalPrediction, sentimentPrediction);

      // Assess risk level
      const riskLevel = this.assessRiskLevel(volatility, input.technicalIndicators, input.marketData);

      return {
        symbol: input.symbol,
        predictions,
        confidence,
        reasons,
        riskLevel,
        lastUpdated: new Date(),
      };

    } catch (error) {
      logger.error(`Error generating prediction for ${input.symbol}:`, error);
      throw error;
    }
  }

  /**
   * Calculate historical volatility using standard deviation of returns
   */
  private calculateVolatility(historicalPrices: HistoricalData[]): number {
    const returns = [];
    
    for (let i = 1; i < historicalPrices.length; i++) {
      const currentPrice = historicalPrices[i].close;
      const previousPrice = historicalPrices[i - 1].close;
      const dailyReturn = (currentPrice - previousPrice) / previousPrice;
      returns.push(dailyReturn);
    }

    const recentReturns = returns.slice(-this.VOLATILITY_LOOKBACK);
    return ss.standardDeviation(recentReturns) * Math.sqrt(252); // Annualized volatility
  }

  /**
   * Technical analysis based prediction
   */
  private calculateTechnicalPrediction(input: PredictionInput): number {
    const { technicalIndicators } = input;
    const currentPrice = input.historicalPrices[input.historicalPrices.length - 1].close;
    
    let technicalScore = 0;
    let signalCount = 0;

    // RSI signals
    if (technicalIndicators.rsi < 30) {
      technicalScore += 0.1; // Oversold - bullish
    } else if (technicalIndicators.rsi > 70) {
      technicalScore -= 0.1; // Overbought - bearish
    }
    signalCount++;

    // Moving average signals
    if (currentPrice > technicalIndicators.sma20) technicalScore += 0.05;
    if (currentPrice > technicalIndicators.sma50) technicalScore += 0.1;
    if (currentPrice > technicalIndicators.sma200) technicalScore += 0.15;
    signalCount += 3;

    // EMA crossover
    if (technicalIndicators.ema12 > technicalIndicators.ema26) {
      technicalScore += 0.1; // Golden cross
    } else {
      technicalScore -= 0.1; // Death cross
    }
    signalCount++;

    // MACD signal
    if (technicalIndicators.macd > 0) {
      technicalScore += 0.05;
    } else {
      technicalScore -= 0.05;
    }
    signalCount++;

    // Bollinger Bands
    const bollingerPosition = (currentPrice - technicalIndicators.bollingerLower) / 
                              (technicalIndicators.bollingerUpper - technicalIndicators.bollingerLower);
    
    if (bollingerPosition < 0.2) {
      technicalScore += 0.1; // Near lower band - oversold
    } else if (bollingerPosition > 0.8) {
      technicalScore -= 0.1; // Near upper band - overbought
    }
    signalCount++;

    return technicalScore / signalCount;
  }

  /**
   * Trend-based prediction using linear regression
   */
  private calculateTrendPrediction(historicalPrices: HistoricalData[]): number {
    const prices = historicalPrices.slice(-20).map((data, index) => [index, data.close]);
    
    try {
      const regression = ss.linearRegression(prices);
      const slope = regression.m;
      
      // Normalize slope to percentage change
      const avgPrice = ss.mean(prices.map(p => p[1]));
      return (slope * 5) / avgPrice; // 5-day projection normalized
    } catch (error) {
      logger.warn('Error calculating trend prediction:', error);
      return 0;
    }
  }

  /**
   * Sentiment-based prediction
   */
  private calculateSentimentPrediction(input: PredictionInput): number {
    const { newsData, marketData } = input;
    
    let sentimentScore = 0;
    
    // News sentiment
    sentimentScore += newsData.sentimentScore * 0.6;
    
    // Market environment
    if (marketData.sp500Change > 0.02) {
      sentimentScore += 0.1; // Strong market performance
    } else if (marketData.sp500Change < -0.02) {
      sentimentScore -= 0.1; // Weak market performance
    }
    
    // VIX level (fear index)
    if (marketData.vixLevel > 30) {
      sentimentScore -= 0.1; // High fear
    } else if (marketData.vixLevel < 15) {
      sentimentScore += 0.05; // Low fear
    }
    
    return Math.max(-0.2, Math.min(0.2, sentimentScore));
  }

  /**
   * Analyst target influence
   */
  private calculateAnalystInfluence(analystTargets: any, currentPrice: number): number {
    if (analystTargets.count === 0) return 0;
    
    const avgTarget = analystTargets.average;
    const targetDifference = (avgTarget - currentPrice) / currentPrice;
    
    // Weight by number of analysts (more analysts = more reliable)
    const analystWeight = Math.min(analystTargets.count / 10, 1);
    
    return targetDifference * analystWeight * 0.1; // Cap influence at 10%
  }

  /**
   * Combine multiple prediction signals with weights
   */
  private combinePredictions(predictions: Array<{ prediction: number; weight: number }>): number {
    const totalWeight = predictions.reduce((sum, p) => sum + p.weight, 0);
    const weightedSum = predictions.reduce((sum, p) => sum + (p.prediction * p.weight), 0);
    
    return weightedSum / totalWeight;
  }

  /**
   * Calculate confidence levels for different factors
   */
  private calculateConfidence(input: PredictionInput, volatility: number): {
    overall: number;
    technical: number;
    fundamental: number;
    sentiment: number;
  } {
    // Base confidence inversely related to volatility
    const baseConfidence = Math.max(0.3, 1 - (volatility * 2));
    
    // Technical confidence based on signal strength
    const technicalConfidence = this.calculateTechnicalConfidence(input.technicalIndicators);
    
    // Fundamental confidence based on analyst coverage
    const fundamentalConfidence = Math.min(input.analystTargets.count / 20, 1);
    
    // Sentiment confidence based on news volume and relevance
    const sentimentConfidence = input.newsData.relevanceScore * 
                               Math.min(input.newsData.newsVolume / 10, 1);
    
    const overall = (baseConfidence + technicalConfidence + fundamentalConfidence + sentimentConfidence) / 4;
    
    return {
      overall: Math.max(0.2, Math.min(0.95, overall)),
      technical: Math.max(0.2, Math.min(0.95, technicalConfidence)),
      fundamental: Math.max(0.2, Math.min(0.95, fundamentalConfidence)),
      sentiment: Math.max(0.2, Math.min(0.95, sentimentConfidence)),
    };
  }

  /**
   * Calculate technical confidence based on indicator alignment
   */
  private calculateTechnicalConfidence(indicators: TechnicalData): number {
    let alignmentScore = 0;
    let totalIndicators = 0;

    // Check if indicators are giving consistent signals
    const currentPrice = indicators.sma20; // Use SMA20 as proxy for current price
    
    // Moving average alignment
    if (currentPrice > indicators.sma20 && indicators.sma20 > indicators.sma50 && indicators.sma50 > indicators.sma200) {
      alignmentScore += 2; // Strong bullish alignment
    } else if (currentPrice < indicators.sma20 && indicators.sma20 < indicators.sma50 && indicators.sma50 < indicators.sma200) {
      alignmentScore += 2; // Strong bearish alignment
    }
    totalIndicators += 2;

    // RSI confirmation
    if ((indicators.rsi > 50 && currentPrice > indicators.sma20) || 
        (indicators.rsi < 50 && currentPrice < indicators.sma20)) {
      alignmentScore += 1;
    }
    totalIndicators += 1;

    // MACD confirmation
    if ((indicators.macd > 0 && currentPrice > indicators.sma20) || 
        (indicators.macd < 0 && currentPrice < indicators.sma20)) {
      alignmentScore += 1;
    }
    totalIndicators += 1;

    return alignmentScore / totalIndicators;
  }

  /**
   * Generate prediction ranges for different time horizons
   */
  private generatePredictionRanges(
    currentPrice: number,
    combinedPrediction: number,
    volatility: number,
    confidence: any
  ) {
    const oneDayReturn = combinedPrediction * 0.2; // Scale for 1 day
    const oneWeekReturn = combinedPrediction * 0.7; // Scale for 1 week
    const oneMonthReturn = combinedPrediction; // Full prediction for 1 month

    return {
      nextDay: this.calculatePriceRange(currentPrice, oneDayReturn, volatility * 0.1, confidence.overall),
      nextWeek: this.calculatePriceRange(currentPrice, oneWeekReturn, volatility * 0.25, confidence.overall),
      nextMonth: this.calculatePriceRange(currentPrice, oneMonthReturn, volatility * 0.5, confidence.overall),
    };
  }

  /**
   * Calculate price range with confidence intervals
   */
  private calculatePriceRange(basePrice: number, expectedReturn: number, volatilityFactor: number, confidence: number) {
    const targetPrice = basePrice * (1 + expectedReturn);
    const range = basePrice * volatilityFactor * (2 - confidence); // Lower confidence = wider range
    
    return {
      price: Math.round(targetPrice * 100) / 100,
      low: Math.round((targetPrice - range) * 100) / 100,
      high: Math.round((targetPrice + range) * 100) / 100,
      confidence: Math.round(confidence * 100) / 100,
    };
  }

  /**
   * Generate human-readable prediction reasons
   */
  private generatePredictionReasons(
    input: PredictionInput,
    technicalPrediction: number,
    sentimentPrediction: number
  ): Array<any> {
    const reasons = [];
    const { technicalIndicators, newsData, analystTargets } = input;

    // Technical reasons
    if (technicalPrediction > 0.05) {
      reasons.push({
        category: 'technical',
        reason: 'Strong technical indicators suggest upward momentum',
        impact: 'bullish',
        weight: Math.abs(technicalPrediction),
      });
    } else if (technicalPrediction < -0.05) {
      reasons.push({
        category: 'technical',
        reason: 'Technical indicators showing bearish signals',
        impact: 'bearish',
        weight: Math.abs(technicalPrediction),
      });
    }

    // RSI-specific reasons
    if (technicalIndicators.rsi < 30) {
      reasons.push({
        category: 'technical',
        reason: 'RSI indicates oversold conditions, potential bounce expected',
        impact: 'bullish',
        weight: 0.3,
      });
    } else if (technicalIndicators.rsi > 70) {
      reasons.push({
        category: 'technical',
        reason: 'RSI shows overbought levels, correction possible',
        impact: 'bearish',
        weight: 0.3,
      });
    }

    // Sentiment reasons
    if (sentimentPrediction > 0.1) {
      reasons.push({
        category: 'sentiment',
        reason: 'Positive news sentiment and market environment',
        impact: 'bullish',
        weight: Math.abs(sentimentPrediction),
      });
    } else if (sentimentPrediction < -0.1) {
      reasons.push({
        category: 'sentiment',
        reason: 'Negative news sentiment affecting outlook',
        impact: 'bearish',
        weight: Math.abs(sentimentPrediction),
      });
    }

    // Analyst target reasons
    if (analystTargets.count > 0) {
      const currentPrice = input.historicalPrices[input.historicalPrices.length - 1].close;
      const upside = (analystTargets.average - currentPrice) / currentPrice;
      
      if (upside > 0.1) {
        reasons.push({
          category: 'analyst',
          reason: `Analyst targets suggest ${Math.round(upside * 100)}% upside potential`,
          impact: 'bullish',
          weight: 0.2,
        });
      } else if (upside < -0.1) {
        reasons.push({
          category: 'analyst',
          reason: `Current price above analyst targets by ${Math.round(Math.abs(upside) * 100)}%`,
          impact: 'bearish',
          weight: 0.2,
        });
      }
    }

    return reasons;
  }

  /**
   * Assess overall risk level
   */
  private assessRiskLevel(
    volatility: number,
    technicalIndicators: TechnicalData,
    marketData: MarketData
  ): 'low' | 'medium' | 'high' {
    let riskScore = 0;

    // Volatility risk
    if (volatility > 0.4) riskScore += 2;
    else if (volatility > 0.25) riskScore += 1;

    // Market risk (VIX)
    if (marketData.vixLevel > 30) riskScore += 2;
    else if (marketData.vixLevel > 20) riskScore += 1;

    // Technical risk (RSI extremes)
    if (technicalIndicators.rsi > 80 || technicalIndicators.rsi < 20) riskScore += 1;

    if (riskScore >= 4) return 'high';
    if (riskScore >= 2) return 'medium';
    return 'low';
  }

  /**
   * Exponential smoothing for price prediction (alternative method)
   */
  private exponentialSmoothing(prices: number[], alpha: number = this.SMOOTHING_ALPHA): number {
    if (prices.length === 0) return 0;
    
    let smoothed = prices[0];
    for (let i = 1; i < prices.length; i++) {
      smoothed = alpha * prices[i] + (1 - alpha) * smoothed;
    }
    
    return smoothed;
  }

  /**
   * Double exponential smoothing for trend prediction
   */
  private doubleExponentialSmoothing(prices: number[], alpha: number = 0.3, beta: number = 0.3): { level: number; trend: number } {
    if (prices.length < 2) return { level: prices[0] || 0, trend: 0 };
    
    let level = prices[0];
    let trend = prices[1] - prices[0];
    
    for (let i = 1; i < prices.length; i++) {
      const prevLevel = level;
      level = alpha * prices[i] + (1 - alpha) * (level + trend);
      trend = beta * (level - prevLevel) + (1 - beta) * trend;
    }
    
    return { level, trend };
  }
} 