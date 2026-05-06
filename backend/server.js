require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./db");

app.use(cors());
app.use(express.json());

let departments = []; // temporary DB


// ➤ Add Department
app.post("/add-department", (req, res) => {
  const { name } = req.body;

  const sql = "INSERT INTO departments (name) VALUES (?)";
  db.query(sql, [name], (err, result) => {
    if (err) return res.json(err);

    res.json({ message: "Department Added" });
  });
});


// ➤ Get Departments
app.get("/departments", (req, res) => {
  db.query("SELECT * FROM departments", (err, result) => {
    if (err) return res.json(err);

    res.json(result);
  });
});


// ➤ Delete Department
app.delete("/department/:id", (req, res) => {
  const id = req.params.id;

  db.query("DELETE FROM departments WHERE id=?", [id], (err) => {
    if (err) return res.json(err);

    res.json({ message: "Deleted" });
  });
});



// ➤ Edit Department
app.put("/department/:id", (req, res) => {
  const id = req.params.id;
  const { name } = req.body;

  db.query(
    "UPDATE departments SET name=? WHERE id=?",
    [name, id],
    (err) => {
      if (err) return res.json(err);

      res.json({ message: "Updated" });
    }
  );
});





















app.post("/add-employees", (req, res) => {
  const {
    deptId, empId, name, email, phone,
    designation, dob, address, doj,
    description, password, photo
  } = req.body;

  const sql = `
    INSERT INTO employees 
    (dept_id, emp_id, name, email, phone, designation, dob, address, doj, description, password, photo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [
    deptId, empId, name, email, phone,
    designation, dob, address, doj,
    description, password, photo
  ], (err, result) => {
    if (err) return res.json(err);
    res.json({ message: "Employee created successfully" });
  });
});





app.get("/employees", (req, res) => {
  const sql = `
    SELECT e.*, d.name AS department 
    FROM employees e
    JOIN departments d ON e.dept_id = d.id
  `;

  db.query(sql, (err, result) => {
    if (err) return res.json(err);
    res.json(result);
  });
});


app.delete("/employees/:id", (req, res) => {
  db.query("DELETE FROM employees WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json(err);
    res.json({ message: "Deleted" });
  });
});


app.put("/employees/:id", (req, res) => {
  const { name, email } = req.body;

  db.query(
    "UPDATE employees SET name=?, email=? WHERE id=?",
    [name, email, req.params.id],
    (err) => {
      if (err) return res.json(err);
      res.json({ message: "Updated" });
    }
  );
});



// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});