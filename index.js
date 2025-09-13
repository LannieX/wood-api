import express from "express";
import { google } from "googleapis";

const app = express();
app.use(express.json());

// โหลด credential (service account JSON)
const credentials = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT);

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

const sheets = google.sheets({ version: "v4", auth });

// กำหนดข้อมูล sheet
const SPREADSHEET_ID = "1BTgtm9OwmICB15NvCLqat-wQqW1dCuc9YY98-V7hvUw";
const DATA_RANGE = "data!A:Z";
const ADDRESS_RANGE = "address!A:Z";
const CAR_RANGE = "carNumber!A:Z";
const TYPE_RANGE = "woodType!A:Z";

// === GET: อ่านข้อมูลทั้งหมด ===
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

// === POST: เพิ่มข้อมูล ===
app.post("/data", async (req, res) => {
  try {
    const { id, name, email } = req.body;
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: DATA_RANGE,
      valueInputOption: "RAW",
      requestBody: {
        values: [[id, name, email]],
      },
    });
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/address", async (req, res) => {
  try {
    const { id, name, email } = req.body;
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: ADDRESS_RANGE,
      valueInputOption: "RAW",
      requestBody: {
        values: [[id, name, email]],
      },
    });
    res.json({ status: "success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === PUT: อัปเดตข้อมูลตาม id ===
app.put("/data/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // อ่านข้อมูลก่อน
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: DATA_RANGE,
    });

    const rows = result.data.values;
    const headers = rows[0];
    const idx = rows.findIndex(r => r[0] === id);

    if (idx === -1) return res.status(404).json({ error: "not found" });

    if (name) rows[idx][1] = name;
    if (email) rows[idx][2] = email;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `address!A${idx + 1}:G${idx + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [rows[idx]] },
    });

    res.json({ status: "updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/address/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    // อ่านข้อมูลก่อน
    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: ADDRESS_RANGE,
    });

    const rows = result.data.values;
    const headers = rows[0];
    const idx = rows.findIndex(r => r[0] === id);

    if (idx === -1) return res.status(404).json({ error: "not found" });

    if (name) rows[idx][1] = name;
    if (email) rows[idx][2] = email;

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `address!A${idx + 1}:G${idx + 1}`,
      valueInputOption: "RAW",
      requestBody: { values: [rows[idx]] },
    });

    res.json({ status: "updated" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// === DELETE: ลบข้อมูลตาม id ===
app.delete("/data/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: DATA_RANGE,
    });

    const rows = result.data.values;
    const idx = rows.findIndex(r => r[0] === id);

    if (idx === -1) return res.status(404).json({ error: "not found" });

    // ลบแถวออก
    const requests = [
      {
        deleteDimension: {
          range: {
            sheetId: 0, // sheet index (0 ถ้าเป็นชีทแรก)
            dimension: "ROWS",
            startIndex: idx,
            endIndex: idx + 1,
          },
        },
      },
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests },
    });

    res.json({ status: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/address/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: ADDRESS_RANGE,
    });

    const rows = result.data.values;
    const idx = rows.findIndex(r => r[0] === id);

    if (idx === -1) return res.status(404).json({ error: "not found" });

    // ลบแถวออก
    const requests = [
      {
        deleteDimension: {
          range: {
            sheetId: 0, // sheet index (0 ถ้าเป็นชีทแรก)
            dimension: "ROWS",
            startIndex: idx,
            endIndex: idx + 1,
          },
        },
      },
    ];

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SPREADSHEET_ID,
      requestBody: { requests },
    });

    res.json({ status: "deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3000, () => console.log("🚀 API running on http://localhost:3000"));
