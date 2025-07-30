'use client';

import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  ChevronRightIcon, 
  XMarkIcon,
  ArrowTopRightOnSquareIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ClockIcon,
  ChartBarIcon,
  NewspaperIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { EnhancedAIAnalysis } from './EnhancedAIAnalysis';

interface Source {
  type: 'news' | 'analyst' | 'technical' | 'earnings' | 'economic' | 'sentiment';
  title: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  url: string;
  source: string;
  date: string;
}

interface PredictionData {
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
    sources: Source[];
  };
  source: string;
  lastUpdated: string;
}

interface EnhancedStockCardProps {
  data: PredictionData;
  variant?: 'featured' | 'compact';
  showActions?: boolean;
}

// Source type icons mapping
const sourceIcons = {
  news: NewspaperIcon,
  analyst: UserGroupIcon,
  technical: ChartBarIcon,
  earnings: CurrencyDollarIcon,
  economic: DocumentTextIcon,
  sentiment: ArrowTrendingUpIcon
};

// Source type colors
const sourceColors = {
  news: 'bg-blue-100 text-blue-700 border-blue-200',
  analyst: 'bg-purple-100 text-purple-700 border-purple-200',
  technical: 'bg-orange-100 text-orange-700 border-orange-200',
  earnings: 'bg-green-100 text-green-700 border-green-200',
  economic: 'bg-gray-100 text-gray-700 border-gray-200',
  sentiment: 'bg-pink-100 text-pink-700 border-pink-200'
};

// FMP Endpoint mapping
const fmpEndpoints = {
  'FMP Real-time Quote': '/api/v3/quote/{symbol}',
  'FMP Historical Data': '/api/v3/historical-price-full/{symbol}?serietype=line&timeseries=365',
  'FMP Technical Indicators': '/api/v3/technical_indicator/daily/{symbol}?type=rsi&period=14',
  'FMP Price Target Consensus': '/api/v4/price-target-consensus?symbol={symbol}',
  'FMP Upgrades/Downgrades': '/api/v4/upgrades-downgrades?symbol={symbol}&limit=10',
  'FMP Company News': '/api/v3/stock_news?tickers={symbol}&limit=50',
  'FMP Earnings Transcript': '/api/v3/earning_call_transcript/{symbol}',
  'FMP Earnings Calendar': '/api/v3/earning_calendar?symbol={symbol}&limit=1',
  'FMP Financial Statements': '/api/v3/income-statement/{symbol}?limit=1',
  'FMP SEC Filings': '/api/v4/rss_feed?symbol={symbol}&limit=5'
};

