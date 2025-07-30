'use client';

import React, { useState } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon, 
  ArrowTrendingDownIcon,
  ClockIcon,
  SparklesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CalendarDaysIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

interface Prediction {
  price: number;
  changePercent: number;
  confidence: number;
}

interface AIAnalysisProps {
  symbol: string;
  currentPrice: number;
  predictions: {
    nextDay: Prediction;
    nextWeek: Prediction;
    nextMonth: Prediction;
  };
  analysis: {
    reasoning: string;
    confidence: number;
    sentiment: string;
    riskLevel: string;
    sources: any[];
  };
  lastUpdated: string;
}

export function EnhancedAIAnalysis({ 
  symbol, 
  currentPrice, 
  predictions, 
  analysis, 
  lastUpdated 
}: AIAnalysisProps) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  const getTimeAgo = (date: string) => {
    const diff = Date.now() - new Date(date).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor(diff / (1000 * 60));
    
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };

  const getTrendIcon = (changePercent: number) => {
    return changePercent >= 0 ? ArrowTrendingUpIcon : ArrowTrendingDownIcon;
  };

  const getTrendColor = (changePercent: number) => {
    return changePercent >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Parse sections from AI reasoning
  const parseAnalysisSections = (reasoning: string) => {
    const sections = {
      predictions: '',
      technical: '',
      fundamental: '',
      catalysts: '',
      risks: ''
    };

    // Extract sections based on common patterns
    const predictionMatch = reasoning.match(/(?:PRICE PREDICTIONS?|PREDICTIONS?)[:\s]*(.*?)(?=(?:TECHNICAL|FUNDAMENTAL|MARKET|RISK|\n\n|$))/i);
    const technicalMatch = reasoning.match(/(?:TECHNICAL|CHART)[:\s]*(.*?)(?=(?:FUNDAMENTAL|MARKET|RISK|\n\n|$))/i);
    const fundamentalMatch = reasoning.match(/(?:FUNDAMENTAL|VALUATION)[:\s]*(.*?)(?=(?:MARKET|TECHNICAL|RISK|\n\n|$))/i);
    const catalystsMatch = reasoning.match(/(?:MARKET CATALYSTS?|CATALYSTS?)[:\s]*(.*?)(?=(?:RISK|TECHNICAL|FUNDAMENTAL|\n\n|$))/i);
    const risksMatch = reasoning.match(/(?:RISK|RISKS)[:\s]*(.*?)(?=(?:TECHNICAL|FUNDAMENTAL|MARKET|\n\n|$))/i);

    if (predictionMatch) sections.predictions = predictionMatch[1].trim();
    if (technicalMatch) sections.technical = technicalMatch[1].trim();
    if (fundamentalMatch) sections.fundamental = fundamentalMatch[1].trim();
    if (catalystsMatch) sections.catalysts = catalystsMatch[1].trim();
    if (risksMatch) sections.risks = risksMatch[1].trim();

    return sections;
  };

  const sections = parseAnalysisSections(analysis.reasoning);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-800 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">AI Analysis</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Powered by GPT-4 • {analysis.sources.length} data sources</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(analysis.confidence)}`}>
            {analysis.confidence}% confidence
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <ClockIcon className="w-4 h-4" />
            <span>{getTimeAgo(lastUpdated)}</span>
          </div>
        </div>
      </div>

      {/* Price Predictions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: '24H Target', period: 'nextDay', icon: ClockIcon },
          { label: '1W Target', period: 'nextWeek', icon: CalendarDaysIcon },
          { label: '1M Target', period: 'nextMonth', icon: ChartBarIcon }
        ].map(({ label, period, icon: Icon }) => {
          const prediction = predictions[period as keyof typeof predictions];
          const TrendIcon = getTrendIcon(prediction.changePercent);
          
          return (
            <div key={period} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-6 transition-all duration-200 hover:shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
                </div>
                <TrendIcon className={`w-5 h-5 ${getTrendColor(prediction.changePercent)}`} />
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(prediction.price)}
                </div>
                <div className={`text-sm font-medium ${getTrendColor(prediction.changePercent)}`}>
                  {formatPercent(prediction.changePercent)}
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${
                      prediction.confidence >= 80 ? 'bg-green-500' : 
                      prediction.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${prediction.confidence}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {prediction.confidence}% confidence
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Analysis Sections */}
      <div className="space-y-4">
        {[
          { 
            id: 'technical', 
            title: 'Technical Analysis', 
            icon: ChartBarIcon, 
            content: sections.technical,
            color: 'blue'
          },
          { 
            id: 'fundamental', 
            title: 'Fundamental View', 
            icon: ShieldCheckIcon, 
            content: sections.fundamental,
            color: 'green'
          },
          { 
            id: 'catalysts', 
            title: 'Market Catalysts', 
            icon: InformationCircleIcon, 
            content: sections.catalysts,
            color: 'purple'
          },
          { 
            id: 'risks', 
            title: 'Risk Assessment', 
            icon: ExclamationTriangleIcon, 
            content: sections.risks,
            color: 'orange'
          }
        ].map(({ id, title, icon: Icon, content, color }) => {
          if (!content) return null;
          
          const isExpanded = expandedSection === id;
          
          return (
            <div key={id} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpandedSection(isExpanded ? null : id)}
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-${color}-100 dark:bg-${color}-900`}>
                    <Icon className={`w-5 h-5 text-${color}-600 dark:text-${color}-400`} />
                  </div>
                  <span className="font-medium text-gray-900 dark:text-white">{title}</span>
                </div>
                <ArrowRightIcon 
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    isExpanded ? 'rotate-90' : ''
                  }`} 
                />
              </button>
              
              {isExpanded && (
                <div className="px-6 py-4 bg-white dark:bg-gray-900">
                  <div className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {content}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Full Analysis (fallback) */}
      {!sections.technical && !sections.fundamental && (
        <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6">
          <h4 className="font-medium text-gray-900 dark:text-white mb-4">Complete Analysis</h4>
          <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {analysis.reasoning}
          </div>
        </div>
      )}

      {/* Trust Indicators */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Live Data</span>
          </div>
          <div className="flex items-center space-x-2">
            <ShieldCheckIcon className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600 dark:text-gray-400">AI Verified</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getRiskColor(analysis.riskLevel)}`}>
              {analysis.riskLevel.toUpperCase()} RISK
            </span>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Analysis ID: {symbol}-{new Date(lastUpdated).getTime().toString().slice(-6)}
        </div>
      </div>
    </div>
  );
} 