# S&P 500 AI Insights Platform

A modern web application that provides daily AI-powered insights and predictions for S&P 500 stocks, featuring real-time data analysis, transparent reasoning, and professional-grade forecasting.

## 🚀 Features

- **AI-Powered Predictions**: Next day, week, and month price forecasts using GPT-4
- **Real-Time Data**: Live stock prices, news, analyst opinions from Financial Modeling Prep API
- **Transparent Analysis**: 5-6 detailed sources with clickable proof links for every prediction
- **Daily Fresh Insights**: Most interesting S&P 500 companies selected daily
- **Comprehensive Sources**: News articles, analyst price targets, technical analysis, earnings data
- **Performance Optimized**: 24-hour caching system for cost-effective API usage
- **Modern UI**: Apple-style design with smooth animations and responsive layout

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **React Query** for data fetching

### Backend
- **Node.js** with Express
- **TypeScript**
- **Winston** for logging
- **File-based caching** system

### APIs & Services
- **Financial Modeling Prep (FMP)** - Stock data, news, analyst opinions
- **OpenAI GPT-4** - AI-powered analysis and predictions

## 📊 Data Sources

The platform aggregates data from multiple sources:
- **Stock Quotes**: Real-time pricing and market data
- **News Articles**: Latest financial news and press releases
- **Analyst Opinions**: Price targets, upgrades/downgrades
- **Financial Statements**: Earnings reports and company financials
- **Technical Indicators**: Moving averages and market sentiment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Financial Modeling Prep API key
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd ia-predictor
```

2. **Install dependencies**
```bash
npm install
cd backend && npm install && cd ..
```

3. **Environment Setup**
```bash
# Copy environment template
cp .env.template .env.local

# Add your API keys to .env.local
FMP_API_KEY=your_fmp_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

4. **Start development servers**
```bash
npm run dev
```

This starts:
- Frontend: http://localhost:3000
- Backend: http://localhost:3005

## 🌐 Deployment

### Environment Variables
Set these in your deployment platform:

```bash
FMP_API_KEY=your_financial_modeling_prep_api_key
OPENAI_API_KEY=your_openai_api_key
BACKEND_PORT=3005
NODE_ENV=production
```

### Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

## 📈 API Endpoints

### Frontend Proxy Routes
- `GET /api/backend/stocks/featured` - Daily featured stocks
- `GET /api/backend/insights/simple/:symbol` - Company insights with sources
- `GET /api/backend/cache/stats` - Cache performance statistics

### Backend Routes
- `GET /api/stocks/featured` - Featured stocks data
- `GET /api/insights/simple/:symbol` - Comprehensive stock insights
- `GET /api/insights/enhanced/:symbol` - AI-powered predictions
- `GET /api/cache/stats` - Cache statistics

## 💰 Cost Optimization

- **24-hour caching** reduces API calls by 87%
- **Smart data fetching** avoids redundant requests
- **Efficient rate limiting** prevents API quota exhaustion

## 🔧 Development Scripts

```bash
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend in backend directory
npm run build           # Build for production
npm run start           # Start production server
npm run test-api        # Test API connections
npm run test-cache      # Demonstrate caching system
```

## 📁 Project Structure

```
ia-predictor/
├── app/                 # Next.js app directory
├── components/          # React components
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── backend/            # Express.js backend
│   ├── src/
│   │   ├── routes/     # API routes
│   │   ├── services/   # Business logic
│   │   └── index.ts    # Server entry point
│   └── cache/          # File-based cache storage
├── scripts/            # Utility scripts
└── docs/               # Documentation
```

## 🎯 Key Features Details

### AI Predictions
- Uses GPT-4 for sophisticated analysis
- Combines multiple data sources
- Provides confidence levels and risk assessment
- Includes detailed reasoning for transparency

### Data Sources & Transparency
- News articles with publication dates
- Analyst price targets and ratings
- Technical analysis indicators
- Earnings and financial data
- All sources include clickable verification links

### Caching System
- 24-hour TTL for all API responses
- Automatic cleanup of expired data
- Comprehensive cache statistics
- Significant cost savings (87% reduction in API calls)

## 🔐 Security

- API keys stored securely in environment variables
- Input validation and sanitization
- Rate limiting protection
- CORS configuration
- Security headers implementation

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please open an issue in the GitHub repository.

---

**Disclaimer**: This application provides data analysis and predictions for informational purposes only. It is not financial advice and should not be used as the sole basis for investment decisions. 