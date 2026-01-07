/**
 * Test script to verify crawlability of calculator without JavaScript
 * This simulates how search engine crawlers without JS would see the page
 */

const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../dist/index.html');
const html = fs.readFileSync(htmlPath, 'utf-8');

// Remove script tags to simulate no-JS environment
const noJsHtml = html
  .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
  .replace(/<script[^>]*>/gi, '');

const tests = {
  'EMI Calculator Form': () => {
    const hasForm = noJsHtml.includes('id="emi-calculator-form"');
    const hasPrincipalInput = noJsHtml.includes('id="principal-input"');
    const hasRateInput = noJsHtml.includes('id="rate-input"');
    const hasTenureInput = noJsHtml.includes('id="tenure-years-input"');
    return hasForm && hasPrincipalInput && hasRateInput && hasTenureInput;
  },
  
  'EMI Summary Section': () => {
    const hasSummary = noJsHtml.includes('id="emi-summary"');
    const hasMonthlyEMI = noJsHtml.includes('Monthly EMI');
    const hasEMIValue = noJsHtml.includes('₹43,391');
    const hasTotalInterest = noJsHtml.includes('Total Interest Payable');
    return hasSummary && hasMonthlyEMI && hasEMIValue && hasTotalInterest;
  },
  
  'FD Calculator Form': () => {
    const hasForm = noJsHtml.includes('id="fd-calculator-form"');
    const hasPrincipalInput = noJsHtml.includes('id="fd-principal"');
    const hasRateInput = noJsHtml.includes('id="fd-rate"');
    return hasForm && hasPrincipalInput && hasRateInput;
  },
  
  'FD Summary Section': () => {
    const hasSummary = noJsHtml.includes('id="fd-summary"');
    const hasMaturity = noJsHtml.includes('Maturity Amount');
    const hasMaturityValue = noJsHtml.includes('₹1,37,714');
    return hasSummary && hasMaturity && hasMaturityValue;
  },
  
  'RD Calculator Form': () => {
    const hasForm = noJsHtml.includes('id="rd-calculator-form"');
    const hasMonthlyInput = noJsHtml.includes('id="rd-monthly"');
    const hasRateInput = noJsHtml.includes('id="rd-rate"');
    return hasForm && hasMonthlyInput && hasRateInput;
  },
  
  'RD Summary Section': () => {
    const hasSummary = noJsHtml.includes('id="rd-summary"');
    const hasMaturity = noJsHtml.includes('Maturity Amount');
    const hasMaturityValue = noJsHtml.includes('₹1,40,965');
    return hasSummary && hasMaturity && hasMaturityValue;
  },
  
  'Input Fields Have Accessible Labels': () => {
    const principalLabel = noJsHtml.includes('aria-label="Loan Principal Amount"');
    const rateLabel = noJsHtml.includes('aria-label="Annual Interest Rate"');
    const tenureLabel = noJsHtml.includes('aria-label="Loan Tenure in Years"');
    return principalLabel && rateLabel && tenureLabel;
  },
  
  'Form Elements Have Default Values': () => {
    const hasDefaultPrincipal = noJsHtml.includes('value="5000000"');
    const hasDefaultRate = noJsHtml.includes('value="8.5"');
    const hasDefaultTenure = noJsHtml.includes('value="20"');
    return hasDefaultPrincipal && hasDefaultRate && hasDefaultTenure;
  },
  
  'Structured Data Present': () => {
    // Check for JSON-LD structured data in original HTML
    const hasWebSite = html.includes('"@type": "WebSite"');
    const hasWebApplication = html.includes('"@type": "WebApplication"');
    const hasFAQPage = html.includes('"@type": "FAQPage"');
    const hasHowTo = html.includes('"@type": "HowTo"');
    return hasWebSite && hasWebApplication && hasFAQPage && hasHowTo;
  },
  
  'Static Content Visible': () => {
    const hasStaticDiv = noJsHtml.includes('id="static-content"');
    const hasDisplayBlock = noJsHtml.includes('id="static-content" style="display: block;"');
    return hasStaticDiv && hasDisplayBlock;
  },
  
  'SEO Meta Tags Present': () => {
    const hasTitle = html.includes('<title>EMI Calculator Online');
    const hasDescription = html.includes('name="description"');
    const hasKeywords = html.includes('name="keywords"');
    const hasCanonical = html.includes('rel="canonical"');
    return hasTitle && hasDescription && hasKeywords && hasCanonical;
  },
  
  'NoScript Fallback Present': () => {
    return html.includes('<noscript>') && html.includes('Please enable JavaScript');
  }
};

console.log('\n🔍 Crawlability Test Results (No-JS Environment Simulation)\n');
console.log('='.repeat(60));

let passed = 0;
let failed = 0;

Object.entries(tests).forEach(([testName, testFn]) => {
  const result = testFn();
  const icon = result ? '✅' : '❌';
  console.log(`${icon} ${testName}`);
  
  if (result) passed++;
  else failed++;
});

console.log('='.repeat(60));
console.log(`\nTotal: ${passed + failed} tests | Passed: ${passed} | Failed: ${failed}`);

if (failed === 0) {
  console.log('\n🎉 All crawlability tests passed! The calculator is fully crawlable without JS.\n');
  process.exit(0);
} else {
  console.log('\n⚠️  Some tests failed. The calculator may not be fully crawlable.\n');
  process.exit(1);
}
