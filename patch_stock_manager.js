const fs = require('fs');

const FILE_PATH = './frontend/src/pages/StockManagerPage.jsx';
let content = fs.readFileSync(FILE_PATH, 'utf8');

// 1. imports
if (!content.includes('jsPDF')) {
  content = content.replace('import "../styles/app.css";', 'import "../styles/app.css";\nimport jsPDF from "jspdf";\nimport "jspdf-autotable";');
}

// 2. state for shopName
if (!content.includes('shopName')) {
  // find const [products, setProducts]
  content = content.replace('const [products, setProducts] = useState([]);', 'const [products, setProducts] = useState([]);\n  const [shopName, setShopName] = useState("");');
}

// 3. getBatches
content = content.replace('setBatches(data.batches);', 'setBatches(data.batches);\n      if (data.shopName) setShopName(data.shopName);');

// 4. Download PDF function
const pdfFunc = `  const downloadReport = (date, dateBatches) => {
    const doc = new jsPDF();
    const title = \`\${shopName || "Store"} - Batch Report\`;
    const subtitle = \`Date: \${date}\`;
    
    doc.setFontSize(18);
    doc.text(title, 14, 20);
    doc.setFontSize(12);
    doc.text(subtitle, 14, 28);

    const tableColumn = ["Product Name", "Product ID", "Size", "Quantity", "Cost", "MRP", "Created By"];
    const tableRows = [];

    dateBatches.forEach(batch => {
      const batchData = [
        batch.productId?.name || "N/A",
        batch.productId?.barcode || "N/A",
        batch.productId?.size || "N/A",
        batch.quantity,
        batch.costPrice,
        batch.mrp,
        batch.creatorName || "Unknown"
      ];
      tableRows.push(batchData);
    });

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 40, 40] }
    });

    doc.save(\`Report_\${date.replace(/\\//g, '-')}.pdf\`);
  };
`;

if (!content.includes('downloadReport')) {
  content = content.replace('const fetchProducts = async () => {', pdfFunc + '\n  const fetchProducts = async () => {');
}

// 5. Download button in UI
const uiBtn = `                        <button 
                          onClick={(e) => { e.stopPropagation(); downloadReport(date, groupedBatches[date]); }} 
                          className="btn-secondary" 
                          style={{fontSize: '0.8rem', padding: '0.2rem 0.6rem'}}
                        >
                          Download Report
                        </button>
                        <span>{groupedBatches[date].length} batches {expandedDates[date] ? '▲' : '▼'}</span>`;

content = content.replace("<span>{groupedBatches[date].length} batches {expandedDates[date] ? '▲' : '▼'}</span>", uiBtn);

fs.writeFileSync(FILE_PATH, content, 'utf8');
console.log('StockManagerPage.jsx patched successfully');
