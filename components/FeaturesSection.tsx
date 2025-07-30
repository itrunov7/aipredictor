'use client';

import React, { useState } from 'react';
import { SparklesIcon, ChartBarIcon, ClockIcon, ShieldCheckIcon, LightBulbIcon, ArrowTrendingUpIcon } from '@heroicons/react/24/outline';
import { FeedbackForm } from './FeedbackForm';

const features = [
  {
    icon: SparklesIcon,
    name: 'AI-Powered Analysis',
    description: 'GPT-4 enhanced predictions analyze news, earnings, analyst opinions, and technical indicators to provide comprehensive insights.',
    highlight: 'OpenAI GPT-4'
  },
  {
    icon: ChartBarIcon,
    name: 'Professional Data Sources',
    description: 'Real-time market data from Financial Modeling Prep, covering all S&P 500 stocks with institutional-grade accuracy.',
    highlight: 'Live Market Data'
  },
  {
    icon: ClockIcon,
    name: 'Daily Fresh Insights',
    description: 'Updated every morning with the most interesting companies selected from the S&P 500, plus predictions for the next day, week, and month.',
    highlight: 'Daily Updates'
  },
  {
    icon: LightBulbIcon,
    name: 'Transparent Reasoning',
    description: 'Every prediction comes with detailed explanations, citing specific news, analyst actions, and market factors.',
    highlight: 'Full Transparency'
  },
  {
    icon: ShieldCheckIcon,
    name: 'Risk Assessment',
    description: 'Comprehensive risk analysis with confidence levels, volatility metrics, and market sentiment evaluation.',
    highlight: 'Risk Management'
  },
  {
    icon: ArrowTrendingUpIcon,
    name: 'Multi-Timeframe Predictions',
    description: 'See price targets for next day, week, and month with confidence intervals for better decision making.',
    highlight: 'Time-Based Analysis'
  }
];

export function FeaturesSection() {
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);

  return (
    <section id="features" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-6">
            <SparklesIcon className="w-4 h-4 mr-2" />
            Advanced AI Technology
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Powerful Features for
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              {' '}Smarter Trading
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our platform combines cutting-edge AI with professional-grade financial data 
            to deliver insights that help you make confident trading decisions.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={feature.name}
              className="glass-card p-8 hover:shadow-xl transition-all duration-300 group animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4 flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                    {feature.highlight}
                  </div>
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom Feedback CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl p-8 border border-green-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Help Us Build the Ultimate Trading Platform
            </h3>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Your feedback shapes our product roadmap. Tell us what features you need most, what's working well, and what could be improved.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => {
                  setIsFeedbackFormOpen(true);
                }}
                className="btn-primary"
              >
                💡 Suggest Features
              </button>
              <button 
                onClick={() => {
                  setIsFeedbackFormOpen(true);
                }}
                className="btn-secondary"
              >
                💬 Send Feedback
              </button>
            </div>
          </div>
        </div>

        {/* Feedback Form */}
        <FeedbackForm
          isOpen={isFeedbackFormOpen}
          onClose={() => setIsFeedbackFormOpen(false)}
        />
      </div>
    </section>
  );
} 