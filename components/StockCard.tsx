'use client';

import React, { useState } from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, ExclamationTriangleIcon, LinkIcon, ChartBarIcon, NewspaperIcon, UserGroupIcon, CurrencyDollarIcon, GlobeAltIcon, HeartIcon, ChevronDownIcon, ChevronUpIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

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
  // Safety check for undefined data
  if (!data) {
    return (
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
    );
  }
  
  // State for expanding/collapsing sources
  const [showAllSources, setShowAllSources] = useState(false);
  
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

      {/* Market Intelligence - Clean & Elegant */}
      {data.analysis.sources && data.analysis.sources.length > 0 && (
        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between">
            <h5 className="text-sm font-semibold text-gray-900">Market Intelligence</h5>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
              <span>{data.analysis.sources.length} sources</span>
            </div>
          </div>
          
          {/* Compact Sources List */}
          <div className="space-y-2">
            {data.analysis.sources.slice(0, showAllSources ? data.analysis.sources.length : 4).map((source, index) => (
              <a
                key={index}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between p-2.5 bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition-all duration-200 cursor-pointer block"
              >
                <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                  {/* Source Type Indicator */}
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    source.type === 'analyst' ? 'bg-blue-500' :
                    source.type === 'news' ? 'bg-green-500' :
                    source.type === 'technical' ? 'bg-orange-500' :
                    'bg-gray-400'
                  }`}></div>
                  
                  {/* Source Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-900 truncate">
                        {source.source}
                      </span>
                      <span className="text-xs text-gray-500">•</span>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {(() => {
                          const sourceDate = new Date(source.date);
                          const today = new Date();
                          const diffDays = Math.floor((today.getTime() - sourceDate.getTime()) / (24 * 60 * 60 * 1000));
                          if (diffDays === 0) return 'Today';
                          if (diffDays === 1) return '1d';
                          if (diffDays <= 7) return `${diffDays}d`;
                          return sourceDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                        })()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 truncate mt-0.5">
                      {source.title.length > 45 ? source.title.substring(0, 45) + '...' : source.title}
                    </p>
                  </div>
                </div>
                
                {/* Impact & Confidence */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                  {/* Simple Impact Indicator */}
                  <div className={`w-1 h-1 rounded-full ${
                    source.impact === 'positive' ? 'bg-emerald-500' :
                    source.impact === 'negative' ? 'bg-red-500' :
                    'bg-gray-400'
                  }`}></div>
                  
                  {/* Simplified Confidence - just number */}
                  <span className="text-xs font-medium text-gray-700 tabular-nums group-hover:text-blue-600">
                    {Math.round(source.confidence)}
                  </span>
                  <ArrowTopRightOnSquareIcon className="w-3 h-3 text-gray-400 group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-1" />
                </div>
              </a>
            ))}
            
            {/* Show More/Less Button if more than 4 sources */}
            {data.analysis.sources.length > 4 && (
              <button 
                onClick={() => setShowAllSources(!showAllSources)}
                className="w-full flex items-center justify-center space-x-1 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 py-2 px-3 rounded-lg transition-all duration-200 border border-transparent hover:border-blue-200"
              >
                <span>
                  {showAllSources 
                    ? 'Show less sources' 
                    : `View ${data.analysis.sources.length - 4} more sources`
                  }
                </span>
                {showAllSources ? (
                  <ChevronUpIcon className="w-3 h-3" />
                ) : (
                  <ChevronDownIcon className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
          
          {/* Clean Summary */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-900">
                  {data.analysis.sources.filter(s => s.impact === 'positive').length}
                </span>
                <span className="text-xs text-gray-500">bullish</span>
              </div>
              {data.analysis.sources.filter(s => s.impact === 'negative').length > 0 && (
                <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-900">
                    {data.analysis.sources.filter(s => s.impact === 'negative').length}
                  </span>
                  <span className="text-xs text-gray-500">bearish</span>
                </div>
              )}
            </div>
            
            <div className="text-right">
              <span className="text-xs font-semibold text-gray-900 tabular-nums">
                {Math.round(data.analysis.sources.reduce((sum, s) => sum + s.confidence, 0) / data.analysis.sources.length)}%
              </span>
              <span className="text-xs text-gray-500 ml-1">avg</span>
            </div>
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