'use client';

import React from 'react';
import { ArrowTopRightOnSquareIcon, ClockIcon } from '@heroicons/react/24/outline';

interface NewsArticle {
  title: string;
  url: string;
  publishedDate: string;
  site: string;
  text?: string;
  impact?: 'positive' | 'negative' | 'neutral';
}

interface NewsCardProps {
  article: NewsArticle;
  compact?: boolean;
  showImpact?: boolean;
}

export function NewsCard({ article, compact = false, showImpact = false }: NewsCardProps) {
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffInMs = now.getTime() - date.getTime();
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      const diffInDays = Math.floor(diffInHours / 24);
      
      if (diffInHours < 1) {
        return 'Just now';
      } else if (diffInHours < 24) {
        return `${diffInHours}h ago`;
      } else if (diffInDays < 7) {
        return `${diffInDays}d ago`;
      } else {
        return date.toLocaleDateString();
      }
    } catch {
      return 'Recent';
    }
  };

  const getImpactColor = (impact?: string) => {
    switch (impact) {
      case 'positive':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'negative':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getImpactText = (impact?: string) => {
    switch (impact) {
      case 'positive':
        return 'Bullish';
      case 'negative':
        return 'Bearish';
      default:
        return 'Neutral';
    }
  };

  if (compact) {
    return (
      <div className="border-l-4 border-primary-500 pl-4 py-2">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-medium text-gray-900 line-clamp-2 leading-5">
              {article.title}
            </h4>
            <div className="flex items-center mt-1 text-xs text-gray-500 space-x-2">
              <span className="font-medium">{article.site}</span>
              <span>•</span>
              <span>{formatDate(article.publishedDate)}</span>
            </div>
          </div>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 flex-shrink-0 text-primary-600 hover:text-primary-800 transition-colors"
          >
            <ArrowTopRightOnSquareIcon className="w-4 h-4" />
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {article.site.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900">{article.site}</h3>
            <div className="flex items-center text-xs text-gray-500 space-x-1">
              <ClockIcon className="w-3 h-3" />
              <span>{formatDate(article.publishedDate)}</span>
            </div>
          </div>
        </div>
        
        {showImpact && article.impact && (
          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getImpactColor(article.impact)}`}>
            {getImpactText(article.impact)}
          </div>
        )}
      </div>

      {/* Article Title */}
      <h2 className="text-lg font-semibold text-gray-900 mb-3 leading-6 line-clamp-2">
        {article.title}
      </h2>

      {/* Article Summary */}
      {article.text && (
        <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
          {article.text}
        </p>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="text-xs text-gray-500">
          Source: {article.site}
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-sm font-medium text-primary-600 hover:text-primary-800 transition-colors"
        >
          <span>Read Full Article</span>
          <ArrowTopRightOnSquareIcon className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}

// News List Component
interface NewsListProps {
  articles: NewsArticle[];
  title?: string;
  compact?: boolean;
  showImpact?: boolean;
  maxItems?: number;
}

export function NewsList({ 
  articles, 
  title = "Latest News", 
  compact = false, 
  showImpact = false,
  maxItems = 10 
}: NewsListProps) {
  const displayArticles = articles.slice(0, maxItems);

  if (displayArticles.length === 0) {
    return (
      <div className="glass-card p-6 text-center">
        <div className="text-gray-400 mb-2">
          <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">No News Available</h3>
        <p className="text-gray-500 text-sm">
          News articles will appear here when available from our data sources.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <div className="text-sm text-gray-500">
            {displayArticles.length} article{displayArticles.length !== 1 ? 's' : ''}
          </div>
        </div>
      )}
      
      <div className={compact ? "space-y-4" : "grid gap-6 md:grid-cols-2 lg:grid-cols-3"}>
        {displayArticles.map((article, index) => (
          <NewsCard
            key={`${article.url}-${index}`}
            article={article}
            compact={compact}
            showImpact={showImpact}
          />
        ))}
      </div>

      {articles.length > maxItems && (
        <div className="text-center pt-4">
          <button className="btn-secondary">
            View {articles.length - maxItems} More Articles
          </button>
        </div>
      )}
    </div>
  );
} 