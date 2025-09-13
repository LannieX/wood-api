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

// --- GET ---
app.get("/:sheet(data|address|car|type)", async (req, res) => {
  try {
    const { sheet } = req.params;
    const rangeMap = { data: DATA_RANGE, address: ADDRESS_RANGE, car: CAR_RANGE, type: TYPE_RANGE };
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeMap[sheet],
    });
    res.json(result.data.values);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- POST ---
app.post("/:sheet(data|address|car|type)", async (req, res) => {
  try {
    const { sheet } = req.params;
    const { values } = req.body; // expects [[col1, col2, ...]]
    const rangeMap = { data: DATA_RANGE, address: ADDRESS_RANGE, car: CAR_RANGE, type: TYPE_RANGE };

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeMap[sheet],
      valueInputOption: "RAW",
      requestBody: { values },
    });

    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- PUT ---
app.put("/:sheet(data|address|car|type)/:id", async (req, res) => {
  try {
    const { sheet, id } = req.params;
    const { values } = req.body; // expects [col1, col2, ...]

    const rangeMap = { data: DATA_RANGE, address: ADDRESS_RANGE, car: CAR_RANGE, type: TYPE_RANGE };
    const sheetId = SHEET_IDS[sheet];

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeMap[sheet],
    });

    const rows = result.data.values;
    const idx = rows.findIndex(r => r[0] === id);
    if (idx === -1) return res.status(404).json({ error: "not found" });

    rows[idx] = values;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheet}!A${idx + 1}:Z${idx + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [rows[idx]] },
    });

    res.json({ status: "updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- DELETE ---
app.delete("/:sheet(data|address|car|type)/:id", async (req, res) => {
  try {
    const { sheet, id } = req.params;
    const sheetId = SHEET_IDS[sheet];
    const rangeMap = { data: DATA_RANGE, address: ADDRESS_RANGE, car: CAR_RANGE, type: TYPE_RANGE };

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: rangeMap[sheet],
    });

    const rows = result.data.values;
    const idx = rows.findIndex(r => r[0] === id);
    if (idx === -1) return res.status(404).json({ error: "not found" });

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: [{
        deleteDimension: {
          range: { sheetId, dimension: "ROWS", startIndex: idx, endIndex: idx + 1 }
        }
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
