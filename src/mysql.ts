const mysql = require("mysql2/promise");

const pool = mysql.createPool({
  host: "localhost",
  user: "taxi_gps",
  password: "uIL~Z4~fiQ?@",
  database: "taxi_gps",
  waitForConnections: true,
});

const getAllCars = async () => {
  const [rows] = await pool.query("SELECT * FROM taxi_gps_cars");
  return rows;
};

const getCarByImei = async (imei: string) => {
  const [rows] = await pool.query(
    "SELECT * FROM taxi_gps_cars WHERE imei = ?",
    [imei]
  );
  console.log(rows);
  return rows[0];
};

const addCar = async (imei: string, reg_number?: string, model?: string) => {
  const [result] = await pool.query(
    "INSERT INTO taxi_gps_cars (imei, reg_number, model) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE imei = imei",
    [imei, reg_number, model]
  );
  return result;
};

const updateData = async (imei: string, data: any) => {
  const [result] = await pool.query(
    "INSERT INTO taxi_gps_cars (imei, blackbox) VALUES (?, ?) ON DUPLICATE KEY UPDATE blackbox = VALUES(blackbox)",
    [imei, data]
  );
  return result;
};

module.exports = {
  pool,
  sql: {
    getAllCars,
    getCarByImei,
    addCar,
    updateData,
  },
};
