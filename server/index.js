require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const pool = require("./db.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth = require("./middleware");

app.use(cors());
app.use(express.json());

app.post("/api/users/register", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length > 0) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (email, password) VALUES($1, $2) RETURNING *",
      [email, hashedPassword]
    );

    const payload = {
      user: {
        id: newUser.rows[0].user_id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server error" });
  }
});

app.post("/api/users/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.rows[0].password);
    if (!isMatch) {
      return res.status(400).json({ msg: "Invalid credentials" });
    }

    const payload = {
      user: {
        id: user.rows[0].user_id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.get("/api/users/me", auth, async (req, res) => {
  try {
    const user = await pool.query(
      "SELECT user_id, email, created_at FROM users WHERE user_id = $1",
      [req.user.id]
    );
    res.json(user.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.post("/todos", auth, async (req, res) => {
  try {
    const { description } = req.body;
    const newTodo = await pool.query(
      "INSERT INTO todo (description, user_id) VALUES($1, $2) RETURNING *",
      [description, req.user.id]
    );
    res.json(newTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.get("/todos", auth, async (req, res) => {
  try {
    const allTodos = await pool.query("SELECT * FROM todo WHERE user_id = $1", [
      req.user.id,
    ]);
    res.json(allTodos.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.get("/todos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const todo = await pool.query(
      "SELECT * FROM todo WHERE todo_id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (todo.rows.length === 0) {
      return res.status(404).json({ msg: "Todo not found or unauthorized" });
    }

    res.json(todo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.put("/todos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { description } = req.body;

    const todo = await pool.query(
      "SELECT * FROM todo WHERE todo_id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (todo.rows.length === 0) {
      return res.status(404).json({ msg: "Todo not found or unauthorized" });
    }

    const updateTodo = await pool.query(
      "UPDATE todo SET description = $1 WHERE todo_id = $2 AND user_id = $3 RETURNING *",
      [description, id, req.user.id]
    );

    res.json(updateTodo.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.delete("/todos/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await pool.query(
      "SELECT * FROM todo WHERE todo_id = $1 AND user_id = $2",
      [id, req.user.id]
    );

    if (todo.rows.length === 0) {
      return res.status(404).json({ msg: "Todo not found or unauthorized" });
    }

    await pool.query("DELETE FROM todo WHERE todo_id = $1 AND user_id = $2", [
      id,
      req.user.id,
    ]);

    res.json({ msg: "Todo deleted successfully" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
