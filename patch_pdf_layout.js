const fs = require('fs');

const FILE_PATH = './frontend/src/pages/StockManagerPage.jsx';
let content = fs.readFileSync(FILE_PATH, 'utf8');

// 1. Add logo state
if (!content.includes('shopLogoPath')) {
  content = content.replace('const [shopName, setShopName] = useState("");', 'const [shopName, setShopName] = useState("");\n  const [shopLogoPath, setShopLogoPath] = useState("");');
}

// 2. Add logo fetching
content = content.replace('if (data.shopName) setShopName(data.shopName);', 'if (data.shopName) setShopName(data.shopName);\n      if (data.shopLogoPath) setShopLogoPath(data.shopLogoPath);');

// remove duplicated setter if any
content = content.replace('      if (data.shopName) setShopName(data.shopName);\n      if (data.shopName) setShopName(data.shopName);', '      if (data.shopName) setShopName(data.shopName);');

// 3. Update Download Function 
// Using async download function so we can fetch image as base64 first
const regex = /const downloadReport = \(date, dateBatches\) => \{[\s\S]*?doc\.save\([^)]*\);\s*\};/;

const newDownloadFunc = `const downloadReport = async (date, dateBatches) => {
    const doc = new jsPDF();
    const title = \`\${shopName || "Store"} - Batch Report\`;
    const subtitle = \`Date: \${date}\`;
    
    // Top middle for shop name
    doc.setFontSize(18);
    const titleWidth = doc.getStringUnitWidth(title) * doc.internal.getFontSize() / doc.internal.scaleFactor;
    const xOffset = (doc.internal.pageSize.width - titleWidth) / 2;
    doc.text(title, xOffset, 20);

    doc.setFontSize(12);
    doc.text(subtitle, 14, 28);

    // Try loading logo if it exists
    if (shopLogoPath) {
      try {
        const createImgBase64 = async (url) => {
          const res = await fetch(url);
          const blob = await res.blob();
          return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
        };
        const logoBase64 = await createImgBase64(shopLogoPath);
        // Add to top right (adjust coordinates based on standard A4 size 210x297)
        // Draw image and simulate round by not drawing standard rectangle or using circle paths clipping (jsPDF native round circles are complex for raster images, typically just scaled sq)
        // Note: jsPDF doesnt natively support circular clipping paths for images easily, using standard jpeg scaled
        doc.addImage(logoBase64, 'JPEG', 180, 10, 15, 15);
      } catch (err) {
        console.error('Could not load logo for PDF', err);
      }
    }

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

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [40, 40, 40] }
    });

    doc.save(\`Report_\${date.replace(/\\//g, '-')}.pdf\`);
  };`;

content = content.replace(regex, newDownloadFunc);

fs.writeFileSync(FILE_PATH, content, 'utf8');
console.log('PDF Layout updated');
