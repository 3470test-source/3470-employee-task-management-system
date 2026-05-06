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





// Start server
app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});