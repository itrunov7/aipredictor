'use client';

import React from 'react';
import { ClientOnlyStockCards } from './ClientOnlyStockCards';

export function FreeInsightsSection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Today's Free Insights
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            See real AI-powered predictions for top S&P 500 stocks. Each analysis uses 10+ data sources 
            to provide transparent, confidence-scored forecasts.
          </p>
        </div>

        {/* Stock Cards with improved responsive layout */}
        <div className="max-w-6xl mx-auto">
          <ClientOnlyStockCards />
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
              Get Complete Market Coverage
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Access insights for all 500+ S&P stocks, with real-time updates, 
              detailed analysis, and personalized portfolio tracking.
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
              Get Started →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
} 