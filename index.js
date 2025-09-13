import express from "express";
import { google } from "googleapis";

const app = express();
app.use(express.json());

// โหลด credential จาก ENV
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// Spreadsheet & Ranges
const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const DATA_RANGE = "data!A:Z";
const ADDRESS_RANGE = "address!A:Z";
const CAR_RANGE = "carNumber!A:Z";
const TYPE_RANGE = "woodType!A:Z";

// sheetId mapping
const SHEET_IDS = { data: 0, address: 1, carNumber: 2, woodType: 3 };

// Helper function to get range by sheet name
const getRange = (sheet) => {
  const map = { data: DATA_RANGE, address: ADDRESS_RANGE, carNumber: CAR_RANGE, woodType: TYPE_RANGE };
  return map[sheet];
};
const getSheetId = (sheet) => SHEET_IDS[sheet];

// --- GET ---
app.get("/data", async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: DATA_RANGE,
    });
    res.json(result.data.values);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/address", async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: ADDRESS_RANGE,
    });
    res.json(result.data.values);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/car", async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: CAR_RANGE,
    });
    res.json(result.data.values);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/type", async (req, res) => {
  try {
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: TYPE_RANGE,
    });
    res.json(result.data.values);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- POST ---
app.post("/data", async (req, res) => {
  try {
    const { values } = req.body; // expects [[col1, col2, ...]]
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: DATA_RANGE,
      valueInputOption: "RAW",
      requestBody: { values },
    });
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/address", async (req, res) => {
  try {
    const { values } = req.body;
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: ADDRESS_RANGE,
      valueInputOption: "RAW",
      requestBody: { values },
    });
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/car", async (req, res) => {
  try {
    const { values } = req.body;
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: CAR_RANGE,
      valueInputOption: "RAW",
      requestBody: { values },
    });
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/type", async (req, res) => {
  try {
    const { values } = req.body;
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: TYPE_RANGE,
      valueInputOption: "RAW",
      requestBody: { values },
    });
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PUT & DELETE ---
// ทำตาม pattern เดียวกับ GET/POST แยก route ทีละ sheet
// ตัวอย่าง PUT สำหรับ /data/:id
app.put("/data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { values } = req.body;
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: DATA_RANGE,
    });
    const rows = result.data.values;
    const idx = rows.findIndex(r => r[0] === id);
    if (idx === -1) return res.status(404).json({ error: "not found" });
    rows[idx] = values;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `data!A${idx + 1}:Z${idx + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [rows[idx]] },
    });
    res.json({ status: "updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE ตัวอย่าง /data/:id
app.delete("/data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sheetId = getSheetId("data");

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: DATA_RANGE,
    });
    const rows = result.data.values;
    const idx = rows.findIndex(r => r[0] === id);
    if (idx === -1) return res.status(404).json({ error: "not found" });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: [{
        deleteDimension: { range: { sheetId, dimension: "ROWS", startIndex: idx, endIndex: idx + 1 } }
      }],
    });
    res.json({ status: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Start server ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`));
