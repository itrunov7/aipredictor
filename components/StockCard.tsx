'use client';

import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon, LinkIcon, ChartBarIcon, NewspaperIcon, UserGroupIcon, CurrencyDollarIcon, GlobeAltIcon, HeartIcon } from '@heroicons/react/24/outline';

interface PredictionData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  predictions: {
    nextDay: {
      price: number;
      changePercent: number;
      confidence: number;
    };
    nextWeek: {
      price: number;
      changePercent: number;
      confidence: number;
    };
    nextMonth: {
      price: number;
      changePercent: number;
      confidence: number;
    };
  };
  analysis: {
    sentiment: 'bullish' | 'bearish' | 'neutral';
    riskLevel: 'low' | 'medium' | 'high';
      keyFactors: string[];
  reasoning: string;
  confidence: number;
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
  source: string; // Accept any string for flexible backend sources
}

interface StockCardProps {
  data: PredictionData;
  variant?: 'featured' | 'compact';
  showActions?: boolean;
}

export function StockCard({ 
  data, 
  variant = 'featured', 
  showActions = false 
}: StockCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(2)}%`;
  };

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return <ArrowTrendingUpIcon className="w-5 h-5 text-green-600" />;
      case 'bearish':
        return <ArrowTrendingDownIcon className="w-5 h-5 text-red-600" />;
      default:
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'bullish':
        return 'text-green-600 bg-green-50';
      case 'bearish':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'text-green-600 bg-green-50';
      case 'high':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case 'news':
        return <NewspaperIcon className="w-4 h-4" />;
      case 'analyst':
        return <UserGroupIcon className="w-4 h-4" />;
      case 'technical':
        return <ChartBarIcon className="w-4 h-4" />;
      case 'earnings':
        return <CurrencyDollarIcon className="w-4 h-4" />;
      case 'economic':
        return <GlobeAltIcon className="w-4 h-4" />;
      case 'sentiment':
        return <HeartIcon className="w-4 h-4" />;
      default:
        return <LinkIcon className="w-4 h-4" />;
    }
  };

  const getSourceColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getSourceTypeLabel = (type: string) => {
    switch (type) {
      case 'news':
        return 'News';
      case 'analyst':
        return 'Analyst';
      case 'technical':
        return 'Technical';
      case 'earnings':
        return 'Earnings';
      case 'economic':
        return 'Economic';
      case 'sentiment':
        return 'Sentiment';
      default:
        return 'Source';
    }
  };

  return (
    <div className="glass-card p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{data.name}</h3>
          <p className="text-sm text-gray-500">{data.symbol}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(data.currentPrice)}
          </p>
          <p className={`text-sm font-medium ${
            data.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {formatPercent(data.changePercent)}
          </p>
        </div>
      </div>

      {/* AI Source Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-gray-600 font-medium">
            {data.source}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          <span className="text-xs text-green-600 font-medium">
            Today
          </span>
        </div>
      </div>

      {/* Sentiment Badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {getSentimentIcon(data.analysis.sentiment)}
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(data.analysis.sentiment)}`}>
            {data.analysis.sentiment.toUpperCase()}
          </span>
        </div>
      </div>

      {/* Predictions */}
      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">
          AI Predictions
        </h4>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Next Day</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(data.predictions.nextDay.price)}
            </p>
            <p className={`text-xs font-medium ${
              data.predictions.nextDay.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercent(data.predictions.nextDay.changePercent)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Next Week</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(data.predictions.nextWeek.price)}
            </p>
            <p className={`text-xs font-medium ${
              data.predictions.nextWeek.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercent(data.predictions.nextWeek.changePercent)}
            </p>
          </div>
          
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1">Next Month</p>
            <p className="text-lg font-semibold text-gray-900">
              {formatCurrency(data.predictions.nextMonth.price)}
            </p>
            <p className={`text-xs font-medium ${
              data.predictions.nextMonth.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatPercent(data.predictions.nextMonth.changePercent)}
            </p>
          </div>
        </div>
      </div>

      {/* Analysis */}
      <div className="space-y-3 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Risk Level</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRiskColor(data.analysis.riskLevel)}`}>
            {data.analysis.riskLevel.toUpperCase()}
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Confidence</span>
          <div className="flex items-center space-x-2">
            <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary-500 transition-all duration-300"
                style={{ width: `${data.analysis.confidence}%` }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {data.analysis.confidence}%
            </span>
          </div>
        </div>
      </div>

      {/* Key Factors */}
      <div className="space-y-2 mb-4">
        <h5 className="text-sm font-semibold text-gray-700">Key Factors</h5>
        <div className="flex flex-wrap gap-1">
          {data.analysis.keyFactors.map((factor, index) => (
            <span 
              key={index}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg"
            >
              {factor}
            </span>
          ))}
        </div>
      </div>

      {/* AI Reasoning */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-3 rounded-xl mb-4">
        <h5 className="text-sm font-semibold text-gray-700 mb-2">AI Analysis</h5>
        <p className="text-sm text-gray-600 leading-relaxed">
          {data.analysis.reasoning}
        </p>
      </div>

      {/* Evidence Sources */}
      {data.analysis.sources && data.analysis.sources.length > 0 && (
        <div className="space-y-3 mb-4">
          <h5 className="text-sm font-semibold text-gray-700">Analysis Sources ({data.analysis.sources.length})</h5>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {data.analysis.sources.map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block p-3 rounded-lg border transition-all duration-200 hover:shadow-md ${getSourceColor(source.impact)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 flex-1">
                    <div className="flex-shrink-0 mt-0.5">
                      {getSourceIcon(source.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium uppercase tracking-wider">
                          {getSourceTypeLabel(source.type)}
                        </span>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                          source.impact === 'positive' ? 'bg-green-100 text-green-700' :
                          source.impact === 'negative' ? 'bg-red-100 text-red-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {source.impact === 'positive' ? '+' : source.impact === 'negative' ? '-' : '='}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                        {source.title}
                      </p>
                                             <div className="flex items-center justify-between text-xs text-gray-500">
                         <span>{source.source}</span>
                         <span>{(() => {
                           const sourceDate = new Date(source.date);
                           const today = new Date();
                           const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
                           
                           if (sourceDate.toDateString() === today.toDateString()) {
                             return 'Today';
                           } else if (sourceDate.toDateString() === yesterday.toDateString()) {
                             return 'Yesterday';
                           } else {
                             const diffDays = Math.floor((today.getTime() - sourceDate.getTime()) / (24 * 60 * 60 * 1000));
                             if (diffDays <= 7) {
                               return `${diffDays}d ago`;
                             } else {
                               return sourceDate.toLocaleDateString('en-US', { 
                                 month: 'short', 
                                 day: 'numeric' 
                               });
                             }
                           }
                         })()}</span>
                       </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1 ml-2">
                    <div className="text-xs font-medium text-gray-600">
                      {source.confidence}%
                    </div>
                    <LinkIcon className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              </a>
            ))}
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">
              Click any source to view original article or report
            </p>
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <button className="flex-1 btn-primary text-sm py-2">
              View Details
            </button>
            <button className="flex-1 btn-secondary text-sm py-2">
              Add to Watchlist
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 