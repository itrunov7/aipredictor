'use client';

import React, { useState } from 'react';
import { XMarkIcon, SparklesIcon, CheckIcon } from '@heroicons/react/24/outline';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: 'free' | 'trial' | 'premium';
}

export function SignupModal({ isOpen, onClose, variant = 'free' }: SignupModalProps) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSuccess(true);
    
    // Reset form after success
    setTimeout(() => {
      setIsSuccess(false);
      setEmail('');
      setFirstName('');
      onClose();
    }, 2000);
  };

  if (!isOpen) return null;

  const getModalContent = () => {
    switch (variant) {
      case 'trial':
        return {
          title: 'Start Your 7-Day Free Trial',
          subtitle: 'Get full access to all 500 S&P stocks with AI predictions',
          benefit: 'No credit card required • Cancel anytime',
          buttonText: 'Start Free Trial'
        };
      case 'premium':
        return {
          title: 'Upgrade to Premium',
          subtitle: 'Unlock advanced features and unlimited stock analysis',
          benefit: '30-day money-back guarantee',
          buttonText: 'Upgrade Now'
        };
      default:
        return {
          title: 'Get Free Daily Insights',
          subtitle: 'Receive AI-powered stock predictions for 5 featured S&P 500 companies',
          benefit: 'Always free • No spam • Unsubscribe anytime',
          buttonText: 'Get Free Insights'
        };
    }
  };

  const content = getModalContent();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6 animate-fade-in-up">
          {isSuccess ? (
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                <CheckIcon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome aboard!</h3>
              <p className="text-sm text-gray-500">
                Check your email for your first daily insights. You'll start receiving AI predictions shortly.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                    <SparklesIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{content.title}</h3>
                </div>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <p className="text-gray-600 mb-6">{content.subtitle}</p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field w-full"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    content.buttonText
                  )}
                </button>
              </form>

              <p className="text-xs text-gray-500 text-center mt-4">{content.benefit}</p>

              {variant !== 'free' && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">What you'll get:</p>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                        <span>AI predictions for all 500 S&P stocks</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                        <span>Custom watchlists and alerts</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                        <span>Historical accuracy tracking</span>
                      </div>
                      <div className="flex items-center justify-center">
                        <CheckIcon className="w-4 h-4 text-green-500 mr-2" />
                        <span>Priority support</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 