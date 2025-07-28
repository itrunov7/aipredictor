'use client';

import React, { useState } from 'react';
import { CheckIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { SignupModal } from './SignupModal';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Get daily insights for the most interesting stocks',
    features: [
      '5 most interesting daily picks',
      'AI-powered predictions',
      'Basic market data',
      'Email notifications',
      'Mobile responsive'
    ],
    limitations: [
      'Limited to daily featured stocks',
      'No custom watchlists',
      'No historical data',
      'Standard support'
    ],
    cta: 'Start Free',
    popular: false
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    description: 'Daily analytics for top 50 companies + advanced features',
    features: [
      'Top 50 companies daily',
      'All S&P 500 stocks available',
      'Custom watchlists',
      'Historical accuracy tracking',
      'News sentiment analysis',
      'Analyst consensus data',
      'Advanced charts & alerts',
      'Priority support',
      'API access'
    ],
    limitations: [],
    cta: 'Start 7-Day Free Trial',
    popular: true
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: 'contact us',
    description: 'For institutions and large trading teams',
    features: [
      'Everything in Pro',
      'White-label solution',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantees',
      'Training & onboarding',
      'Advanced analytics',
      'Multi-user management'
    ],
    limitations: [],
    cta: 'Contact Sales',
    popular: false
  }
];

export function PricingSection() {
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [signupVariant, setSignupVariant] = useState<'free' | 'trial' | 'premium'>('free');

  const handleCTAClick = (planName: string) => {
    if (planName === 'Free') {
      setSignupVariant('free');
    } else if (planName === 'Pro') {
      setSignupVariant('trial');
    } else {
      setSignupVariant('premium');
    }
    setIsSignupModalOpen(true);
  };

  return (
    <section id="pricing" className="py-20 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-50 text-green-700 text-sm font-medium mb-6">
            <SparklesIcon className="w-4 h-4 mr-2" />
            Simple, Transparent Pricing
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
              {' '}Trading Plan
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Start free and upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`glass-card p-8 relative animate-fade-in-up ${
                plan.popular 
                  ? 'ring-2 ring-primary-500 shadow-2xl scale-105' 
                  : 'hover:shadow-xl'
              } transition-all duration-300`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-to-r from-primary-500 to-blue-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-gray-500 ml-2">/{plan.period}</span>
                </div>
                <p className="text-gray-600">{plan.description}</p>
              </div>

              <div className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center">
                    <CheckIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </div>
                ))}
                
                {plan.limitations.map((limitation, i) => (
                  <div key={i} className="flex items-center opacity-60">
                    <XMarkIcon className="w-5 h-5 text-gray-400 mr-3 flex-shrink-0" />
                    <span className="text-gray-500 line-through">{limitation}</span>
                  </div>
                ))}
              </div>

              <button 
                onClick={() => handleCTAClick(plan.name)}
                className={
                  plan.popular 
                    ? 'btn-primary w-full' 
                    : 'btn-secondary w-full'
                }
              >
                {plan.cta}
              </button>

              {plan.name === 'Pro' && (
                <p className="text-xs text-gray-500 text-center mt-3">
                  No credit card required • Cancel anytime
                </p>
              )}
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">How accurate are the predictions?</h4>
              <p className="text-gray-600 text-sm">Our AI models achieve 75-85% accuracy on directional predictions, with detailed confidence scores for each forecast.</p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">Can I cancel anytime?</h4>
              <p className="text-gray-600 text-sm">Yes, you can cancel your subscription at any time. No long-term contracts or cancellation fees.</p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">Is this financial advice?</h4>
              <p className="text-gray-600 text-sm">No, our insights are for informational purposes only. Always consult with a qualified financial advisor.</p>
            </div>
            <div className="text-left">
              <h4 className="font-semibold text-gray-900 mb-2">What data sources do you use?</h4>
              <p className="text-gray-600 text-sm">We use professional-grade data from Financial Modeling Prep, combined with OpenAI's GPT-4 for analysis.</p>
            </div>
          </div>
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