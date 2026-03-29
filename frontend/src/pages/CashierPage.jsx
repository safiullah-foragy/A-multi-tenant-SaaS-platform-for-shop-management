import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import api, { setAuthToken } from "../api";
import "../styles/app.css";

const CashierPage = () => {
  const navigate = useNavigate();
  const [sales, setSales] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [billRows, setBillRows] = useState([]);
  const [billTotal, setBillTotal] = useState(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUnauthorized = () => {
    setAuthToken(null);
    navigate("/");
  };

  const loadSales = async () => {
    try {
      const { data } = await api.get("/api/sales/list");
      setSales(data.sales || []);
    } catch (err) {
      if (err.response?.status === 401) {
        handleUnauthorized();
      }
    }
  };

  useEffect(() => {
    loadSales();
  }, [navigate]);

  const recalculateBillTotal = (rows) => {
    const total = rows.reduce((sum, row) => sum + (Number(row.total) || 0), 0);
    setBillTotal(total);
  };

  const resolveBarcodeRow = async (barcode, quantity = 1) => {
    const { data } = await api.post("/api/sales/resolve-barcode", {
      barcode,
      quantity
    });
    return data.row;
  };

  const addBarcodeRow = async (event) => {
    event.preventDefault();
    setMessage("");
    const barcode = barcodeInput.trim();

    if (!barcode) {
      setMessage("Please enter barcode first.");
      return;
    }

    try {
      setLoading(true);
      const row = await resolveBarcodeRow(barcode, 1);
      const nextRows = [...billRows, row];
      setBillRows(nextRows);
      recalculateBillTotal(nextRows);
      setBarcodeInput("");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to load barcode details.");
    } finally {
      setLoading(false);
    }
  };

  const updateRowQuantity = async (rowIndex, quantityValue) => {
    const quantity = Number(quantityValue);
    const original = billRows[rowIndex];
    const nextRows = [...billRows];

    if (!original) return;

    nextRows[rowIndex] = {
      ...original,
      quantity: quantityValue
    };
    setBillRows(nextRows);

    if (!Number.isInteger(quantity) || quantity <= 0) {
      recalculateBillTotal(nextRows.map((row, index) => index === rowIndex ? { ...row, total: 0 } : row));
      return;
    }

    try {
      setLoading(true);
      const resolved = await resolveBarcodeRow(original.productBarcode, quantity);
      const recalculatedRows = [...nextRows];
      recalculatedRows[rowIndex] = resolved;
      setBillRows(recalculatedRows);
      recalculateBillTotal(recalculatedRows);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to recalculate quantity.");
    } finally {
      setLoading(false);
    }
  };

  const removeRow = (rowIndex) => {
    const nextRows = billRows.filter((_, index) => index !== rowIndex);
    setBillRows(nextRows);
    recalculateBillTotal(nextRows);
  };

  const createBill = async () => {
    setMessage("");

    if (billRows.length === 0) {
      setMessage("Please add at least one barcode to create bill.");
      return;
    }

    const invalidRow = billRows.find((row) => !Number.isInteger(Number(row.quantity)) || Number(row.quantity) <= 0);
    if (invalidRow) {
      setMessage("All quantities must be positive numbers.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await api.post("/api/sales/create-bill", {
        items: billRows.map((row) => ({
          barcode: row.productBarcode,
          quantity: Number(row.quantity)
        }))
      });

      setMessage(`${data.message || "Bill created successfully."} Bill number: ${data.billNumber}`);
      setBillRows([]);
      setBillTotal(0);
      loadSales();
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to create bill.");
    } finally {
      setLoading(false);
    }
  };

  const printBill = async (sale) => {
    try {
      setLoading(true);
      
      // Fetch shop info
      let shop = null;
      try {
        const { data: shopData } = await api.get("/api/shops/by-cashier");
        shop = shopData.shop;
      } catch (err) {
        console.log("Could not fetch shop info");
      }

      const doc = new jsPDF({ format: "a4" });
      const pageWidth = doc.internal.pageSize.getWidth();
      let yPosition = 10;

      // Add shop name at top center
      doc.setFontSize(14);
      doc.setFont(undefined, "bold");
      const shopNameX = pageWidth / 2;
      const shopName = shop?.shopName || "Shop";
      doc.text(shopName, shopNameX, yPosition + 8, { align: "center" });
      
      yPosition += 20;

      // Bill details
      doc.setFontSize(9);
      doc.setFont(undefined, "normal");
      doc.text(`Bill #${sale.billNumber}`, 10, yPosition);
      yPosition += 5;
      doc.text(`Seller: ${sale.seller}`, 10, yPosition);
      yPosition += 5;
      doc.text(`Date: ${new Date(sale.sellingDate).toLocaleString()}`, 10, yPosition);
      yPosition += 10;

      // Products Table
      const tableColumn = ["Product Name", "Stock Date", "Barcode", "Qty", "MRP", "Discount", "Total"];
      const tableRows = [];

      sale.rows.forEach((row) => {
        tableRows.push([
          row.productId?.name || "Unknown",
          new Date(row.batchCreatedAt).toLocaleDateString(),
          row.productId?.barcode || row.barcode || "N/A",
          row.quantity,
          row.mrp,
          row.discount || 0,
          row.total
        ]);
      });

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: yPosition,
        theme: "grid",
        styles: {
          fontSize: 7,
          cellPadding: 2,
          overflow: "linebreak",
          halign: "center"
        },
        headStyles: {
          fillColor: [40, 40, 40],
          textColor: [255, 255, 255],
          fontSize: 8,
          halign: "center"
        },
        columnStyles: {
          0: { cellWidth: 35, halign: "left" },
          1: { cellWidth: 28, halign: "center" },
          2: { cellWidth: 22, halign: "center" },
          3: { cellWidth: 12, halign: "center" },
          4: { cellWidth: 12, halign: "center" },
          5: { cellWidth: 15, halign: "center" },
          6: { cellWidth: 15, halign: "center" }
        },
        margin: { left: 5, right: 5, top: 5, bottom: 5 }
      });

      // Total Bill - positioned under the Total column
      const finalY = doc.lastAutoTable?.finalY || yPosition + 50;
      
      // Calculate position under the Total column
      // Table structure: left margin (5) + all columns up to Total (129) + Total column (15)
      // Total column center is approximately at x = 136
      const totalColumnX = 136;
      
      doc.setFontSize(10);
      doc.setFont(undefined, "bold");
      doc.text("Total Bill:", 10, finalY + 5);
      doc.text(`${sale.total}`, totalColumnX, finalY + 5, { align: "center" });

      // Add shop logo at top right
      if (shop && shop.shopLogoPath) {
        const logoUrl = shop.shopLogoPath;
        const logoSize = 20;
        const logoX = pageWidth - logoSize - 12;
        const logoY = 12;
        
        try {
          // Add the logo image
          doc.addImage(logoUrl, "JPEG", logoX, logoY, logoSize, logoSize);
        } catch (err) {
          console.log("Could not load logo image:", err);
        }
      }

      // Save PDF
      doc.save(`Bill_${sale.billNumber}.pdf`);
      setMessage("Bill printed successfully");
    } catch (err) {
      console.error("Error printing bill:", err);
      setMessage("Failed to print bill: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthToken(null);
    navigate("/");
  };

  return (
    <div className="page-shell" style={{ padding: "2rem" }}>
      <header className="home-header" style={{ marginBottom: "1.5rem" }}>
        <h1 style={{ margin: 0 }}>Cashier Dashboard</h1>
        <button className="primary" onClick={handleLogout}>Logout</button>
      </header>

      <section className="card" style={{ marginBottom: "1.5rem" }}>
        <h2>Create Bill</h2>
        <form className="stack" onSubmit={addBarcodeRow}>
          <label>
            Product Barcode
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Scan or type barcode"
            />
          </label>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button type="submit" disabled={loading}>Add Barcode Row</button>
            <button type="button" onClick={createBill} disabled={loading}>Create Bill</button>
          </div>
        </form>
        {message && <p className="message">{message}</p>}
      </section>

      <section className="card" style={{ marginBottom: "1.5rem" }}>
        <h3>Current Bill Rows</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>billNumber</th>
              <th>shopId</th>
              <th>productBarcode</th>
              <th>batchId</th>
              <th>mrp</th>
              <th>quantity</th>
              <th>discount</th>
              <th>total</th>
              <th>seller</th>
              <th>sellingDate</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {billRows.length === 0 ? (
              <tr>
                <td colSpan="12">Insert barcode from the top box to add bill rows automatically.</td>
              </tr>
            ) : (
              billRows.map((row, index) => (
                <tr key={`${row.productBarcode}-${row.batchId}-${index}`}>
                  <td>(next)</td>
                  <td>{row.shopId}</td>
                  <td>{row.productBarcode}</td>
                  <td>{row.batchId}</td>
                  <td>{row.mrp}</td>
                  <td>
                    <input
                      type="number"
                      min="1"
                      value={row.quantity}
                      onChange={(e) => updateRowQuantity(index, e.target.value)}
                      style={{ width: "90px" }}
                    />
                  </td>
                  <td>{row.discount}</td>
                  <td>{row.total}</td>
                  <td>{row.seller}</td>
                  <td>{new Date(row.sellingDate).toLocaleString()}</td>
                  <td>
                    <button type="button" className="secondary" onClick={() => removeRow(index)}>Remove</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <p style={{ marginTop: "0.75rem" }}>
          <strong>Total Sum:</strong> {billTotal}
        </p>
      </section>

      <section className="card">
        <h3>Recent Sales</h3>
        {sales.length === 0 ? (
          <p>No sales yet.</p>
        ) : (
          sales.map((sale) => (
            <div key={sale.billNumber} style={{ marginBottom: "2rem", padding: "1rem", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px" }}>
              {/* Bill Header Info - No Table */}
              <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <p style={{ margin: "0.25rem 0", fontSize: "0.95rem" }}><strong>Bill Number:</strong> {sale.billNumber}</p>
                  <p style={{ margin: "0.25rem 0", fontSize: "0.95rem" }}><strong>Seller:</strong> {sale.seller}</p>
                  <p style={{ margin: "0.25rem 0", fontSize: "0.95rem" }}><strong>Date:</strong> {new Date(sale.sellingDate).toLocaleString()}</p>
                </div>
                <button 
                  onClick={() => printBill(sale)}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: "#2196f3",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: "bold",
                    fontSize: "0.9rem",
                    whiteSpace: "nowrap"
                  }}
                >
                  🖨️ Print Bill
                </button>
              </div>

              {/* Products Table */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid rgba(255,255,255,0.2)", backgroundColor: "rgba(255,255,255,0.05)" }}>
                      <th style={{ padding: "0.75rem", textAlign: "left" }}>Product Name</th>
                      <th style={{ padding: "0.75rem", textAlign: "left" }}>Stock Date</th>
                      <th style={{ padding: "0.75rem", textAlign: "left" }}>Barcode</th>
                      <th style={{ padding: "0.75rem", textAlign: "center" }}>Quantity</th>
                      <th style={{ padding: "0.75rem", textAlign: "center" }}>MRP</th>
                      <th style={{ padding: "0.75rem", textAlign: "center" }}>Discount</th>
                      <th style={{ padding: "0.75rem", textAlign: "right" }}>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sale.rows.map((row, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                        <td style={{ padding: "0.75rem" }}>{row.productId?.name || "Unknown"}</td>
                        <td style={{ padding: "0.75rem", fontSize: "0.85rem" }}>{new Date(row.batchCreatedAt).toLocaleString()}</td>
                        <td style={{ padding: "0.75rem" }}>{row.productId?.barcode || row.barcode || "N/A"}</td>
                        <td style={{ padding: "0.75rem", textAlign: "center" }}>{row.quantity}</td>
                        <td style={{ padding: "0.75rem", textAlign: "center" }}>{row.mrp}</td>
                        <td style={{ padding: "0.75rem", textAlign: "center" }}>{row.discount || 0}</td>
                        <td style={{ padding: "0.75rem", textAlign: "right" }}>{row.total}</td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr style={{ borderTop: "2px solid rgba(255,255,255,0.3)", backgroundColor: "rgba(255,255,255,0.08)", fontWeight: "bold" }}>
                      <td colSpan="6" style={{ padding: "0.75rem", textAlign: "right" }}>Total Bill:</td>
                      <td style={{ padding: "0.75rem", textAlign: "right" }}>{sale.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default CashierPage;
