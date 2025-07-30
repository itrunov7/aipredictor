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
    if (confidence >= 80) return 'text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/20';
    if (confidence >= 60) return 'text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/20';
    return 'text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/20';
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low': return 'text-green-800 bg-green-100 dark:text-green-200 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-800 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/20';
      case 'high': return 'text-red-800 bg-red-100 dark:text-red-200 dark:bg-red-900/20';
      default: return 'text-gray-800 bg-gray-100 dark:text-gray-200 dark:bg-gray-900/20';
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
    <div className="bg-white dark:bg-black rounded-[28px] shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_8px_30px_rgb(255,255,255,0.08)] border border-gray-200/20 dark:border-gray-800/50 overflow-hidden backdrop-blur-xl">
      {/* Apple-style minimal header */}
      <div className="px-10 py-8 bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/50 border-b border-gray-200/30 dark:border-gray-800/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-5">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 via-purple-500 to-blue-600 rounded-[20px] flex items-center justify-center shadow-lg shadow-blue-500/25">
              <SparklesIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-[28px] font-semibold text-gray-900 dark:text-white leading-tight tracking-tight">AI Analysis</h3>
              <p className="text-[15px] text-gray-600 dark:text-gray-400 mt-1">Powered by GPT-4 • {analysis.sources.length} data sources</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-5 py-2.5 rounded-full text-[13px] font-semibold ${getConfidenceColor(analysis.confidence)}`}>
              {analysis.confidence}% confidence
            </div>
            <div className="flex items-center space-x-2 text-[13px] text-gray-500 dark:text-gray-400">
              <ClockIcon className="w-4 h-4" />
              <span>{getTimeAgo(lastUpdated)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-10 py-8 space-y-10">
        {/* Apple-style prediction cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          {[
            { label: '24H Target', period: 'nextDay', icon: ClockIcon },
            { label: '1W Target', period: 'nextWeek', icon: CalendarDaysIcon },
            { label: '1M Target', period: 'nextMonth', icon: ChartBarIcon }
          ].map(({ label, period, icon: Icon }) => {
            const prediction = predictions[period as keyof typeof predictions];
            const TrendIcon = getTrendIcon(prediction.changePercent);
            
            return (
              <div key={period} className="bg-gray-50/80 dark:bg-gray-900/40 rounded-[20px] p-5 transition-all duration-300 hover:shadow-lg hover:shadow-gray-200/50 dark:hover:shadow-gray-800/50 hover:bg-gray-100/80 dark:hover:bg-gray-800/60 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-white dark:bg-gray-800 rounded-[12px] flex items-center justify-center shadow-sm">
                      <Icon className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <span className="text-[14px] font-semibold text-gray-700 dark:text-gray-300">{label}</span>
                  </div>
                  <TrendIcon className={`w-5 h-5 ${getTrendColor(prediction.changePercent)}`} />
                </div>
                
                <div className="space-y-4">
                  <div className="text-[26px] font-semibold text-gray-900 dark:text-white leading-none tracking-tight">
                    {formatCurrency(prediction.price)}
                  </div>
                  <div className={`text-[16px] font-semibold ${getTrendColor(prediction.changePercent)}`}>
                    {formatPercent(prediction.changePercent)}
                  </div>
                  <div className="w-full bg-gray-200/70 dark:bg-gray-700/70 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full transition-all duration-700 ease-out ${
                        prediction.confidence >= 80 ? 'bg-green-500 shadow-green-500/30' : 
                        prediction.confidence >= 60 ? 'bg-yellow-500 shadow-yellow-500/30' : 'bg-red-500 shadow-red-500/30'
                      } shadow-lg`}
                      style={{ width: `${prediction.confidence}%` }}
                    />
                  </div>
                  <div className="text-[13px] font-medium text-gray-600 dark:text-gray-400">
                    {prediction.confidence}% confidence
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Apple-style analysis sections */}
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
              <div key={id} className="bg-white dark:bg-gray-900/50 rounded-[20px] overflow-hidden shadow-sm border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
                <button
                  onClick={() => setExpandedSection(isExpanded ? null : id)}
                  className="w-full px-7 py-6 bg-gray-50/50 dark:bg-gray-800/30 hover:bg-gray-100/70 dark:hover:bg-gray-800/50 transition-all duration-200 flex items-center justify-between group"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 rounded-[16px] flex items-center justify-center shadow-sm backdrop-blur-sm ${
                      color === 'blue' ? 'bg-blue-100/80 dark:bg-blue-900/40' :
                      color === 'green' ? 'bg-green-100/80 dark:bg-green-900/40' :
                      color === 'purple' ? 'bg-purple-100/80 dark:bg-purple-900/40' :
                      'bg-orange-100/80 dark:bg-orange-900/40'
                    }`}>
                      <Icon className={`w-6 h-6 ${
                        color === 'blue' ? 'text-blue-600 dark:text-blue-400' :
                        color === 'green' ? 'text-green-600 dark:text-green-400' :
                        color === 'purple' ? 'text-purple-600 dark:text-purple-400' :
                        'text-orange-600 dark:text-orange-400'
                      }`} />
                    </div>
                    <span className="text-[19px] font-semibold text-gray-900 dark:text-white">{title}</span>
                  </div>
                  <ChevronDownIcon 
                    className={`w-6 h-6 text-gray-400 transition-transform duration-300 group-hover:text-gray-600 dark:group-hover:text-gray-300 ${
                      isExpanded ? 'rotate-180' : ''
                    }`} 
                  />
                </button>
                
                {isExpanded && (
                  <div className="px-7 py-6 bg-white dark:bg-gray-900/70 border-t border-gray-200/30 dark:border-gray-800/30">
                    <div className="text-[16px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                      {content}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Fallback for unparsed content */}
        {!sections.technical && !sections.fundamental && !sections.catalysts && !sections.risks && (
          <div className="bg-gray-50/80 dark:bg-gray-900/40 rounded-[20px] p-7 border border-gray-200/50 dark:border-gray-700/50">
            <h4 className="text-[19px] font-semibold text-gray-900 dark:text-white mb-5">Complete Analysis</h4>
            <div className="text-[16px] text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
              {analysis.reasoning}
            </div>
          </div>
        )}

        {/* Apple-style trust indicators footer */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200/30 dark:border-gray-700/30">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/40" />
              <span className="text-[14px] font-medium text-gray-600 dark:text-gray-400">Live Data</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheckIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span className="text-[14px] font-medium text-gray-600 dark:text-gray-400">AI Verified</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className={`px-3 py-1.5 rounded-[12px] text-[12px] font-bold ${getRiskColor(analysis.riskLevel)}`}>
                {analysis.riskLevel.toUpperCase()} RISK
              </span>
            </div>
          </div>
          
          <div className="text-[12px] text-gray-500 dark:text-gray-400 font-mono opacity-60">
            ID: {symbol}-{new Date(lastUpdated).getTime().toString().slice(-6)}
          </div>
        </div>
      </div>
    </div>
  );
} 