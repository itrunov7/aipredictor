#!/usr/bin/env node

/**
 * Test script for Financial Modeling Prep API
 * Demonstrates real-time stock data fetching
 */

const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const FMP_API_KEY = process.env.FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';

if (!FMP_API_KEY) {
  console.error('❌ FMP_API_KEY not found in environment variables');
  process.exit(1);
}

async function testFMPAPI() {
  console.log('🚀 Testing Financial Modeling Prep API\n');
  console.log(`🔑 API Key: ${FMP_API_KEY.substring(0, 8)}...`);
  console.log(`🌐 Base URL: ${BASE_URL}\n`);

  try {
    // Test 1: Get Apple stock quote
    console.log('📊 Test 1: Getting Apple (AAPL) stock quote...');
    const appleQuote = await axios.get(`${BASE_URL}/quote/AAPL?apikey=${FMP_API_KEY}`);
    const aapl = appleQuote.data[0];
    
    console.log(`✅ AAPL: $${aapl.price} (${aapl.change >= 0 ? '+' : ''}${aapl.change} / ${aapl.changesPercentage}%)`);
    console.log(`   Market Cap: $${(aapl.marketCap / 1e12).toFixed(2)}T`);
    console.log(`   Volume: ${(aapl.volume / 1e6).toFixed(1)}M shares\n`);

    // Test 2: Get multiple tech stocks
    console.log('📊 Test 2: Getting tech giants (AAPL, MSFT, GOOGL, AMZN, TSLA)...');
    const techStocks = await axios.get(`${BASE_URL}/quote/AAPL,MSFT,GOOGL,AMZN,TSLA?apikey=${FMP_API_KEY}`);
    
    console.log('✅ Tech Giants:');
    techStocks.data.forEach(stock => {
      const change = stock.change >= 0 ? `+${stock.change}` : stock.change;
      const changePercent = stock.changesPercentage >= 0 ? `+${stock.changesPercentage}` : stock.changesPercentage;
      console.log(`   ${stock.symbol}: $${stock.price} (${change} / ${changePercent}%)`);
    });
    console.log();

    // Test 3: Get market movers
    console.log('📊 Test 3: Getting market gainers...');
    const gainers = await axios.get(`${BASE_URL}/gainers?apikey=${FMP_API_KEY}`);
    
    console.log('✅ Top 5 Gainers:');
    gainers.data.slice(0, 5).forEach((stock, index) => {
      console.log(`   ${index + 1}. ${stock.symbol}: +${stock.changesPercentage}% ($${stock.price})`);
    });
    console.log();

    // Test 4: Get some S&P 500 companies
    console.log('📊 Test 4: Getting S&P 500 companies list...');
    const sp500 = await axios.get(`${BASE_URL}/sp500_constituent?apikey=${FMP_API_KEY}`);
    
    console.log(`✅ S&P 500: ${sp500.data.length} companies found`);
    console.log('   Sample companies:');
    sp500.data.slice(0, 5).forEach(company => {
      console.log(`   • ${company.symbol}: ${company.companyName} (${company.sector})`);
    });
    console.log();

    // Test 5: Get recent news
    console.log('📊 Test 5: Getting recent stock news...');
    const news = await axios.get(`${BASE_URL}/stock_news?limit=3&apikey=${FMP_API_KEY}`);
    
    console.log('✅ Latest News:');
    news.data.forEach((article, index) => {
      console.log(`   ${index + 1}. ${article.title.substring(0, 80)}...`);
      console.log(`      Source: ${article.site} | Symbol: ${article.symbol || 'General'}`);
    });
    console.log();

    // Test 6: Get economic indicators
    console.log('📊 Test 6: Getting economic indicators...');
    try {
      const gdp = await axios.get(`${BASE_URL}/economic?name=GDP&apikey=${FMP_API_KEY}`);
      if (gdp.data && gdp.data.length > 0) {
        const latest = gdp.data[0];
        console.log(`✅ Latest GDP: ${latest.value} (${latest.date})`);
      }
    } catch (error) {
      console.log('⚠️  Economic data may require higher API tier');
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📈 Your FMP API is ready for the SP500 Insights Platform');
    console.log('💡 You can now run: npm run dev');

  } catch (error) {
    console.error('❌ Error testing FMP API:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.error('🔐 Authentication failed - check your API key');
    } else if (error.response?.status === 429) {
      console.error('⏰ Rate limit exceeded - wait a moment and try again');
    } else if (error.response?.status === 403) {
      console.error('🚫 API access forbidden - your plan may not include this endpoint');
    }
  }
}

// Run the test
testFMPAPI(); 