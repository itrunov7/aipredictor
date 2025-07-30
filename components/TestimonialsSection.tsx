'use client';

import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';

const testimonials = [
  {
    content: "Love the comprehensive analysis! The technical and fundamental breakdowns are exactly what I need. Would love to see sector comparison features next.",
    author: "Sarah Chen",
    role: "Beta Tester",
    rating: 5
  },
  {
    content: "The AI explanations are incredibly detailed. My feedback: add more historical data visualization and maybe mobile alerts for key price movements.",
    author: "Michael Rodriguez",
    role: "Early User",
    rating: 5
  },
  {
    content: "Free daily insights are amazing! Suggestion: could you add options flow data and crypto analysis too? This platform has huge potential.",
    author: "Jennifer Park",
    role: "Community Member",
    rating: 5
  }
];

export function TestimonialsSection() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Building Together with Our Community
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Hear from our beta users and early adopters who are helping us shape the future of trading intelligence.
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