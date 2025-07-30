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
  ArrowRightIcon,
  ChevronDownIcon
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
    return changePercent >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/20 dark:border-green-800';
    if (confidence >= 60) return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800';
    return 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-800';
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'text-green-700 bg-green-50 border-green-200 dark:text-green-300 dark:bg-green-900/20 dark:border-green-800';
      case 'medium': return 'text-yellow-700 bg-yellow-50 border-yellow-200 dark:text-yellow-300 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'high': return 'text-red-700 bg-red-50 border-red-200 dark:text-red-300 dark:bg-red-900/20 dark:border-red-800';
      default: return 'text-gray-700 bg-gray-50 border-gray-200 dark:text-gray-300 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  // Parse numbered sections from AI reasoning (1., 2., 3., etc.)
  const parseAnalysisSections = (reasoning: string) => {
    const sections = {
      predictions: '',
      technical: '',
      fundamental: '',
      catalysts: '',
      risks: ''
    };

    // Split by numbered sections and clean up
    const numberedSections = reasoning.split(/\n\n(?=\d+\.)/);
    
    numberedSections.forEach(section => {
      const trimmedSection = section.trim();
      
      if (trimmedSection.match(/1\.\s*PRICE PREDICTIONS/i)) {
        sections.predictions = trimmedSection.replace(/1\.\s*PRICE PREDICTIONS[^:]*:?\s*/i, '').trim();
      } else if (trimmedSection.match(/2\.\s*TECHNICAL ANALYSIS/i)) {
        sections.technical = trimmedSection.replace(/2\.\s*TECHNICAL ANALYSIS[^:]*:?\s*/i, '').trim();
      } else if (trimmedSection.match(/3\.\s*FUNDAMENTAL/i)) {
        sections.fundamental = trimmedSection.replace(/3\.\s*FUNDAMENTAL[^:]*:?\s*/i, '').trim();
      } else if (trimmedSection.match(/4\.\s*MARKET CATALYSTS?/i)) {
        sections.catalysts = trimmedSection.replace(/4\.\s*MARKET CATALYSTS?[^:]*:?\s*/i, '').trim();
      } else if (trimmedSection.match(/5\.\s*RISK/i)) {
        sections.risks = trimmedSection.replace(/5\.\s*RISK[^:]*:?\s*/i, '').trim();
      }
    });

    return sections;
  };

  const sections = parseAnalysisSections(analysis.reasoning);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      {/* Header with Apple-style gradient */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 px-8 py-6 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <SparklesIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white">AI Analysis</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Powered by GPT-4 • {analysis.sources.length} data sources</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-full text-sm font-semibold border ${getConfidenceColor(analysis.confidence)}`}>
              {analysis.confidence}% confidence
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
              <ClockIcon className="w-4 h-4" />
              <span>{getTimeAgo(lastUpdated)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 space-y-8">
        {/* Price Predictions - Apple-style grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: '24H Target', period: 'nextDay', icon: ClockIcon },
            { label: '1W Target', period: 'nextWeek', icon: CalendarDaysIcon },
            { label: '1M Target', period: 'nextMonth', icon: ChartBarIcon }
          ].map(({ label, period, icon: Icon }) => {
            const prediction = predictions[period as keyof typeof predictions];
            const TrendIcon = getTrendIcon(prediction.changePercent);
            
            return (
              <div key={period} className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-white dark:bg-gray-700 rounded-xl flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                  </div>
                  <TrendIcon className={`w-6 h-6 ${getTrendColor(prediction.changePercent)}`} />
                </div>
                
                <div className="space-y-3">
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(prediction.price)}
                  </div>
                  <div className={`text-lg font-semibold ${getTrendColor(prediction.changePercent)}`}>
                    {formatPercent(prediction.changePercent)}
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-700 ease-out ${
                        prediction.confidence >= 80 ? 'bg-green-500' : 
                        prediction.confidence >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {prediction.confidence}% confidence
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Analysis Sections - Apple-style expandable cards */}
        <div className="space-y-3">
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
              <div key={id} className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition-all duration-200">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : id)}
                  className="w-full px-6 py-5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm ${
                      color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      color === 'green' ? 'bg-green-100 dark:bg-green-900/30' :
                      color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' :
                      'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        color === 'green' ? 'text-green-600 dark:text-green-400' :
                        color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                        'text-orange-600 dark:text-orange-400'
                      }`} />
                    </div>
                    <span className="font-semibold text-gray-900 dark:text-white text-lg">{title}</span>
                  </div>
                  <ChevronDownIcon 
                    className={`w-6 h-6 text-gray-400 transition-transform duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-300 ${
                      isExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {isExpanded && (
                  <div className="px-6 py-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800">
                    <div className="prose prose-gray dark:prose-invert max-w-none">
                      <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {content}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Fallback for unparsed content */}
        {!sections.technical && !sections.fundamental && !sections.catalysts && !sections.risks && (
          <div className="border border-gray-200 dark:border-gray-700 rounded-2xl p-6 bg-gray-50 dark:bg-gray-800/50">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4 text-lg">Complete Analysis</h4>
            <div className="prose prose-gray dark:prose-invert max-w-none">
              <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                {analysis.reasoning}
              </div>
            </div>
          </div>
        )}

        {/* Trust Indicators - Apple-style footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Live Data</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">AI Verified</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border ${getRiskColor(analysis.riskLevel)}`}>
                {analysis.riskLevel.toUpperCase()} RISK
              </span>
            </div>
          </div>
          
          <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
            ID: {symbol}-{new Date(lastUpdated).getTime().toString().slice(-6)}
          </div>
        </div>
      </div>
    </div>
  );
} 