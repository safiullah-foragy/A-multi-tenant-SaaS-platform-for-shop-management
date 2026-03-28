import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
            <div key={sale.billNumber} style={{ marginBottom: "1rem", padding: "0.75rem", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px" }}>
              <p style={{ margin: 0 }}><strong>Bill Number:</strong> {sale.billNumber}</p>
              <p style={{ margin: "0.25rem 0" }}><strong>Selling Date:</strong> {new Date(sale.sellingDate).toLocaleString()}</p>
              <p style={{ margin: "0.25rem 0" }}><strong>Seller:</strong> {sale.seller}</p>
              <p style={{ margin: 0 }}><strong>Total:</strong> {sale.total}</p>
            </div>
          ))
        )}
      </section>
    </div>
  );
};

export default CashierPage;
