/**
 * Enhanced AI-Powered Stock Prediction Service
 * Leverages comprehensive FMP data: news, analyst opinions, earnings reports
 * Based on FMP API documentation: https://site.financialmodelingprep.com/developer/docs/stable
 */

import { OpenAI } from 'openai';

// Import enhanced FMP data types
interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  eps: number;
  pe: number;
}

interface NewsArticle {
  title: string;
  url: string;
  publishedDate: string;
  site: string;
  text: string;
}

interface PriceTarget {
  symbol: string;
  analystName: string;
  priceTarget: number;
  analystCompany: string;
  publishedDate: string;
}

interface UpgradeDowngrade {
  symbol: string;
  newGrade: string;
  previousGrade: string;
  gradingCompany: string;
  action: string;
  publishedDate: string;
}

interface AnalystEstimate {
  symbol: string;
  estimatedRevenueAvg: number;
  estimatedEpsAvg: number;
  numberAnalysts: number;
}

interface ComprehensiveStockData {
  quote: StockQuote | null;
  profile: any | null;
  news: NewsArticle[];
  analystEstimates: AnalystEstimate[];
  priceTargets: PriceTarget[];
  upgradesDowngrades: UpgradeDowngrade[];
  latestEarnings?: any;
  earningsTranscript?: any;
}

export interface EnhancedPredictionResult {
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
    newsImpact: 'positive' | 'negative' | 'neutral';
    analystConsensus: 'bullish' | 'bearish' | 'neutral';
  };
  evidence: {
    recentNews: Array<{
      headline: string;
      impact: 'positive' | 'negative' | 'neutral';
      source: string;
      url: string;
      date: string;
    }>;
    analystActions: Array<{
      firm: string;
      action: string;
      target?: number;
      grade: string;
      date: string;
    }>;
    earningsHighlights?: string[];
  };
  reasoning: string;
  confidence: number;
  lastUpdated: Date;
  dataQuality: {
    newsCount: number;
    analystCount: number;
    hasEarnings: boolean;
    hasTranscript: boolean;
  };
}

