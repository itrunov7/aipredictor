'use client';

import React, { useState } from 'react';
import { Bars3Icon, XMarkIcon, ChartBarIcon, BoltIcon, ClockIcon, MoonIcon, SunIcon } from '@heroicons/react/24/outline';
import { FeedbackForm } from './FeedbackForm';
import { useApp } from '@/contexts/AppContext';

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isFeedbackFormOpen, setIsFeedbackFormOpen] = useState(false);
  const { lastRefreshed, isDarkMode, toggleDarkMode } = useApp();

  const navigation = [
    { name: 'Insights', href: '#insights' },
    { name: 'Features', href: '#features' },
    { name: 'Feedback', href: '#feedback' },
    { name: 'About', href: '#about' }
  ];

  return (
    <header className="relative bg-white/80 backdrop-blur-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <BoltIcon className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">SP500 Insights</h1>
                <p className="text-xs text-gray-500 -mt-1">Powered by AI</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 text-sm font-medium transition-colors duration-200"
              >
                {item.name}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Timestamp */}
            <div className="flex items-center space-x-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 dark:text-gray-400 px-3 py-2 rounded-lg">
              <ClockIcon className="w-4 h-4" />
              <span>Last refreshed {new Date(lastRefreshed).toLocaleTimeString()}</span>
            </div>
            
            {/* Dark mode toggle */}
            <button
              onClick={toggleDarkMode}
              className="p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg transition-colors"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDarkMode ? (
                <SunIcon className="w-5 h-5" />
              ) : (
                <MoonIcon className="w-5 h-5" />
              )}
            </button>
            
            <button 
              onClick={() => {
                document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white text-sm font-medium transition-colors"
            >
              💬 Feedback
            </button>
            <button 
              onClick={() => {
                setIsFeedbackFormOpen(true);
              }}
              className="btn-primary"
            >
              📝 Share Feedback
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-lg p-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200 shadow-lg">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="text-gray-600 hover:text-gray-900 block px-3 py-2 text-base font-medium transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.name}
              </a>
            ))}
            <div className="pt-4 pb-2 border-t border-gray-200 mt-4">
              <div className="flex flex-col space-y-2 px-3">
                <button 
                  onClick={() => {
                    document.getElementById('feedback')?.scrollIntoView({ behavior: 'smooth' });
                    setIsMenuOpen(false);
                  }}
                  className="text-left text-gray-600 hover:text-gray-900 text-base font-medium transition-colors"
                >
                  💬 Feedback
                </button>
                <button 
                  onClick={() => {
                    setIsFeedbackFormOpen(true);
                    setIsMenuOpen(false);
                  }}
                  className="btn-primary text-left"
                >
                  📝 Share Feedback
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Market Status Banner */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center py-2">
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-700 font-medium">Markets Open</span>
              </div>
              <div className="hidden sm:flex items-center space-x-4 text-gray-600">
                <span>S&P 500: <strong className="text-green-600">+1.2%</strong></span>
                <span>•</span>
                <span>NASDAQ: <strong className="text-green-600">+1.8%</strong></span>
                <span>•</span>
                <span>DOW: <strong className="text-green-600">+0.9%</strong></span>
              </div>
              <div className="text-xs text-gray-500">
                Live AI Analysis • {new Date().toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Form */}
      <FeedbackForm
        isOpen={isFeedbackFormOpen}
        onClose={() => setIsFeedbackFormOpen(false)}
      />
    </header>
  );
} 