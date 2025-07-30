import { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export const metadata: Metadata = {
  title: 'Methodology - SP500 Insights',
  description: 'Learn how our AI-powered stock analysis works, including data sources, processing methods, and prediction algorithms.',
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Back link */}
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          <span>Back to Insights</span>
        </Link>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Our Methodology
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Transparent AI-powered stock analysis using real-time Financial Modeling Prep data
          </p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <h2>Data Sources</h2>
          <p>
            Our analysis is powered by 10 distinct <a href="https://financialmodelingprep.com" target="_blank" rel="noopener noreferrer">Financial Modeling Prep (FMP)</a> API endpoints, 
            ensuring comprehensive coverage of each stock:
          </p>
          
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 my-8">
            <h3 className="text-lg font-semibold mb-4">Real-time FMP Endpoints</h3>
            <ol className="space-y-2 text-sm">
              <li><strong>Real-time Quote</strong> - Live price, volume, and change data</li>
              <li><strong>Historical Data</strong> - 365-day price trends and patterns</li>
              <li><strong>Technical Indicators</strong> - RSI momentum and signals</li>
              <li><strong>Price Target Consensus</strong> - Analyst target prices</li>
              <li><strong>Upgrades/Downgrades</strong> - Recent rating changes</li>
              <li><strong>Company News</strong> - Latest headlines and sentiment</li>
              <li><strong>Earnings Transcripts</strong> - Management guidance analysis</li>
              <li><strong>Earnings Calendar</strong> - Upcoming earnings dates</li>
              <li><strong>Financial Statements</strong> - Revenue, profit, and health metrics</li>
              <li><strong>SEC Filings</strong> - Material regulatory disclosures</li>
            </ol>
          </div>

          <h2>AI Analysis Process</h2>
          <p>
            Our OpenAI GPT-4 powered system processes the raw financial data through several stages:
          </p>

          <h3>1. Data Aggregation</h3>
          <p>
            We fetch data from all 10 FMP endpoints simultaneously, ensuring we capture the complete 
            financial picture. Each data point is timestamped and verified for accuracy.
          </p>

          <h3>2. Impact Assessment</h3>
          <p>
            Each data source is analyzed for its potential impact on stock price movement:
          </p>
          <ul>
            <li><strong>Positive</strong> - Factors likely to drive price up</li>
            <li><strong>Negative</strong> - Factors likely to drive price down</li>
            <li><strong>Neutral</strong> - Informational factors with minimal impact</li>
          </ul>

          <h3>3. Confidence Scoring</h3>
          <p>
            Each analysis receives a confidence score (75-95%) based on:
          </p>
          <ul>
            <li>Data source reliability</li>
            <li>Historical accuracy patterns</li>
            <li>Market volatility conditions</li>
            <li>Cross-validation with other sources</li>
          </ul>

          <h3>4. Prediction Generation</h3>
          <p>
            Our AI generates predictions for three timeframes:
          </p>
          <ul>
            <li><strong>Next Day</strong> - Short-term technical momentum</li>
            <li><strong>Next Week</strong> - Medium-term trend analysis</li>
            <li><strong>Next Month</strong> - Fundamental-driven projections</li>
          </ul>

          <h2>Transparency & Limitations</h2>
          
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-lg p-6 my-8">
            <h3 className="text-amber-800 dark:text-amber-200 text-lg font-semibold mb-3">
              ⚠️ Important Limitations
            </h3>
            <ul className="text-amber-700 dark:text-amber-300 space-y-2">
              <li>AI predictions are probabilistic, not guaranteed outcomes</li>
              <li>Market events can override technical and fundamental analysis</li>
              <li>Past performance does not predict future results</li>
              <li>All analysis is for educational purposes only</li>
            </ul>
          </div>

          <h2>Source Verification</h2>
          <p>
            Every insight includes:
          </p>
          <ul>
            <li>Direct links to FMP data sources</li>
            <li>Timestamps showing data freshness</li>
            <li>Specific API endpoints used</li>
            <li>Raw JSON data availability</li>
          </ul>

          <h2>Continuous Improvement</h2>
          <p>
            Our methodology evolves based on:
          </p>
          <ul>
            <li>Prediction accuracy tracking</li>
            <li>Market condition adaptations</li>
            <li>User feedback integration</li>
            <li>New data source incorporation</li>
          </ul>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700/50 rounded-lg p-6 my-8">
            <h3 className="text-blue-800 dark:text-blue-200 text-lg font-semibold mb-3">
              Questions about our methodology?
            </h3>
            <p className="text-blue-700 dark:text-blue-300">
              We believe in complete transparency. If you have questions about how our analysis works, 
              please reach out to our team.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 