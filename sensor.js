const express = require("express");
const { Pool } = require("pg");
const cors = require("cors");
const helmet = require("helmet");
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
// ضع هن ا URL كامل من Neon PostgreSQL
const DATABASE_URL = "postgresql://neondb_owner:npg_91ugFqejVBCl@ep-sweet-mountain-agbgw75w-pooler.c-2.eu-central-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
const pool = new Pool({
connectionString: DATABASE_URL,
ssl: { rejectUnauthorized: false } // ضروري لاتصال Neon
});
// إنشاء جدول إذا لم يكن موجود
const createTable = `
CREATE TABLE IF NOT EXISTS sensor_data (
id SERIAL PRIMARY KEY,
spo2 INT,
heart_rate INT,
timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;
pool.query(createTable).catch(err => console.error(err));
// استقبال بيانات ESP32
app.post("/api/sensor", async (req, res) => {
const { spo2, heart_rate } = req.body;
if (spo2 === undefined || heart_rate === undefined) {
return res.status(400).json({ message: "Missing sensor data" });
}
try {
const query = "INSERT INTO sensor_data (spo2, heart_rate) VALUES ($1, $2) RETURNING *";
const values = [spo2, heart_rate];
const result = await pool.query(query, values);
res.status(200).json({ message: "Data saved", data: result.rows[0] });
} catch (err) {
console.error(err);
res.status(500).json({ message: "Error saving data", error: err });
}
});
// تشغيل السيرفر
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
