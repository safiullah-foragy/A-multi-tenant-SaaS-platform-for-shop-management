const fs = require('fs');
let content = fs.readFileSync('frontend/src/pages/AdminPage.jsx', 'utf8');

if (!content.includes('import jsPDF')) {
  content = content.replace(
    'import { useEffect, useState } from "react";',
    'import { useEffect, useState } from "react";\nimport jsPDF from "jspdf";\nimport autoTable from "jspdf-autotable";'
  );
}

const oldGrouping = `  const groupedBatches = batches.reduce((acc, batch) => {
    const d = new Date(batch.createdAt).toLocaleDateString();
    if (!acc[d]) acc[d] = [];
    acc[d].push(batch);
    return acc;
  }, {});`;

const newGrouping = `  const downloadReport = (titleDate, dateBatches) => {
    const doc = new jsPDF();
    const title = 'Store - Batch Report';
    const subtitle = \`Date: \${titleDate}\`;
    
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(12);
    doc.text(subtitle, 14, 28);

    const tableColumn = ["Product Name", "Product ID", "Size", "Quantity", "Cost", "MRP", "Discount", "Created By"];
    const tableRows = [];

    dateBatches.forEach(batch => {
      const batchData = [
        batch.productId?.name || "N/A",
        batch.productId?.barcode || "N/A",
        batch.productId?.size || "N/A",
        batch.quantity,
        batch.costPrice,
        batch.mrp,
        batch.discount || 0,
        batch.creatorName || "Unknown"
      ];
      tableRows.push(batchData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 40, 40] }
    });

    doc.save(\`Report_\${titleDate.replace(/\\//g, '-')}.pdf\`);
  };

  const groupedBatches = batches.reduce((acc, batch) => {
    const d = new Date(batch.createdAt).toLocaleDateString();
    const pName = batch.productId?.name || 'Unknown';
    const groupKey = \`\${d} - \${pName}\`;
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(batch);
    return acc;
  }, {});`;

content = content.replace(oldGrouping, newGrouping);

const oldSort = `{Object.keys(groupedBatches).sort((a,b) => new Date(b) - new Date(a)).map(date => (`;
const newSort = `{Object.keys(groupedBatches).sort((a,b) => new Date(b.split(" - ")[0]) - new Date(a.split(" - ")[0])).map(date => (`;

content = content.replace(oldSort, newSort);

const oldHeader = `<div 
                onClick={() => toggleDate(date)} 
                style={{padding: '1rem', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between'}}
              >
                <strong>{date}</strong>
                <span>{groupedBatches[date].length} batches {expandedDates[date] ? '▲' : '▼'}</span>
              </div>`;

const newHeader = `<div 
                onClick={() => toggleDate(date)} 
                style={{padding: '1rem', cursor: 'pointer', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}
              >
                <strong>{date}</strong>
                <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                  <button 
                    onClick={(e) => { e.stopPropagation(); downloadReport(date, groupedBatches[date]); }} 
                    className="btn-secondary" 
                    style={{fontSize: '0.8rem', padding: '0.2rem 0.6rem'}}
                  >
                    Download Report
                  </button>
                  <span>{groupedBatches[date].length} batches {expandedDates[date] ? '▲' : '▼'}</span>
                </div>
              </div>`;

content = content.replace(oldHeader, newHeader);

fs.writeFileSync('frontend/src/pages/AdminPage.jsx', content);
console.log("Patched successfully");
