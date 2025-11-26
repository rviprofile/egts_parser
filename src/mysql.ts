const mysql = require("mysql2/promise");

export const pool = mysql.createPool({
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
  return rows[0];
};

const addCar = async (imei: string, reg_number: string, model: string) => {
  const [result] = await pool.query(
    "INSERT INTO taxi_gps_cars (imei, reg_number, model) VALUES (?, ?, ?)",
    [imei, reg_number, model]
  );
  return result;
};

export const sql = {
  getAllCars,
  getCarByImei,
  addCar,
};