export class EnhancedAIPredictionService {
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
      dangerouslyAllowBrowser: true
    });
  }

  /**
   * Generate enhanced AI prediction using comprehensive market data
   */
  async generateEnhancedPrediction(data: ComprehensiveStockData): Promise<EnhancedPredictionResult> {
    try {
      if (!data.quote) {
        throw new Error('Stock quote data is required');
      }

      const prompt = this.buildComprehensivePrompt(data);
      
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a senior equity research analyst with 25+ years of Wall Street experience. You specialize in comprehensive stock analysis using real-time market data, news sentiment, analyst opinions, and financial reports. Your predictions are cited by major financial publications and have a proven track record of accuracy.

ANALYSIS APPROACH:
1. Synthesize ALL available data sources (price action, news, analyst opinions, earnings)
2. Weight recent developments more heavily than historical data
3. Consider both quantitative metrics and qualitative factors
4. Provide specific price targets with confidence intervals
5. Always cite your sources and reasoning transparently
6. Account for market sentiment and momentum

OUTPUT FORMAT: Respond ONLY with valid JSON following the exact structure requested.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2, // Lower for more consistent analysis
        max_tokens: 2000
      });

      const analysis = completion.choices[0]?.message?.content;
      if (!analysis) {
        throw new Error('No analysis generated');
      }

      return this.parseEnhancedAnalysis(data, analysis);

    } catch (error) {
      console.error('Enhanced AI Prediction Error:', error);
      return this.generateEnhancedFallback(data);
    }
  }

  /**
   * Build comprehensive analysis prompt with all FMP data
   */
  private buildComprehensivePrompt(data: ComprehensiveStockData): string {
    const stock = data.quote!;
    const newsSummary = this.summarizeNews(data.news);
    const analystSummary = this.summarizeAnalysts(data.priceTargets, data.upgradesDowngrades);
    const earningsSummary = this.summarizeEarnings(data.latestEarnings, data.earningsTranscript);

    return `
COMPREHENSIVE STOCK ANALYSIS REQUEST

COMPANY: ${stock.name} (${stock.symbol})

=== CURRENT MARKET DATA ===
Price: $${stock.price}
Daily Change: ${stock.change >= 0 ? '+' : ''}${stock.change} (${stock.changesPercentage}%)
Market Cap: $${(stock.marketCap / 1e9).toFixed(1)}B
P/E Ratio: ${stock.pe}
EPS: $${stock.eps}
Volume: ${(stock.volume / 1e6).toFixed(1)}M vs Avg: ${(stock.avgVolume / 1e6).toFixed(1)}M

TECHNICAL LEVELS:
- Day Range: $${stock.dayLow} - $${stock.dayHigh}
- 52-Week Range: $${stock.yearLow} - $${stock.yearHigh}
- 50-Day MA: $${stock.priceAvg50}
- 200-Day MA: $${stock.priceAvg200}
- Position in 52-week range: ${((stock.price - stock.yearLow) / (stock.yearHigh - stock.yearLow) * 100).toFixed(0)}%

=== RECENT NEWS & PRESS RELEASES ===
${newsSummary}

=== ANALYST OPINIONS & PRICE TARGETS ===
${analystSummary}

=== FINANCIAL REPORTS & EARNINGS ===
${earningsSummary}

=== ANALYSIS REQUIREMENTS ===

Provide a comprehensive analysis in JSON format:

{
  "nextDayPrice": number,
  "nextWeekPrice": number,
  "nextMonthPrice": number,
  "dayConfidence": number (70-95),
  "weekConfidence": number (65-90),
  "monthConfidence": number (60-85),
  "sentiment": "bullish" | "bearish" | "neutral",
  "riskLevel": "low" | "medium" | "high",
  "keyFactors": ["most important factor", "second factor", "third factor"],
  "strengths": ["key strength 1", "key strength 2"],
  "concerns": ["main concern 1", "main concern 2"],
  "newsImpact": "positive" | "negative" | "neutral",
  "analystConsensus": "bullish" | "bearish" | "neutral",
  "recentNewsHighlights": [
    {
      "headline": "brief headline",
      "impact": "positive" | "negative" | "neutral",
      "relevance": "high" | "medium" | "low"
    }
  ],
  "analystHighlights": [
    {
      "firm": "analyst firm",
      "action": "upgrade/downgrade/initiated",
      "target": number,
      "significance": "high" | "medium" | "low"
    }
  ],
  "reasoning": "2-3 sentence comprehensive explanation incorporating all data sources",
  "dataQualityScore": number (1-10, where 10 means comprehensive data available)
}

FOCUS ON:
1. Recent news sentiment and business developments
2. Analyst price target consensus and recent changes
3. Earnings results vs expectations
4. Technical momentum and chart patterns
5. Market environment and sector performance

CRITICAL: Base your analysis on the provided data sources. Cite specific news headlines, analyst actions, and earnings results in your reasoning.
    `;
  }

  /**
   * Summarize recent news for analysis
   */
  private summarizeNews(news: NewsArticle[]): string {
    if (!news || news.length === 0) {
      return "No recent news available.";
    }

    const recentNews = news.slice(0, 10); // Last 10 articles
    let summary = `${recentNews.length} recent news articles:\n`;

    recentNews.forEach((article, index) => {
      const date = new Date(article.publishedDate).toLocaleDateString();
      summary += `${index + 1}. "${article.title}" - ${article.site} (${date})\n`;
      if (article.text) {
        summary += `   Summary: ${article.text.substring(0, 150)}...\n`;
      }
    });

    return summary;
  }

  /**
   * Summarize analyst opinions and price targets
   */
  private summarizeAnalysts(priceTargets: PriceTarget[], upgradesDowngrades: UpgradeDowngrade[]): string {
    let summary = "";

    // Price Targets
    if (priceTargets && priceTargets.length > 0) {
      const recentTargets = priceTargets.slice(0, 10);
      summary += `PRICE TARGETS (${recentTargets.length} recent):\n`;
      
      recentTargets.forEach((target, index) => {
        const date = new Date(target.publishedDate).toLocaleDateString();
        summary += `${index + 1}. ${target.analystCompany}: $${target.priceTarget} target (${date})\n`;
      });

      // Calculate consensus
      const targets = recentTargets.map(t => t.priceTarget).filter(t => t > 0);
      if (targets.length > 0) {
        const avgTarget = targets.reduce((sum, target) => sum + target, 0) / targets.length;
        const highTarget = Math.max(...targets);
        const lowTarget = Math.min(...targets);
        summary += `Consensus: $${avgTarget.toFixed(2)} (Range: $${lowTarget} - $${highTarget})\n\n`;
      }
    }

    // Upgrades/Downgrades
    if (upgradesDowngrades && upgradesDowngrades.length > 0) {
      const recentActions = upgradesDowngrades.slice(0, 10);
      summary += `RECENT RATING CHANGES (${recentActions.length}):\n`;
      
      recentActions.forEach((action, index) => {
        const date = new Date(action.publishedDate).toLocaleDateString();
        summary += `${index + 1}. ${action.gradingCompany}: ${action.action} - ${action.previousGrade} → ${action.newGrade} (${date})\n`;
      });
    }

    return summary || "No analyst data available.";
  }

  /**
   * Summarize earnings and financial data
   */
  private summarizeEarnings(earnings?: any, transcript?: any): string {
    let summary = "";

    if (earnings) {
      summary += "LATEST FINANCIAL RESULTS:\n";
      summary += `Revenue: $${(earnings.revenue / 1e9).toFixed(1)}B\n`;
      summary += `Net Income: $${(earnings.netIncome / 1e9).toFixed(1)}B\n`;
      summary += `EPS: $${earnings.eps}\n`;
      summary += `Report Date: ${earnings.date}\n\n`;
    }

    if (transcript && transcript.content) {
      summary += "EARNINGS CALL HIGHLIGHTS:\n";
      // Extract key points from transcript (first 500 chars)
      summary += transcript.content.substring(0, 500) + "...\n";
    }

    return summary || "No recent earnings data available.";
  }

  /**
   * Parse enhanced AI analysis response
   */
  private parseEnhancedAnalysis(data: ComprehensiveStockData, analysis: string): EnhancedPredictionResult {
    try {
      const jsonMatch = analysis.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in analysis');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const stock = data.quote!;
      
      return {
        symbol: stock.symbol,
        currentPrice: stock.price,
        predictions: {
          nextDay: {
            price: parsed.nextDayPrice,
            change: parsed.nextDayPrice - stock.price,
            changePercent: ((parsed.nextDayPrice / stock.price - 1) * 100),
            confidence: parsed.dayConfidence
          },
          nextWeek: {
            price: parsed.nextWeekPrice,
            change: parsed.nextWeekPrice - stock.price,
            changePercent: ((parsed.nextWeekPrice / stock.price - 1) * 100),
            confidence: parsed.weekConfidence
          },
          nextMonth: {
            price: parsed.nextMonthPrice,
            change: parsed.nextMonthPrice - stock.price,
            changePercent: ((parsed.nextMonthPrice / stock.price - 1) * 100),
            confidence: parsed.monthConfidence
          }
        },
        analysis: {
          sentiment: parsed.sentiment,
          riskLevel: parsed.riskLevel,
          keyFactors: parsed.keyFactors || [],
          strengths: parsed.strengths || [],
          concerns: parsed.concerns || [],
          newsImpact: parsed.newsImpact,
          analystConsensus: parsed.analystConsensus
        },
        evidence: {
          recentNews: (parsed.recentNewsHighlights || []).map((news: any) => ({
            headline: news.headline,
            impact: news.impact,
            source: 'FMP News',
            url: '#',
            date: new Date().toISOString()
          })),
          analystActions: (parsed.analystHighlights || []).map((analyst: any) => ({
            firm: analyst.firm,
            action: analyst.action,
            target: analyst.target,
            grade: 'N/A',
            date: new Date().toISOString()
          })),
          earningsHighlights: []
        },
        reasoning: parsed.reasoning,
        confidence: (parsed.dayConfidence + parsed.weekConfidence + parsed.monthConfidence) / 3,
        lastUpdated: new Date(),
        dataQuality: {
          newsCount: data.news.length,
          analystCount: data.priceTargets.length + data.upgradesDowngrades.length,
          hasEarnings: !!data.latestEarnings,
          hasTranscript: !!data.earningsTranscript
        }
      };

    } catch (error) {
      console.error('Error parsing enhanced analysis:', error);
      return this.generateEnhancedFallback(data);
    }
  }

  /**
   * Generate enhanced fallback prediction if AI fails
   */
  private generateEnhancedFallback(data: ComprehensiveStockData): EnhancedPredictionResult {
    const stock = data.quote!;
    const volatility = Math.abs(stock.changesPercentage) / 100;
    const trend = stock.changesPercentage > 0 ? 1 : -1;
    
    // Enhanced fallback using available data
    const newsScore = this.calculateNewsScore(data.news);
    const analystScore = this.calculateAnalystScore(data.priceTargets, data.upgradesDowngrades);
    
    const combinedScore = (trend * volatility * 0.4) + (newsScore * 0.3) + (analystScore * 0.3);
    
    const nextDayPrice = stock.price * (1 + combinedScore * 0.01);
    const nextWeekPrice = stock.price * (1 + combinedScore * 0.02);
    const nextMonthPrice = stock.price * (1 + combinedScore * 0.05);

    return {
      symbol: stock.symbol,
      currentPrice: stock.price,
      predictions: {
        nextDay: {
          price: Math.round(nextDayPrice * 100) / 100,
          change: nextDayPrice - stock.price,
          changePercent: ((nextDayPrice / stock.price - 1) * 100),
          confidence: 75
        },
        nextWeek: {
          price: Math.round(nextWeekPrice * 100) / 100,
          change: nextWeekPrice - stock.price,
          changePercent: ((nextWeekPrice / stock.price - 1) * 100),
          confidence: 70
        },
        nextMonth: {
          price: Math.round(nextMonthPrice * 100) / 100,
          change: nextMonthPrice - stock.price,
          changePercent: ((nextMonthPrice / stock.price - 1) * 100),
          confidence: 65
        }
      },
      analysis: {
        sentiment: combinedScore > 0 ? 'bullish' : combinedScore < 0 ? 'bearish' : 'neutral',
        riskLevel: volatility > 0.03 ? 'high' : volatility > 0.015 ? 'medium' : 'low',
        keyFactors: ['Price momentum', 'Market sentiment', 'Technical indicators'],
        strengths: trend > 0 ? ['Positive momentum'] : [],
        concerns: trend < 0 ? ['Negative momentum'] : ['Market uncertainty'],
        newsImpact: newsScore > 0 ? 'positive' : newsScore < 0 ? 'negative' : 'neutral',
        analystConsensus: analystScore > 0 ? 'bullish' : analystScore < 0 ? 'bearish' : 'neutral'
      },
      evidence: {
        recentNews: data.news.slice(0, 3).map(news => ({
          headline: news.title,
          impact: 'neutral' as const,
          source: news.site,
          url: news.url,
          date: news.publishedDate
        })),
        analystActions: [],
        earningsHighlights: []
      },
      reasoning: `Analysis based on available market data. ${trend > 0 ? 'Positive' : 'Negative'} momentum with ${data.news.length} news articles and ${data.priceTargets.length} analyst targets considered.`,
      confidence: 70,
      lastUpdated: new Date(),
      dataQuality: {
        newsCount: data.news.length,
        analystCount: data.priceTargets.length + data.upgradesDowngrades.length,
        hasEarnings: !!data.latestEarnings,
        hasTranscript: !!data.earningsTranscript
      }
    };
  }

  /**
   * Calculate sentiment score from news
   */
  private calculateNewsScore(news: NewsArticle[]): number {
    if (!news || news.length === 0) return 0;
    
    // Simple sentiment analysis based on keywords
    const positiveWords = ['growth', 'profit', 'beat', 'strong', 'upgrade', 'buy', 'bullish'];
    const negativeWords = ['loss', 'miss', 'weak', 'downgrade', 'sell', 'bearish', 'decline'];
    
    let score = 0;
    news.slice(0, 10).forEach(article => {
      const text = (article.title + ' ' + article.text).toLowerCase();
      positiveWords.forEach(word => {
        if (text.includes(word)) score += 1;
      });
      negativeWords.forEach(word => {
        if (text.includes(word)) score -= 1;
      });
    });
    
    return Math.max(-1, Math.min(1, score / news.length));
  }

  /**
   * Calculate sentiment score from analyst actions
   */
  private calculateAnalystScore(priceTargets: PriceTarget[], upgradesDowngrades: UpgradeDowngrade[]): number {
    let score = 0;
    
    // Price targets (assuming they're generally bullish if above current price)
    if (priceTargets.length > 0) {
      score += 0.5; // Baseline positive for having targets
    }
    
    // Upgrades/downgrades
    upgradesDowngrades.slice(0, 10).forEach(action => {
      if (action.action?.toLowerCase().includes('upgrade') || 
          action.newGrade?.toLowerCase().includes('buy')) {
        score += 1;
      } else if (action.action?.toLowerCase().includes('downgrade') ||
                 action.newGrade?.toLowerCase().includes('sell')) {
        score -= 1;
      }
    });
    
    return Math.max(-1, Math.min(1, score / Math.max(1, upgradesDowngrades.length)));
  }
}

// Export singleton instance
export const enhancedAIPredictor = new EnhancedAIPredictionService(); 