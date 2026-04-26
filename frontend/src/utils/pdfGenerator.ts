import html2pdf from 'html2pdf.js';

interface ReportData {
  title: string;
  generatedAt: string;
  period: string;
  metrics: {
    totalTasks: number;
    completedTasks: number;
    totalExpenses: number;
    monthlyExpenses: number;
    completionRate: number;
  };
  categories?: Array<{
    name: string;
    total: number;
    percentage: string;
  }>;
}

export const generateReportPDF = async (data: ReportData) => {
  const htmlContent = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <title>${data.title}</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      html, body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        color: #1a1a2e;
        background: #ffffff;
        width: 100%;
        height: 100%;
        line-height: 1.5;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      
      .report {
        max-width: 100%;
        background: #ffffff;
      }
      
      /* Professional Header */
      .report-header {
        padding: 45px 40px 35px;
        border-bottom: 1px solid #e9ecef;
        position: relative;
      }
      
      .report-header::after {
        content: '';
        position: absolute;
        bottom: -1px;
        left: 40px;
        width: 80px;
        height: 3px;
        background: #2563eb;
      }
      
      .company-name {
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 2px;
        text-transform: uppercase;
        color: #64748b;
        margin-bottom: 12px;
      }
      
      .report-title {
        font-size: 36px;
        font-weight: 700;
        color: #0f172a;
        margin-bottom: 8px;
        letter-spacing: -0.5px;
      }
      
      .report-meta {
        display: flex;
        gap: 32px;
        margin-top: 16px;
      }
      
      .meta-item {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .meta-label {
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #64748b;
      }
      
      .meta-value {
        font-size: 14px;
        font-weight: 500;
        color: #1e293b;
        background: #f8fafc;
        padding: 4px 12px;
        border-radius: 20px;
      }
      
      /* Content Section */
      .report-body {
        padding: 40px;
      }
      
      .section {
        margin-bottom: 48px;
        page-break-inside: avoid;
      }
      
      .section:last-child {
        margin-bottom: 0;
      }
      
      .section-header {
        display: flex;
        align-items: center;
        margin-bottom: 24px;
      }
      
      .section-icon {
        width: 32px;
        height: 32px;
        background: #2563eb;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 16px;
        margin-right: 12px;
      }
      
      .section-title {
        font-size: 20px;
        font-weight: 600;
        color: #0f172a;
        letter-spacing: -0.3px;
      }
      
      /* Categories Table */
      .categories-container {
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        overflow: hidden;
      }
      
      .categories-header {
        display: grid;
        grid-template-columns: 2fr 1fr 0.8fr;
        padding: 16px 24px;
        background: #f8fafc;
        border-bottom: 1px solid #e2e8f0;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: #64748b;
      }
      
      .category-item {
        display: grid;
        grid-template-columns: 2fr 1fr 0.8fr;
        padding: 20px 24px;
        border-bottom: 1px solid #f1f5f9;
        align-items: center;
      }
      
      .category-item:last-child {
        border-bottom: none;
      }
      
      .category-info {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      
      .category-name {
        font-weight: 600;
        color: #1e293b;
        font-size: 14px;
      }
      
      .progress-container {
        width: 100%;
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
      }
      
      .progress-bar {
        height: 100%;
        background: #2563eb;
        border-radius: 3px;
      }
      
      .category-amount {
        font-weight: 600;
        color: #1e293b;
        font-size: 15px;
        text-align: right;
      }
      
      .category-percentage {
        font-weight: 500;
        color: #64748b;
        font-size: 14px;
        text-align: right;
      }
      
      /* Summary Box */
      .summary-box {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 28px 32px;
      }
      
      .summary-title {
        font-size: 16px;
        font-weight: 600;
        color: #0f172a;
        margin-bottom: 12px;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .summary-text {
        font-size: 14px;
        color: #475569;
        line-height: 1.7;
      }
      
      .highlight {
        color: #2563eb;
        font-weight: 600;
      }
      
      /* Footer */
      .report-footer {
        background: #f8fafc;
        padding: 24px 40px;
        border-top: 1px solid #e9ecef;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .footer-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .footer-logo {
        font-weight: 700;
        font-size: 16px;
        color: #0f172a;
        letter-spacing: -0.3px;
      }
      
      .footer-tagline {
        font-size: 12px;
        color: #64748b;
      }
      
      .footer-right {
        font-size: 11px;
        color: #94a3b8;
      }
      
      .page-number {
        color: #64748b;
        font-weight: 500;
      }
      
      /* Divider */
      .divider {
        height: 1px;
        background: linear-gradient(to right, transparent, #e2e8f0, transparent);
        margin: 32px 0;
      }
      
      @media print {
        body {
          background: white;
        }
        
        .kpi-card {
          break-inside: avoid;
        }
      }
    </style>
  </head>
  <body>
    <div class="report">
      <!-- Header -->
      <div class="report-header">
        <div class="company-name">Task & Expense Analytics</div>
        <h1 class="report-title">${data.title}</h1>
        <div class="report-meta">
          <div class="meta-item">
            <span class="meta-label">Period</span>
            <span class="meta-value">${data.period}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Generated</span>
            <span class="meta-value">${data.generatedAt}</span>
          </div>
          <div class="meta-item">
            <span class="meta-label">Report ID</span>
            <span class="meta-value">RPT-${Date.now().toString().slice(-6)}</span>
          </div>
        </div>
      </div>
      
      <!-- Body -->
      <div class="report-body">
        ${false ? `
        <div class="section">
          <div class="section-header">
            <div class="section-icon">📊</div>
            <h2 class="section-title">Key Performance Indicators</h2>
          </div>
          <div class="kpi-grid">
            <div class="kpi-card">
              <div class="kpi-header">
                <span class="kpi-label">Total Tasks</span>
                <span class="kpi-icon">📋</span>
              </div>
              <div class="kpi-value">${data.metrics.totalTasks.toLocaleString()}</div>
              <div class="kpi-trend">▲ All time</div>
              <div class="kpi-subtext">Tasks tracked in system</div>
            </div>
            
            <div class="kpi-card">
              <div class="kpi-header">
                <span class="kpi-label">Completion Rate</span>
                <span class="kpi-icon">✅</span>
              </div>
              <div class="kpi-value">${data.metrics.completionRate}%</div>
              <div class="kpi-trend">${data.metrics.completedTasks} completed</div>
              <div class="kpi-subtext">of ${data.metrics.totalTasks} total tasks</div>
            </div>
            
            <div class="kpi-card">
              <div class="kpi-header">
                <span class="kpi-label">Total Expenses</span>
                <span class="kpi-icon">💰</span>
              </div>
              <div class="kpi-value">৳${data.metrics.totalExpenses.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
              <div class="kpi-trend">Lifetime spend</div>
              <div class="kpi-subtext">All transactions</div>
            </div>
            
            <div class="kpi-card">
              <div class="kpi-header">
                <span class="kpi-label">Monthly Spend</span>
                <span class="kpi-icon">📈</span>
              </div>
              <div class="kpi-value">৳${data.metrics.monthlyExpenses.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
              <div class="kpi-trend">Current month</div>
              <div class="kpi-subtext">${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}</div>
            </div>
          </div>
        </div>
        
        ` : ''}
        <!-- Categories -->
        ${
          data.categories && data.categories.length > 0
            ? `
        <div class="section">
          <div class="section-header">
            <div class="section-icon">💳</div>
            <h2 class="section-title">Expense Distribution</h2>
          </div>
          <div class="categories-container">
            <div class="categories-header">
              <span>Category</span>
              <span style="text-align: right;">Amount</span>
              <span style="text-align: right;">Share</span>
            </div>
            ${data.categories
              .map(
                (cat) => `
            <div class="category-item">
              <div class="category-info">
                <span class="category-name">${cat.name}</span>
                <div class="progress-container">
                  <div class="progress-bar" style="width: ${cat.percentage}%"></div>
                </div>
              </div>
              <span class="category-amount">৳${Number(cat.total).toLocaleString(undefined, {maximumFractionDigits: 0})}</span>
              <span class="category-percentage">${cat.percentage}%</span>
            </div>
            `
              )
              .join('')}
          </div>
        </div>
        `
            : ''
        }
        
        <!-- Summary -->
        <div class="section">
          <div class="summary-box">
            <div class="summary-title">
              <span>📋</span>
              Executive Summary
            </div>
            <div class="summary-text">
              This comprehensive analytics report covers your activity for <span class="highlight">${data.period}</span>. 
              You've tracked <span class="highlight">${data.metrics.totalTasks} tasks</span> with a completion rate of 
              <span class="highlight">${data.metrics.completionRate}%</span>. Total expenses amount to 
              <span class="highlight">৳${data.metrics.totalExpenses.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>, 
              with monthly spending at <span class="highlight">৳${data.metrics.monthlyExpenses.toLocaleString(undefined, {maximumFractionDigits: 0})}</span>.
              ${data.categories && data.categories.length > 0 ? `The largest expense category is <span class="highlight">${data.categories[0].name}</span> representing ${data.categories[0].percentage}% of total spending.` : ''}
            </div>
          </div>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="report-footer">
        <div class="footer-left">
          <span class="footer-logo">TaskFlow</span>
          <span class="footer-tagline">• Productivity & Finance Analytics</span>
        </div>
        <div class="footer-right">
          <span class="page-number">Page 1 of 1</span> • Confidential
        </div>
      </div>
    </div>
  </body>
</html>`;

  const options = {
    margin: [10, 10, 10, 10] as [number, number, number, number],
    filename: `Report-${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { 
      scale: 2.5, 
      backgroundColor: '#ffffff', 
      useCORS: true,
      logging: false,
      letterRendering: true
    },
    jsPDF: { 
      orientation: 'portrait' as const, 
      unit: 'mm' as const, 
      format: 'a4' as const,
      compress: true
    },
    pagebreak: { mode: ['css', 'legacy'] }
  } as const;

  try {
    // Create iframe for isolated rendering
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.top = '-9999px';
    iframe.style.left = '-9999px';
    iframe.style.width = '210mm';
    iframe.style.height = '297mm';
    iframe.style.border = 'none';
    iframe.style.backgroundColor = '#ffffff';
    
    document.body.appendChild(iframe);
    
    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!iframeDoc) throw new Error('Cannot access iframe document');
    
    iframeDoc.open();
    iframeDoc.write(htmlContent);
    iframeDoc.close();
    
    // Wait for fonts and styles to load
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Generate PDF
    const element = iframeDoc.body;
    const worker = html2pdf().set(options).from(element);
    
    await worker.save();
    
    // Cleanup
    setTimeout(() => {
      if (iframe.parentNode) {
        document.body.removeChild(iframe);
      }
    }, 100);
    
  } catch (error) {
    console.error('PDF Generation Error:', error);
    throw new Error(`Failed to generate report: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};
