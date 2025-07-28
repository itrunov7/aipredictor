'use client';

import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    content: "SP500 Insights has transformed how I approach trading. The AI predictions are incredibly accurate and the transparent reasoning gives me confidence in my decisions.",
    author: "Sarah Chen",
    role: "Day Trader",
    rating: 5
  },
  {
    content: "Finally, a platform that explains the 'why' behind stock predictions. The combination of news analysis and AI insights is game-changing.",
    author: "Michael Rodriguez",
    role: "Portfolio Manager",
    rating: 5
  },
  {
    content: "I've been using the free daily insights for months. The accuracy is impressive and it's helped me identify several profitable trades.",
    author: "Jennifer Park",
    role: "Individual Investor",
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trusted by Traders Worldwide
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            See what our users are saying about their experience with AI-powered stock insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="glass-card p-6 animate-fade-in-up" style={{ animationDelay: `${index * 150}ms` }}>
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <StarIcon key={i} className="w-5 h-5 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-600 mb-4 italic">"{testimonial.content}"</p>
              <div>
                <div className="font-semibold text-gray-900">{testimonial.author}</div>
                <div className="text-sm text-gray-500">{testimonial.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
} 