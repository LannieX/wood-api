import express from "express";
import { google } from "googleapis";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// --- FIXED CREDENTIALS ---
const credentials = {
  type: "service_account",
  project_id: "woodv2",
  private_key_id: "ff708f52a3b0e00d22a588c039cae6b2f9df7f53",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDhiOakJddbUbjX\nl4bmp4h7udGpau/OwyWDAU3or1NJ8baPBlnIMV/TB6HV3VJm6iVaMES/cPutzCCA\nDzFTVFl0LkWOO2mXyWGk+Zc+Mn9e9ZqadEXeJQcbW1uNS0SwhnHtRyNETU+qzD5P\n1CsBkMoN7Hn9VJObkLLB7gqO43UOdi5UlAt5pY3Qq77alh9QiKOduiia8Ss8X29w\nVxjCEHW6CmZK49fkLrQdeetdmgXO8WHsw9koKQXZhhTzqARpEtMIV5o7k1m7kxWk\nsdH5aeCNiXH2xdwfSEhLcPJvjty8C1s7Og16SDhsRA2vJgbYNeK02EjVDvCYtFSS\nCngOxOEVAgMBAAECggEAKuVwAM6VvG+5uX+/j8VTpzy7jP6i5++kBdvMprIaJFlO\nALwTfYkukaPE+zliP+LPAe1mVgc2R2Mo11KMbi3/6aIXZqsUNWN/J/K0+oZ+RWBv\nbGsrEsp2JJTmv+QOB4k6yAecxJPz0CeSvno7R8vzMlzFAxMAFDmcVlhhN7Y5gGtM\nkCt4Dgf4xY9uJURQ3aoUAtElvSYTS+OdSqrXjDr3x54a0S1K6cILEA15cSrNZ+/R\n8rKB/DhfG3NmdrGZKiBf44iGmfH918IYOi+9miCHPRo/R4TVi7kwpeM/oVvwbOxv\nlIOB7zKRbsFTXvh9eh5NizcLckxRFBLAIGXCZaUAAQKBgQD0BimxaMoqurT7G5Ol\njrYE+Up13rb5fZN7ZuyWj9pskSS1dX9rtWn/XFA95FY3nwRXOkDFqxVWSNURSWPx\nSqL6yNED5XLtOY20iCFtbNq/8SwZ0ykUU6DKKsW8RgIKZd6Bx9FyWOTVSM3cJvo8\nVWzREJEmlfX05Uw91xsy0othFQKBgQDsmnHSptzEYa56iUDoKsqDmLoIVFo5Q0Pz\nQCVQNNRMLqErMLMkGFJgoYYl2fNOolXzIVKyP8PezhvU5jav6GmE06I6XByGrYVO\nyU4+7VRCZw9QgQPBEXy52V1dIUhFmI4lUUDBBzaPvUWj5jHR5FKTDvVHOjwtP/LB\nAO3GgrOAAQKBgQDcCZ6YyYvaocbF0uT82UWKEJwy0uOc7r4I/RMC5K4pTWuTcGK4\nZboxuDTmyjlwKCRK300+sHkp97ygvNOw5QM3LdNDNye9fzMnAcVanVhW0YpZsw2M\ntaf8BDuO/HWkmJzd26ch+8RECkUOadskgkb/8XdhGsHQ1N49uPRejHl/zQKBgHlk\n0IuNE24q1BOIwmWcNuWIAcLuTJBew8lVmw9o25fuwMBhLziQxgtQNHzNM3mf7stc\nyIouDzgMtdjo+RwN+b2tu+mHgxdShjgjLuM4b2fWatQaLavsZfsQ3EdBIUyb9iqN\nYtTm94aOTOHH5L3VEMzk+tG9vkxVKB8Ac/7K5oABAoGBAOjNhWC7LinGOohqnJth\nPJDTf1vw27Fn0ETXXReyN4WJSPYfIvJSfMsvtvYK0kGXB2E4wT/tPpIZqFVV5BC7\ngBFF4BE5X7CB4/qZC+9+zrXFpWnScaaFHJ7zi7frEWJmMYxfPRsIQGi8gAYojfV0\n0TJbg/7DLeCXL/GhxD8krITF\n-----END PRIVATE KEY-----\n",
  client_email: "woodv2@woodv2.iam.gserviceaccount.com",
  client_id: "115036225667138481840",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/woodv2@woodv2.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

// --- Google Auth ---
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
    const { address, woodType, carNumber, weight, price, payBill, dateAt, cutPrice, carryPrice, carPrice, carTPrice, constPrice, profitPrice,totalPrice } = req.body;

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: DATA_RANGE,
      valueInputOption: "RAW",
      requestBody: {
        values: [[address, woodType, carNumber, weight, price, payBill, dateAt, cutPrice, carryPrice, carPrice, carTPrice, constPrice, profitPrice, totalPrice]],
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
