'use client';

import React, { useState, useEffect } from 'react';
import { ChartBarIcon, SparklesIcon, ArrowTrendingUpIcon as TrendingUpIcon } from '@heroicons/react/24/outline';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';
import { SignupModal } from './SignupModal';
import { useApp } from '@/contexts/AppContext';

// Mock market data - updated with current relevant prices
const mockMarketData = [
  { symbol: 'AAPL', price: 214.59, change: 0.71, prediction: '+2.8%' },
  { symbol: 'MSFT', price: 513.94, change: 0.20, prediction: '+2.1%' },
  { symbol: 'GOOGL', price: 191.94, change: -1.23, prediction: '+1.6%' },
  { symbol: 'AMZN', price: 233.46, change: 2.01, prediction: '+3.1%' },
  { symbol: 'TSLA', price: 324.75, change: 8.73, prediction: '+4.5%' }
];

const features = [
  {
    icon: SparklesIcon,
    title: 'AI-Powered Analysis',
    description: 'GPT-4 enhanced predictions with transparent reasoning'
  },
  {
    icon: ChartBarIcon,
    title: 'Real-Time Data',
    description: 'Live market data from professional financial sources'
  },
  {
    icon: TrendingUpIcon,
    title: 'Daily Insights',
    description: 'Fresh analysis for 5 featured stocks every day'
  }
];

export function HeroSection() {
  const [currentDataIndex, setCurrentDataIndex] = useState(0);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [signupVariant, setSignupVariant] = useState<'free' | 'trial' | 'premium'>('free');
  const [isVisible, setIsVisible] = useState(false);
  const { updateLastRefreshed } = useApp();

  // Rotate through market data
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDataIndex((prev) => (prev + 1) % mockMarketData.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Scroll animation trigger
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const currentStock = mockMarketData[currentDataIndex];

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
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2393a3b7' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
        <div className="text-center">
          {/* Today's Date Badge */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-blue-50 text-blue-700 text-base font-semibold mb-4 border border-blue-200 animate-fade-in-up">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-3"></div>
            {formatTodayDate()}
          </div>

          {/* Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-medium mb-8 animate-fade-in-up">
            <SparklesIcon className="w-4 h-4 mr-2" />
            AI-Powered Stock Analysis for SP500 Traders
          </div>

          {/* Main Headline */}
          <h1 className={`text-5xl md:text-7xl font-bold text-gray-900 mb-6 transition-opacity duration-700 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}>
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-primary-600 bg-clip-text text-transparent">
              Know why
            </span>
            <br />
            <span className="text-gray-900">a stock moves</span>
          </h1>

          {/* Subheadline */}
          <p className={`text-xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed transition-opacity duration-700 delay-300 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}>
            Real-time insights from 10 FMP data sources with transparent AI analysis. 
            Understand the story behind every price movement.
          </p>

          {/* Live Market Data Showcase */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 max-w-md mx-auto mb-8 shadow-lg border border-gray-200 animate-fade-in-up">
            <div className="text-sm text-gray-500 mb-2">Live AI Analysis</div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-gray-900">{currentStock.symbol}</div>
                <div className="text-lg text-gray-700">{formatCurrency(currentStock.price)}</div>
              </div>
              <div className="text-right">
                <div className={`flex items-center space-x-1 text-sm font-medium ${
                  currentStock.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {currentStock.change >= 0 ? (
                    <ArrowTrendingUpIcon className="w-4 h-4" />
                  ) : (
                    <ArrowTrendingDownIcon className="w-4 h-4" />
                  )}
                  <span>{formatPercent(currentStock.change)}</span>
                </div>
                <div className="text-sm text-gray-500">
                  AI Prediction: <span className="text-green-600 font-medium">{currentStock.prediction}</span>
                </div>
              </div>
            </div>
            <div className="mt-3 flex justify-center">
              <div className="flex space-x-1">
                {mockMarketData.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentDataIndex ? 'bg-primary-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 transition-opacity duration-700 delay-500 ${
            isVisible ? 'opacity-100' : 'opacity-0'
          }`}>
            <button 
              onClick={() => {
                updateLastRefreshed();
                document.getElementById('insights')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              See today's free insights →
            </button>
            <button 
              onClick={() => {
                setSignupVariant('trial');
                setIsSignupModalOpen(true);
              }}
              className="btn-secondary text-lg px-8 py-3"
            >
              Start Free Trial
            </button>
          </div>

          {/* Trust Indicators */}
          <div className="text-center animate-fade-in-up">
            <p className="text-sm text-gray-500 mb-4">Trusted by thousands of traders • Most interesting companies daily</p>
            <div className="flex items-center justify-center space-x-8 text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm">Live Data</span>
              </div>
              <div className="flex items-center space-x-2">
                <SparklesIcon className="w-4 h-4" />
                <span className="text-sm">AI Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <TrendingUpIcon className="w-4 h-4" />
                <span className="text-sm">Professional Grade</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Cards */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card p-6 text-center hover:shadow-xl transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>

      {/* Signup Modal */}
      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        variant={signupVariant}
      />
    </section>
  );
} 