export function EnhancedStockCard({ data, variant = 'featured', showActions = false }: EnhancedStockCardProps) {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [selectedJsonData, setSelectedJsonData] = useState<any>(null);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isAnalysisExpanded, setIsAnalysisExpanded] = useState(false);

  if (!data) {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-96 animate-pulse">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded-lg"></div>
          <div className="h-8 bg-gray-200 rounded-lg"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

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

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  // Group sources by type for badges
  const sourceTypeCounts = data.analysis.sources.reduce((acc, source) => {
    acc[source.type] = (acc[source.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // No additional preprocessing needed for AI Analysis component

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 sm:p-6 lg:p-8 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
        {/* Header with source drawer trigger */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="text-2xl font-semibold text-gray-900 tracking-tight">{data.name}</h3>
              <button
                onClick={() => setIsSourcesOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-50 transition-colors group"
                title="View data sources"
              >
                <ChevronRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>
            </div>
            <p className="text-sm font-medium text-gray-500 tracking-wide">{data.symbol}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-gray-900 tracking-tight">
              {formatCurrency(data.currentPrice)}
            </div>
            <div className={`flex items-center space-x-1 text-sm font-medium ${
              data.changePercent >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
                           {data.changePercent >= 0 ? (
               <ArrowTrendingUpIcon className="w-4 h-4" />
             ) : (
               <ArrowTrendingDownIcon className="w-4 h-4" />
             )}
              <span>{formatPercent(data.changePercent)}</span>
            </div>
          </div>
        </div>

        {/* Source badges */}
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(sourceTypeCounts).map(([type, count]) => {
            const IconComponent = sourceIcons[type as keyof typeof sourceIcons];
            return (
              <div
                key={type}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
                  sourceColors[type as keyof typeof sourceColors]
                } transition-colors hover:scale-105`}
                title={`${count} ${type} source${count > 1 ? 's' : ''}`}
              >
                <IconComponent className="w-3.5 h-3.5" />
                <span className="capitalize">{type}</span>
                <span className="font-semibold">{count}</span>
              </div>
            );
          })}
        </div>

                {/* Enhanced AI Analysis - Beautiful Apple-inspired section */}
        <EnhancedAIAnalysis
          symbol={data.symbol}
          currentPrice={data.currentPrice}
          predictions={data.predictions}
          analysis={data.analysis}
          lastUpdated={data.lastUpdated}
        />

        {/* Analysis Summary */}
        <div className="border-t border-gray-100 pt-6">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">AI Analysis</h4>
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Updated {getTimeAgo(data.lastUpdated)}
              </span>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className={`text-sm text-gray-600 dark:text-gray-300 leading-relaxed transition-all duration-300 ${
              isAnalysisExpanded ? '' : 'line-clamp-3'
            }`}>
              {data.analysis.reasoning}
            </div>
            
            {data.analysis.reasoning.length > 200 && (
              <button
                onClick={() => setIsAnalysisExpanded(!isAnalysisExpanded)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 rounded-sm"
              >
                {isAnalysisExpanded ? 'Show less' : 'Read full analysis'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Sources Drawer */}
      <Transition appear show={isSourcesOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsSourcesOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-500 sm:duration-700"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-500 sm:duration-700"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-2xl">
                    <div className="flex h-full flex-col bg-white shadow-xl">
                      <div className="flex-1 overflow-y-auto px-6 py-8">
                        <div className="flex items-start justify-between mb-8">
                          <div>
                            <Dialog.Title className="text-2xl font-semibold text-gray-900">
                              Data Sources
                            </Dialog.Title>
                            <p className="text-sm text-gray-500 mt-1">
                              {data.symbol} • {data.analysis.sources.length} sources
                            </p>
                          </div>
                          <button
                            type="button"
                            className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            onClick={() => setIsSourcesOpen(false)}
                          >
                            <XMarkIcon className="h-6 w-6" />
                          </button>
                        </div>

                        <div className="space-y-4">
                          {data.analysis.sources.map((source, index) => {
                            const endpoint = fmpEndpoints[source.source as keyof typeof fmpEndpoints] || 'Unknown endpoint';
                            const IconComponent = sourceIcons[source.type];
                            
                            return (
                              <div
                                key={index}
                                className="bg-gray-50 rounded-xl p-6 border border-gray-100"
                              >
                                <div className="flex items-start justify-between mb-4">
                                  <div className="flex items-center space-x-3">
                                    <div className={`p-2 rounded-lg ${sourceColors[source.type]}`}>
                                      <IconComponent className="w-4 h-4" />
                                    </div>
                                    <div>
                                      <h3 className="font-semibold text-gray-900">{source.source}</h3>
                                      <p className="text-sm text-gray-500 capitalize">{source.type} • {source.confidence}% confidence</p>
                                    </div>
                                  </div>
                                  <button
                                    onClick={() => {
                                      setSelectedJsonData({ source, endpoint });
                                      setIsJsonModalOpen(true);
                                    }}
                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                  >
                                    View JSON
                                  </button>
                                </div>
                                
                                <div className="space-y-3">
                                  <div>
                                    <label className="text-xs font-medium text-gray-500">Title</label>
                                    <p className="text-sm text-gray-900">{source.title}</p>
                                  </div>
                                  
                                  <div>
                                    <label className="text-xs font-medium text-gray-500">FMP Endpoint</label>
                                    <code className="block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded mt-1 font-mono">
                                      {endpoint.replace('{symbol}', data.symbol)}
                                    </code>
                                  </div>
                                  
                                  <div className="flex justify-between items-center text-xs text-gray-500">
                                    <span>Fetched {getTimeAgo(source.date)}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                      source.impact === 'positive' ? 'bg-green-100 text-green-700' :
                                      source.impact === 'negative' ? 'bg-red-100 text-red-700' :
                                      'bg-gray-100 text-gray-700'
                                    }`}>
                                      {source.impact}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>

      {/* Raw Data Modal */}
      <Transition appear show={isJsonModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={setIsJsonModalOpen}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white p-8 text-left align-middle shadow-xl transition-all">
                  <div className="flex items-center justify-between mb-6">
                    <Dialog.Title className="text-lg font-semibold text-gray-900">
                      Raw API Response
                    </Dialog.Title>
                    <button
                      onClick={() => setIsJsonModalOpen(false)}
                      className="rounded-lg p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="bg-gray-50 rounded-xl p-4 max-h-96 overflow-auto">
                    <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap">
                      {JSON.stringify(selectedJsonData, null, 2)}
                    </pre>
                  </div>
                  
                  <div className="mt-6 text-xs text-gray-500">
                    Source: Financial Modeling Prep API • Last updated {selectedJsonData?.source?.date ? getTimeAgo(selectedJsonData.source.date) : 'Recently'}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
} 