'use client';

import React, { useState, useEffect } from 'react';
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FeedbackForm({ isOpen, onClose }: FeedbackFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    feedbackType: 'general',
    message: '',
    honeypot: '', // Bot trap
    captcha: '',
    currentTrade: '',
    experience: ''
  });
  
  const [captchaQuestion, setCaptchaQuestion] = useState({ question: '', answer: 0 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [formOpenTime, setFormOpenTime] = useState<number>(0);

  // Generate simple math captcha
  useEffect(() => {
    if (isOpen) {
      setFormOpenTime(Date.now());
      const a = Math.floor(Math.random() * 10) + 1;
      const b = Math.floor(Math.random() * 10) + 1;
      setCaptchaQuestion({
        question: `${a} + ${b} = ?`,
        answer: a + b
      });
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Bot protection checks
    if (formData.honeypot) {
      console.log('Bot detected: honeypot filled');
      return;
    }
    
    // Time protection (form must be open for at least 3 seconds)
    if (Date.now() - formOpenTime < 3000) {
      alert('Please take a moment to fill out the form thoughtfully.');
      return;
    }
    
    // Captcha check
    if (parseInt(formData.captcha) !== captchaQuestion.answer) {
      alert('Please solve the math problem correctly.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/send-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
        }),
      });
      
      if (response.ok) {
        setSubmitStatus('success');
        setTimeout(() => {
          onClose();
          setSubmitStatus('idle');
          setFormData({
            name: '',
            email: '',
            feedbackType: 'general',
            message: '',
            honeypot: '',
            captcha: '',
            currentTrade: '',
            experience: ''
          });
        }, 2000);
      } else {
        setSubmitStatus('error');
      }
    } catch (error) {
      console.error('Error sending feedback:', error);
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            💬 Share Your Feedback
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Success/Error Messages */}
          {submitStatus === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
              <div>
                <h3 className="text-green-800 font-semibold">Thank you!</h3>
                <p className="text-green-700 text-sm">Your feedback has been sent successfully.</p>
              </div>
            </div>
          )}
          
          {submitStatus === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3">
              <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              <div>
                <h3 className="text-red-800 font-semibold">Oops!</h3>
                <p className="text-red-700 text-sm">Something went wrong. Please try again.</p>
              </div>
            </div>
          )}

          {/* Bot trap - hidden field */}
          <input
            type="text"
            name="website"
            value={formData.honeypot}
            onChange={(e) => setFormData({ ...formData, honeypot: e.target.value })}
            style={{ display: 'none' }}
            tabIndex={-1}
            autoComplete="off"
          />

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="How should we address you?"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="your@email.com"
            />
          </div>

          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What's this about?
            </label>
            <select
              value={formData.feedbackType}
              onChange={(e) => setFormData({ ...formData, feedbackType: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="general">General Feedback</option>
              <option value="feature">Feature Request</option>
              <option value="bug">Bug Report</option>
              <option value="data">Data Issue</option>
              <option value="ui">User Interface</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Trading Experience */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Trading Experience
            </label>
            <select
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="">Select your level</option>
              <option value="beginner">Beginner (&lt; 1 year)</option>
              <option value="intermediate">Intermediate (1-3 years)</option>
              <option value="experienced">Experienced (3-10 years)</option>
              <option value="professional">Professional (10+ years)</option>
            </select>
          </div>

          {/* Current Trade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              What stocks are you currently watching? (Optional)
            </label>
            <input
              type="text"
              value={formData.currentTrade}
              onChange={(e) => setFormData({ ...formData, currentTrade: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="e.g., AAPL, TSLA, or describe your portfolio focus"
            />
          </div>

          {/* Main Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your Feedback
            </label>
            <textarea
              required
              rows={6}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
              placeholder="Tell us what you think! What features would you love to see? What's working well? What could be improved?"
            />
          </div>

          {/* Captcha */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Quick Math Check: {captchaQuestion.question}
            </label>
            <input
              type="number"
              required
              value={formData.captcha}
              onChange={(e) => setFormData({ ...formData, captcha: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter the answer"
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || submitStatus === 'success'}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Sending...' : 'Send Feedback 🚀'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 