require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const db = require("./db");

app.use(cors());
app.use(express.json());

let departments = []; // temporary DB


/* ================== Admin Side -----  DEPARTMENT ================== */

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


/* ================== EMPLOYEE ================== */

// ➤ Add Employee
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


// ➤ Get Employees (JOIN)
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


// ➤ Delete Employee
app.delete("/employees/:id", (req, res) => {
  db.query("DELETE FROM employees WHERE id=?", [req.params.id], (err) => {
    if (err) return res.json(err);
    res.json({ message: "Deleted" });
  });
});


// ➤ Edit Employee
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


/* ================== Task ================== */

// ➤ Add Task
app.post("/add-task", (req, res) => {

  const {
    deptId, employeeId, priority, title,
    description, endDate, file
  } = req.body;

// ================= INSERT TASK =================

  const sql = `
    INSERT INTO tasks
    (dept_id, employee_id, priority, title, description, end_date, file)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      deptId, employeeId, priority, title, description, endDate, file
    ],
    (err, result) => {

      if (err) {

        console.log(err);

        return res.status(500).json(err);

      }

// ================= INSERT NOTIFICATION =================

    const message = `New Task Assigned: ${title}`;

      const notificationSql = `
        INSERT INTO notifications
        (employee_id, message)
        VALUES (?, ?)
      `;

      db.query(
        notificationSql,
        [
          employeeId, message
        ],
        (err2, result2) => {

          if(err2){

            console.log(err2);

            return res.status(500).json(err2);

          }

          res.json({
            message:
              "Task Added Successfully"
          });

        }
      );

    }
  );

});



// ➤ Get Tasks
app.get("/tasks", (req, res) => {

  const sql = `
    SELECT 
      t.*, d.name AS department,
      e.name AS employee

    FROM tasks t

    JOIN departments d
    ON t.dept_id = d.id

    JOIN employees e
    ON t.employee_id = e.id
  `;

  db.query(sql, (err, result) => {

    if (err) return res.json(err);

    res.json(result);

  });

});



// ➤ Delete Task
app.delete("/tasks/:id", (req, res) => {

  db.query(
    "DELETE FROM tasks WHERE id=?",
    [req.params.id],
    (err) => {

      if (err) return res.json(err);

      res.json({
        message: "Task Deleted"
      });

    }
  );

});



// ➤ Update Task Status
app.put("/tasks/status/:id", (req, res) => {

  const { status } = req.body;

  db.query(
    "UPDATE tasks SET status=? WHERE id=?",
    [status, req.params.id],
    (err) => {

      if (err) return res.json(err);

      res.json({
        message: "Status Updated"
      });

    }
  );

});



// ➤ Edit Task
app.put("/tasks/:id", (req, res) => {

  const { title } = req.body;

  db.query(
    "UPDATE tasks SET title=? WHERE id=?",
    [title, req.params.id],
    (err) => {

      if (err) return res.json(err);

      res.json({
        message: "Task Updated"
      });

    }
  );

});



// ================= GET Employee ALL TASKS =================

app.get("/tasks", (req, res) => {

    const sql =
        "SELECT * FROM tasks";

    db.query(sql, (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                error: "Database error"
            });

        }

        res.json(result);

    });

});



// ================= Employsee side ----- EMPLOYEE LOGIN =================

app.post("/employee-login", (req, res) => {

    const { empId, password } = req.body;

    const sql =
        "SELECT * FROM employees WHERE emp_id = ? AND password = ?";

    db.query(sql, [empId, password], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                success: false,
                message: "Database error"
            });

        }


// ================= LOGIN SUCCESS =================

        if (result.length > 0) {

            res.json({
                success: true,
                message: "Login successful",
                employee: result[0]
            });

        }


// ================= LOGIN FAILED =================

        else {

            res.json({
                success: false,
                message: "Invalid Employee ID or Password"
            });

        }

    });

});


// ================= GET EMPLOYEE TASKS =================

app.get("/employee-tasks/:employeeId", (req, res) => {

  const employeeId = req.params.employeeId;

  const sql = `
    SELECT
      tasks.*,
      departments.name AS department_name,
      employees.name AS employee_name
    FROM tasks
    LEFT JOIN departments
      ON tasks.dept_id = departments.id
    LEFT JOIN employees
      ON tasks.employee_id = employees.id
    WHERE tasks.employee_id = ?
  `;

  db.query(sql, [employeeId], (err, result) => {

    if (err) {
      console.log(err);
      return res.status(500).json({
        message: "Error fetching tasks"
      });
    }

    res.json(result);

  });

});



// ➤ Edit Task
app.get("/task/:id", (req,res)=>{

  const sql =
  "SELECT * FROM tasks WHERE id=?";

  db.query(sql,[req.params.id],(err,result)=>{

    if(err){
      return res.status(500).json(err);
    }

    res.json(result[0]);

  });

});



// ➤ update Task
app.put("/update-task/:id", (req, res) => {

  const taskId = req.params.id;

  const {
    remark, progress, status
  } = req.body;

// UPDATE MAIN TASK TABLE

  const updateSql = `
    UPDATE tasks
    SET
      remark = ?,
      progress = ?,
      status = ?
    WHERE id = ?
  `;

  db.query(
    updateSql,
    [
      remark, progress, status, taskId
    ],
    (err, result) => {

      if (err) {
        return res.status(500).json(err);
      }

// INSERT HISTORY

      const historySql = `
        INSERT INTO task_history
        (task_id, remark, progress,status)
        VALUES (?, ?, ?, ?)
      `;

      db.query(
        historySql,
        [
          taskId, remark, progress, status
        ],
        (err2, result2) => {

          if (err2) {
            return res.status(500).json(err2);
          }

          res.json({
            message: "Task Updated Successfully"
          });

        }
      );

    }
  );

});



// ➤ Task history 
app.get("/task-history/:taskId", (req, res) => {

  const sql = `
    SELECT *
    FROM task_history
    WHERE task_id = ?
    ORDER BY id ASC
  `;

  db.query(
    sql,
    [req.params.taskId],
    (err, result) => {

      if (err) {
        return res.status(500).json(err);
      }

      res.json(result);

    }
  );

});



// ➤ Employee Side notifications bill icon
app.get("/employee-notifications/:employeeId", (req, res) => {

  const sql = `
    SELECT *
    FROM notifications
    WHERE employee_id = ?
    ORDER BY id DESC
    LIMIT 5
  `;

  db.query(
    sql,
    [req.params.employeeId],
    (err, result) => {

      if(err){

        console.log(err);

        return res.status(500).json(err);

      }

      res.json(result);

    }
  );

});



// ➤ Employee Side notifications bill icon - Count
app.get("/notification-count/:employeeId", (req, res) => {

  const sql = `
    SELECT COUNT(*) AS total
    FROM notifications
    WHERE employee_id = ?
    AND is_read = 0
  `;

  db.query(
    sql,
    [req.params.employeeId],
    (err, result) => {

      if(err){

        console.log(err);

        return res.status(500).json(err);

      }

      res.json(result[0]);

    }
  );

});



// ➤ Employee Side notifications bill icon - Mark Read
app.put("/mark-notifications-read/:employeeId", (req, res) => {

  const sql = `
    UPDATE notifications
    SET is_read = 1
    WHERE employee_id = ?
  `;

  db.query(
    sql,
    [req.params.employeeId],
    (err, result) => {

      if(err){

        console.log(err);

        return res.status(500).json(err);

      }

      res.json({
        message: "Notifications marked as read"
      });

    }
  );

});


/*--------------------------
          Start server
  --------------------------*/

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});