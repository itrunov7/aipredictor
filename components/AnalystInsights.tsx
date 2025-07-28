'use client';

import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface PriceTarget {
  symbol: string;
  analystName: string;
  priceTarget: number;
  analystCompany: string;
  publishedDate: string;
  newsURL?: string;
}

interface UpgradeDowngrade {
  symbol: string;
  newGrade: string;
  previousGrade: string;
  gradingCompany: string;
  action: string;
  publishedDate: string;
  newsURL?: string;
}

interface PriceTargetSummary {
  symbol: string;
  targetHigh: number;
  targetLow: number;
  targetMean: number;
  targetMedian: number;
  analystCount: number;
  lastUpdated: string;
}

interface AnalystInsightsProps {
  symbol: string;
  currentPrice: number;
  priceTargets: PriceTarget[];
  upgradesDowngrades: UpgradeDowngrade[];
  summary?: PriceTargetSummary;
  compact?: boolean;
}

export function AnalystInsights({
  symbol,
  currentPrice,
  priceTargets,
  upgradesDowngrades,
  summary,
  compact = false
}: AnalystInsightsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercent = (percent: number) => {
    const sign = percent >= 0 ? '+' : '';
    return `${sign}${percent.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return 'Recent';
    }
  };

  const getActionIcon = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('upgrade') || actionLower.includes('initiated')) {
      return <ArrowTrendingUpIcon className="w-4 h-4 text-green-600" />;
    } else if (actionLower.includes('downgrade')) {
      return <ArrowTrendingDownIcon className="w-4 h-4 text-red-600" />;
    }
    return <ChartBarIcon className="w-4 h-4 text-gray-600" />;
  };

  const getActionColor = (action: string) => {
    const actionLower = action.toLowerCase();
    if (actionLower.includes('upgrade') || actionLower.includes('initiated')) {
      return 'text-green-600 bg-green-50 border-green-200';
    } else if (actionLower.includes('downgrade')) {
      return 'text-red-600 bg-red-50 border-red-200';
    }
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getGradeColor = (grade: string) => {
    const gradeLower = grade.toLowerCase();
    if (gradeLower.includes('buy') || gradeLower.includes('strong')) {
      return 'text-green-600 bg-green-50';
    } else if (gradeLower.includes('sell')) {
      return 'text-red-600 bg-red-50';
    } else if (gradeLower.includes('hold')) {
      return 'text-yellow-600 bg-yellow-50';
    }
    return 'text-gray-600 bg-gray-50';
  };

  if (compact) {
    return (
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Analyst Consensus</h3>
          <UserGroupIcon className="w-5 h-5 text-gray-400" />
        </div>
        
        {summary ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatCurrency(summary.targetMean)}
              </div>
              <div className={`text-sm font-medium ${
                summary.targetMean > currentPrice ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercent(((summary.targetMean / currentPrice) - 1) * 100)} potential
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-center">
                <div className="text-gray-500">Range</div>
                <div className="font-medium">
                  {formatCurrency(summary.targetLow)} - {formatCurrency(summary.targetHigh)}
                </div>
              </div>
              <div className="text-center">
                <div className="text-gray-500">Analysts</div>
                <div className="font-medium">{summary.analystCount}</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="text-gray-400 text-sm">
              No analyst data available
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Price Target Summary */}
      {summary && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Price Target Consensus</h2>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <UserGroupIcon className="w-4 h-4" />
              <span>{summary.analystCount} analysts</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">
                {formatCurrency(summary.targetMean)}
              </div>
              <div className="text-sm text-gray-500 mb-2">Average Target</div>
              <div className={`text-lg font-semibold ${
                summary.targetMean > currentPrice ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatPercent(((summary.targetMean / currentPrice) - 1) * 100)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {formatCurrency(summary.targetHigh)}
              </div>
              <div className="text-sm text-gray-500 mb-2">Highest Target</div>
              <div className="text-sm text-green-600 font-medium">
                {formatPercent(((summary.targetHigh / currentPrice) - 1) * 100)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 mb-1">
                {formatCurrency(summary.targetLow)}
              </div>
              <div className="text-sm text-gray-500 mb-2">Lowest Target</div>
              <div className="text-sm text-red-600 font-medium">
                {formatPercent(((summary.targetLow / currentPrice) - 1) * 100)}
              </div>
            </div>

            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 mb-1">
                {formatCurrency(summary.targetMedian)}
              </div>
              <div className="text-sm text-gray-500 mb-2">Median Target</div>
              <div className="text-sm text-primary-600 font-medium">
                {formatPercent(((summary.targetMedian / currentPrice) - 1) * 100)}
              </div>
            </div>
          </div>

          {/* Price Range Visualization */}
          <div className="mt-6">
            <div className="text-sm text-gray-500 mb-2">Price Range</div>
            <div className="relative h-2 bg-gray-200 rounded-full">
              <div 
                className="absolute h-2 bg-gradient-to-r from-red-400 to-green-400 rounded-full"
                style={{ 
                  left: '0%', 
                  width: '100%' 
                }}
              />
              <div 
                className="absolute w-3 h-3 bg-gray-900 rounded-full transform -translate-y-0.5"
                style={{ 
                  left: `${Math.min(95, Math.max(5, ((currentPrice - summary.targetLow) / (summary.targetHigh - summary.targetLow)) * 100))}%`,
                  transform: 'translateX(-50%) translateY(-25%)'
                }}
                title={`Current: ${formatCurrency(currentPrice)}`}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{formatCurrency(summary.targetLow)}</span>
              <span>Current: {formatCurrency(currentPrice)}</span>
              <span>{formatCurrency(summary.targetHigh)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Rating Changes */}
      {upgradesDowngrades.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Rating Changes</h2>
            <div className="text-sm text-gray-500">
              {upgradesDowngrades.length} recent action{upgradesDowngrades.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-4">
            {upgradesDowngrades.slice(0, 8).map((action, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    {getActionIcon(action.action)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">{action.gradingCompany}</div>
                    <div className="text-sm text-gray-600">{formatDate(action.publishedDate)}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getActionColor(action.action)}`}>
                      {action.action}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={`px-2 py-1 rounded text-xs ${getGradeColor(action.previousGrade)}`}>
                        {action.previousGrade}
                      </span>
                      <span className="text-gray-400">→</span>
                      <span className={`px-2 py-1 rounded text-xs ${getGradeColor(action.newGrade)}`}>
                        {action.newGrade}
                      </span>
                    </div>
                  </div>
                  
                  {action.newsURL && (
                    <a
                      href={action.newsURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-800 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {upgradesDowngrades.length > 8 && (
            <div className="text-center mt-4">
              <button className="btn-secondary">
                View {upgradesDowngrades.length - 8} More Actions
              </button>
            </div>
          )}
        </div>
      )}

      {/* Individual Price Targets */}
      {priceTargets.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Individual Price Targets</h2>
            <div className="text-sm text-gray-500">
              {priceTargets.length} target{priceTargets.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="space-y-3">
            {priceTargets.slice(0, 10).map((target, index) => {
              const upside = ((target.priceTarget / currentPrice) - 1) * 100;
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{target.analystCompany}</div>
                    <div className="text-sm text-gray-600">{target.analystName}</div>
                    <div className="text-xs text-gray-500">{formatDate(target.publishedDate)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {formatCurrency(target.priceTarget)}
                    </div>
                    <div className={`text-sm font-medium ${
                      upside >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {formatPercent(upside)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {priceTargets.length > 10 && (
            <div className="text-center mt-4">
              <button className="btn-secondary">
                View {priceTargets.length - 10} More Targets
              </button>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {priceTargets.length === 0 && upgradesDowngrades.length === 0 && !summary && (
        <div className="glass-card p-6 text-center">
          <div className="text-gray-400 mb-4">
            <UserGroupIcon className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Analyst Data Available</h3>
          <p className="text-gray-500 text-sm">
            Analyst price targets and rating changes will appear here when available from our data sources.
          </p>
        </div>
      )}
    </div>
  );
} 