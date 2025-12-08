const fs = require('fs');
const path = require('path');

// PDF generation script for the project report
// This script converts the markdown report to PDF format

const generatePDFReport = () => {
  console.log('📊 Generating comprehensive PDF report for Diabetes Tracker project...');
  
  // Check if markdown report exists
  const reportPath = path.join(__dirname, 'project-report.md');
  
  if (!fs.existsSync(reportPath)) {
    console.error('❌ project-report.md not found. Please ensure the report file exists.');
    return;
  }
  
  console.log('✅ Report markdown file found');
  console.log('📝 Report includes:');
  console.log('   • Executive Summary');
  console.log('   • Technical Architecture Analysis');
  console.log('   • Feature Deep Dive');
  console.log('   • Performance Metrics');
  console.log('   • Security Assessment');
  console.log('   • User Experience Analysis');
  console.log('   • Data Management Strategy');
  console.log('   • Deployment Documentation');
  console.log('   • Code Quality Review');
  console.log('   • Future Recommendations');
  
  console.log('\n🔧 To convert to PDF, you can use one of these methods:');
  console.log('1. Install markdown-pdf: npm install -g markdown-pdf');
  console.log('   Then run: markdown-pdf project-report.md');
  console.log('');
  console.log('2. Use Pandoc: pandoc project-report.md -o diabetes-tracker-report.pdf');
  console.log('');
  console.log('3. Use online converters like:');
  console.log('   • https://www.markdowntopdf.com/');
  console.log('   • https://md2pdf.netlify.app/');
  console.log('');
  console.log('4. Use VS Code extensions like "Markdown PDF"');
  
  // Create a simple HTML version for browser printing
  const markdownContent = fs.readFileSync(reportPath, 'utf8');
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Diabetes Tracker - Project Report</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        h1 { color: #2563eb; border-bottom: 3px solid #2563eb; padding-bottom: 10px; }
        h2 { color: #1e40af; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px; }
        h3 { color: #1e3a8a; }
        code { 
            background: #f3f4f6; 
            padding: 2px 4px; 
            border-radius: 3px;
            font-family: 'Monaco', 'Consolas', monospace;
        }
        pre { 
            background: #f9fafb; 
            padding: 15px; 
            border-radius: 5px;
            border-left: 4px solid #2563eb;
            overflow-x: auto;
        }
        blockquote {
            border-left: 4px solid #e5e7eb;
            margin: 0;
            padding-left: 20px;
            color: #6b7280;
        }
        table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
        }
        th, td {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            text-align: left;
        }
        th {
            background: #f9fafb;
            font-weight: 600;
        }
        @media print {
            body { margin: 0; padding: 15px; }
            h1 { page-break-before: always; }
            h1:first-child { page-break-before: avoid; }
        }
    </style>
</head>
<body>
    <pre>${markdownContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
    <script>
        // Simple markdown to HTML conversion for basic formatting
        const content = document.querySelector('pre');
        let html = content.innerHTML;
        
        // Headers
        html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
        html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
        html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
        html = html.replace(/^#### (.*$)/gm, '<h4>$1</h4>');
        
        // Bold and italic
        html = html.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
        html = html.replace(/\\*(.*?)\\*/g, '<em>$1</em>');
        
        // Code blocks
        html = html.replace(/\`\`\`([\\s\\S]*?)\`\`\`/g, '<pre><code>$1</code></pre>');
        html = html.replace(/\`(.*?)\`/g, '<code>$1</code>');
        
        // Lists
        html = html.replace(/^- (.*$)/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\\/li>)/s, '<ul>$1</ul>');
        
        content.innerHTML = html;
        content.style.whiteSpace = 'normal';
    </script>
</body>
</html>`;
  
  const htmlPath = path.join(__dirname, 'diabetes-tracker-report.html');
  fs.writeFileSync(htmlPath, htmlContent);
  
  console.log(`\n✅ HTML version created: ${htmlPath}`);
  console.log('💡 You can open this HTML file in your browser and use "Print to PDF" for a formatted PDF');
  
  return {
    markdownPath: reportPath,
    htmlPath: htmlPath,
    success: true
  };
};

// Run the script
if (require.main === module) {
  generatePDFReport();
}

module.exports = { generatePDFReport };