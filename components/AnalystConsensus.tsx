'use client';

import React from 'react';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline';

interface AnalystConsensusProps {
  symbol: string;
  currentPrice: number;
  targets: {
    high: number;
    average: number;
    low: number;
    analystCount?: number;
  };
  lastUpdated: string;
}

export function AnalystConsensus({ symbol, currentPrice, targets, lastUpdated }: AnalystConsensusProps) {
  const { high, average, low, analystCount = 0 } = targets;
  
  // Calculate percentages for the bar chart
  const range = high - low;
  const avgPosition = range > 0 ? ((average - low) / range) * 100 : 50;
  const currentPosition = range > 0 ? ((currentPrice - low) / range) * 100 : 50;
  
  // Calculate upside/downside
  const upside = ((average - currentPrice) / currentPrice) * 100;
  const isPositive = upside > 0;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Analyst Consensus
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {analystCount > 0 ? `${analystCount} analysts` : 'Price targets'} • {symbol}
          </p>
        </div>
        <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium ${
          isPositive 
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {isPositive ? (
            <ArrowTrendingUpIcon className="w-4 h-4" />
          ) : (
            <ArrowTrendingDownIcon className="w-4 h-4" />
          )}
          <span>{isPositive ? '+' : ''}{upside.toFixed(1)}%</span>
        </div>
      </div>

      {/* Price Targets */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Low</div>
          <div className="text-lg font-bold text-red-600 dark:text-red-400">
            {formatCurrency(low)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Average</div>
          <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(average)}
          </div>
        </div>
        <div className="text-center">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">High</div>
          <div className="text-lg font-bold text-green-600 dark:text-green-400">
            {formatCurrency(high)}
          </div>
        </div>
      </div>

      {/* Horizontal Bar Chart */}
      <div className="relative mb-6">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
          Price Range Visualization
        </div>
        
        {/* Bar background */}
        <div className="relative h-8 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
          {/* Gradient bar representing the range */}
          <div className="absolute inset-0 bg-gradient-to-r from-red-200 via-blue-200 to-green-200 dark:from-red-900/40 dark:via-blue-900/40 dark:to-green-900/40"></div>
          
          {/* Current price marker */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-gray-900 dark:bg-white rounded-full"
            style={{ left: `${Math.max(0, Math.min(100, currentPosition))}%` }}
            title={`Current: ${formatCurrency(currentPrice)}`}
          >
            <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-gray-900 dark:text-white whitespace-nowrap">
              Current
            </div>
          </div>
          
          {/* Average target marker */}
          <div 
            className="absolute top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-400 rounded-full"
            style={{ left: `${Math.max(0, Math.min(100, avgPosition))}%` }}
            title={`Target: ${formatCurrency(average)}`}
          >
            <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-blue-600 dark:text-blue-400 whitespace-nowrap">
              Target
            </div>
          </div>
        </div>

        {/* Scale labels */}
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-8">
          <span>{formatCurrency(low)}</span>
          <span>{formatCurrency(high)}</span>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
        <div className="text-sm text-gray-600 dark:text-gray-300">
          <strong>Current Price:</strong> {formatCurrency(currentPrice)}
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          <strong>Analyst Target:</strong> {formatCurrency(average)} 
          <span className={`ml-2 font-medium ${
            isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            ({isPositive ? '+' : ''}{upside.toFixed(1)}% {isPositive ? 'upside' : 'downside'})
          </span>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">
          Source: FMP price-target-consensus API • Last update {getTimeAgo(lastUpdated)}
        </div>
      </div>
    </div>
  );
} 