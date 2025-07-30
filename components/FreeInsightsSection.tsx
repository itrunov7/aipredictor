'use client';

import React, { useState } from 'react';
import { ClientOnlyStockCards } from './ClientOnlyStockCards';
import { FeedbackForm } from './FeedbackForm';

export function FreeInsightsSection() {
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
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