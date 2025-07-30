'use client';

import React, { useState, useEffect } from 'react';
import { ClientOnlyStockCards } from './ClientOnlyStockCards';
import { FeedbackForm } from './FeedbackForm';
import { 
  CalendarDaysIcon, 
  ClockIcon, 
  ArrowPathIcon,
  SparklesIcon,
  CheckCircleIcon 
} from '@heroicons/react/24/outline';

export function FreeInsightsSection() {
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
  const [featuredCompanies, setFeaturedCompanies] = useState<string[]>([]);
  const [lastRotation, setLastRotation] = useState<string>('');
  const [nextRotation, setNextRotation] = useState<string>('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for real-time calculations
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Fetch today's featured companies and rotation info
  useEffect(() => {
    const fetchRotationInfo = async () => {
      try {
        const response = await fetch('/api/scheduler/status');
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            setFeaturedCompanies(result.data.currentFeaturedCompanies || []);
            setLastRotation(result.data.lastRun || new Date().toISOString());
            
            // Calculate next rotation (next day at 6 AM EST)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            tomorrow.setHours(6, 0, 0, 0); // 6 AM EST
            setNextRotation(tomorrow.toISOString());
          }
        }
      } catch (error) {
        console.log('Could not fetch rotation info:', error);
        // Fallback to default companies
        setFeaturedCompanies(['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']);
        setLastRotation(new Date().toISOString());
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(6, 0, 0, 0);
        setNextRotation(tomorrow.toISOString());
      }
    };

    fetchRotationInfo();
  }, []);

  const formatTimeUntilNext = () => {
    if (!nextRotation) return '24 hours';
    
    const next = new Date(nextRotation);
    const diffMs = next.getTime() - currentTime.getTime();
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));
    
    if (diffMs <= 0) return 'Soon';
    if (diffHours < 1) return `${diffMinutes}min`;
    if (diffHours >= 24) return '24 hours';
    return `${diffHours}h`;
  };

  const formatLastUpdated = () => {
    if (!lastRotation) return 'Today';
    
    const updated = new Date(lastRotation);
    const diffMs = currentTime.getTime() - updated.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    
    if (diffMinutes < 5) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}min ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return 'Today';
  };

  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header with Smart Algorithm Feature */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 px-6 py-3 rounded-full mb-6 border border-blue-200 dark:border-blue-700">
            <ArrowPathIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-800 dark:text-blue-200">
              Smart Algorithm Selects 5 Companies Every 24 Hours
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Today's Featured Companies
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Fresh AI-powered analysis for a curated selection of S&P 500 stocks. 
            <span className="font-semibold text-blue-600 dark:text-blue-400"> New companies every day.</span>
          </p>
        </div>

        {/* Apple-style Daily Rotation Indicator */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 rounded-3xl p-6 border border-blue-100 dark:border-gray-700 shadow-lg backdrop-blur-sm">
            
            {/* Header with rotation icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <ArrowPathIcon className="w-5 h-5 text-white" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Daily Company Rotation
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Sector-balanced selection from 30-company pool
                  </p>
                </div>
              </div>
            </div>

            {/* Today's Companies */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Current Companies */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-3">
                  <CheckCircleIcon className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">Today's Selection</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {featuredCompanies.map((symbol, index) => (
                    <span
                      key={symbol}
                      className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-semibold rounded-full shadow-sm"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {symbol}
                    </span>
                  ))}
                </div>
              </div>

              {/* Last Updated */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-3">
                  <ClockIcon className="w-5 h-5 text-blue-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">Last Updated</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatLastUpdated()}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Data refreshed daily at 6 AM EST
                </p>
              </div>

              {/* Next Rotation */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2 mb-3">
                  <CalendarDaysIcon className="w-5 h-5 text-purple-500" />
                  <span className="font-semibold text-gray-900 dark:text-white">Next Refresh</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatTimeUntilNext()}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  New companies selected automatically
                </p>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <SparklesIcon className="w-4 h-4 text-blue-500" />
                <span>30-company rotation pool</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Real-time market data</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <ArrowPathIcon className="w-4 h-4 text-purple-500" />
                <span>Sector-balanced selection</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Cards with improved responsive layout */}
        <div className="max-w-6xl mx-auto">
          <ClientOnlyStockCards />
        </div>

        {/* Feedback Call to Action */}
        <div className="text-center mt-12" id="feedback">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Help Us Build Something Amazing
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              We're building the ultimate trading intelligence platform. Your feedback helps us understand what features matter most to serious traders like you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => setIsFeedbackFormOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                💬 Share Your Feedback
              </button>
              <button 
                onClick={() => setIsFeedbackFormOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                📝 Quick Feedback Form
              </button>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
              💡 Ideas for new features? Missing data? Found a bug? We want to hear it all!
            </p>
          </div>
        </div>

        {/* Feedback Form Modal */}
        <FeedbackForm
          isOpen={isFeedbackFormOpen}
          onClose={() => setIsFeedbackFormOpen(false)}
        />
      </div>
    </section>
  );
} 