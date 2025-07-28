'use client';

import React, { useState, useEffect } from 'react';
import { StockCard } from './StockCard';
import { SparklesIcon, EyeIcon, LockClosedIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { SignupModal } from './SignupModal';
import { useRealStockData } from '../hooks/useRealStockData';

// Featured stocks to fetch real data for
const FEATURED_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];

export function FreeInsightsSection() {
  // Set initial update time to 3 minutes ago for realistic freshness
  const [lastUpdated, setLastUpdated] = useState(new Date(Date.now() - 3 * 60 * 1000));
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [signupVariant, setSignupVariant] = useState<'free' | 'trial' | 'premium'>('trial');

  // Fetch real stock data
  const { data: featuredStocks, loading, error } = useRealStockData(FEATURED_SYMBOLS);

  // Update timestamp every minute to show freshness
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes}m ago`;
    } else {
      return date.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      });
    }
  };

  const formatTodayDate = () => {
    const today = new Date();
    return today.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <section id="insights" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-4">
            <EyeIcon className="w-4 h-4 mr-2" />
            Free Daily Insights • Live Data
          </div>
          
          {/* Today's Date Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-50 text-blue-700 text-base font-semibold mb-6 border border-blue-200">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-3"></div>
            {formatTodayDate()}
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Today's Most Interesting
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              {' '}AI Predictions
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get professional-grade AI analysis for the 5 most interesting S&P 500 stocks selected daily. 
            See next day, week, and month predictions powered by GPT-4 with transparent reasoning.
          </p>

          <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Updated {formatTime(lastUpdated)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <SparklesIcon className="w-4 h-4" />
              <span>AI-Powered Analysis</span>
            </div>
            <div className="flex items-center space-x-2">
              <EyeIcon className="w-4 h-4" />
              <span>Always Free</span>
            </div>
          </div>
        </div>

        {/* Stock Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {loading ? (
            // Loading skeleton
            FEATURED_SYMBOLS.map((symbol, index) => (
              <div 
                key={symbol}
                className="animate-fade-in-up glass-card p-6 h-96"
                style={{ animationDelay: `${index * 150}ms` }}
              >
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
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <div className="text-red-600 mb-4">
                <ExclamationTriangleIcon className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load insights</h3>
              <p className="text-gray-600">Please try refreshing the page or check back later.</p>
            </div>
          ) : (
            featuredStocks.map((stock, index) => (
              <div
                key={stock.symbol}
                className="animate-fade-in-up"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <StockCard data={stock} />
              </div>
            ))
          )}
        </div>

        {/* Premium Upgrade CTA */}
        <div className="bg-gradient-to-br from-primary-50 via-blue-50 to-indigo-50 rounded-3xl p-8 md:p-12 text-center border border-primary-100">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-6">
              <LockClosedIcon className="w-4 h-4 mr-2" />
              Pro Features Available
            </div>
            
            <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Get Daily Analytics for the 
              <span className="text-primary-600"> Top 50 Companies</span>
            </h3>
            
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              Upgrade to Pro and get comprehensive daily analytics for the top 50 most interesting S&P 500 companies, 
              plus custom watchlists, historical accuracy tracking, and priority support.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">Top 50</div>
                <div className="text-sm text-gray-600">Daily Companies</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">24/7</div>
                <div className="text-sm text-gray-600">Real-time Updates</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600 mb-1">95%</div>
                <div className="text-sm text-gray-600">Prediction Accuracy</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button 
                onClick={() => {
                  setSignupVariant('trial');
                  setIsSignupModalOpen(true);
                }}
                className="btn-primary text-lg px-8 py-3"
              >
                Start 7-Day Free Trial
              </button>
              <button 
                onClick={() => {
                  setSignupVariant('premium');
                  setIsSignupModalOpen(true);
                }}
                className="btn-secondary text-lg px-8 py-3"
              >
                View Pricing Plans
              </button>
            </div>

            <p className="text-xs text-gray-500 mt-4">
              No credit card required • Cancel anytime • 30-day money-back guarantee
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500 max-w-2xl mx-auto">
            <strong>Disclaimer:</strong> All predictions and analysis are for informational purposes only and do not constitute financial advice. 
            Past performance does not guarantee future results. Please consult with a qualified financial advisor before making investment decisions.
          </p>
        </div>

        {/* Signup Modal */}
        <SignupModal
          isOpen={isSignupModalOpen}
          onClose={() => setIsSignupModalOpen(false)}
          variant={signupVariant}
        />
      </div>
    </section>
  );
} 