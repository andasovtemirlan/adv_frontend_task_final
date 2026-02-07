const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const port = 3001;

// PostgreSQL Pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  host: process.env.DB_HOST || 'db',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'project_manager',
});

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Auth middleware - optional, allows requests to proceed without token
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
      next();
    });
  } else {
    next();
  }
};

// Auth endpoints
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email, hashedPassword, name || email]
    );

    const user = result.rows[0];
    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Users endpoints
app.get('/users', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name FROM users ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/users/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, name FROM users WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/users/:id', optionalAuth, async (req, res) => {
  try {
    const { name, email, password } = req.body;
    let updateQuery = 'UPDATE users SET';
    const updateParams = [];
    let paramCount = 1;

    if (name !== undefined) {
      updateQuery += ` name = $${paramCount}`;
      updateParams.push(name);
      paramCount++;
    }
    if (email !== undefined) {
      if (updateParams.length > 0) updateQuery += ',';
      updateQuery += ` email = $${paramCount}`;
      updateParams.push(email);
      paramCount++;
    }
    if (password) {
      if (updateParams.length > 0) updateQuery += ',';
      const hashedPassword = await bcrypt.hash(password, 10);
      updateQuery += ` password = $${paramCount}`;
      updateParams.push(hashedPassword);
      paramCount++;
    }

    updateQuery += ` WHERE id = $${paramCount} RETURNING id, email, name`;
    updateParams.push(req.params.id);

    const result = await pool.query(updateQuery, updateParams);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/users/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Projects endpoints
app.get('/projects', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM projects ORDER BY id'
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/projects/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM projects WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/projects', optionalAuth, async (req, res) => {
  try {
    const { name, description, status, progress } = req.body;
    const result = await pool.query(
      'INSERT INTO projects (name, description, status, progress, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [name, description, status || 'active', progress || 0]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/projects/:id', optionalAuth, async (req, res) => {
  try {
    const { name, description, status, progress } = req.body;
    const result = await pool.query(
      'UPDATE projects SET name = COALESCE($1, name), description = COALESCE($2, description), status = COALESCE($3, status), progress = COALESCE($4, progress), "updatedAt" = NOW() WHERE id = $5 RETURNING *',
      [name, description, status, progress, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/projects/:id', optionalAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE "projectId" = $1', [req.params.id]);
    await pool.query('DELETE FROM projects WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Project Teams endpoints
app.get('/projects/:projectId/teams', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT pt.id, pt."projectId", pt."teamId", t.name, t.description FROM project_teams pt JOIN teams t ON pt."teamId" = t.id WHERE pt."projectId" = $1',
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/projects/:projectId/teams', optionalAuth, async (req, res) => {
  try {
    const { teamId } = req.body;
    const result = await pool.query(
      'INSERT INTO project_teams ("projectId", "teamId") VALUES ($1, $2) RETURNING *',
      [req.params.projectId, teamId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/projects/:projectId/teams/:teamId', optionalAuth, async (req, res) => {
  try {
    await pool.query(
      'DELETE FROM project_teams WHERE "projectId" = $1 AND "teamId" = $2',
      [req.params.projectId, req.params.teamId]
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Positions endpoints
app.get('/teams/:teamId/positions', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM positions WHERE "teamId" = $1 ORDER BY id',
      [req.params.teamId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/teams/:teamId/positions', optionalAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'INSERT INTO positions ("teamId", name, description) VALUES ($1, $2, $3) RETURNING *',
      [req.params.teamId, name, description || '']
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/positions/:id', optionalAuth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const result = await pool.query(
      'UPDATE positions SET name = COALESCE($1, name), description = COALESCE($2, description) WHERE id = $3 RETURNING *',
      [name, description, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Position not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/positions/:id', optionalAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM positions WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Project Team Members endpoints
app.get('/projects/:projectId/team-members', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT ptm.*, u.name, u.email, p.name as "positionName", t.name as "teamName" 
       FROM project_team_members ptm 
       JOIN users u ON ptm."userId" = u.id 
       LEFT JOIN positions p ON ptm."positionId" = p.id 
       LEFT JOIN teams t ON ptm."teamId" = t.id 
       WHERE ptm."projectId" = $1 
       ORDER BY ptm."teamId", ptm.id`,
      [req.params.projectId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/projects/:projectId/team-members', optionalAuth, async (req, res) => {
  try {
    const { teamId, userId, positionId } = req.body;
    const result = await pool.query(
      'INSERT INTO project_team_members ("projectId", "teamId", "userId", "positionId") VALUES ($1, $2, $3, $4) RETURNING *',
      [req.params.projectId, teamId, userId, positionId || null]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/project-team-members/:id', optionalAuth, async (req, res) => {
  try {
    const { positionId } = req.body;
    const result = await pool.query(
      'UPDATE project_team_members SET "positionId" = $1 WHERE id = $2 RETURNING *',
      [positionId || null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team member assignment not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/project-team-members/:id', optionalAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM project_team_members WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Tasks endpoints
app.get('/tasks', optionalAuth, async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = 'SELECT * FROM tasks';
    const params = [];

    if (projectId) {
      query += ' WHERE "projectId" = $1';
      params.push(projectId);
    }

    query += ' ORDER BY id';
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/tasks/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM tasks WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/tasks', optionalAuth, async (req, res) => {
  try {
    const { title, description, status, priority, projectId, assigneeId, dueDate, estimatedHours, actualHours } = req.body;
    const result = await pool.query(
      'INSERT INTO tasks (title, description, status, priority, "projectId", "assigneeId", "dueDate", "estimatedHours", "actualHours", "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW()) RETURNING *',
      [title, description, status || 'backlog', priority || 'medium', projectId, assigneeId, dueDate, estimatedHours || 0, actualHours || 0]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/tasks/:id', optionalAuth, async (req, res) => {
  try {
    const { title, description, status, priority, assigneeId, dueDate, estimatedHours, actualHours } = req.body;
    const result = await pool.query(
      'UPDATE tasks SET title = COALESCE($1, title), description = COALESCE($2, description), status = COALESCE($3, status), priority = COALESCE($4, priority), "assigneeId" = COALESCE($5, "assigneeId"), "dueDate" = COALESCE($6, "dueDate"), "estimatedHours" = COALESCE($7, "estimatedHours"), "actualHours" = COALESCE($8, "actualHours"), "updatedAt" = NOW() WHERE id = $9 RETURNING *',
      [title, description, status, priority, assigneeId, dueDate, estimatedHours, actualHours, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/tasks/:id', optionalAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Teams endpoints
app.get('/teams', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams ORDER BY id');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/teams/:id', optionalAuth, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM teams WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/teams', optionalAuth, async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const result = await pool.query(
      'INSERT INTO teams (name, description, "memberIds", "createdAt", "updatedAt") VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
      [name, description, JSON.stringify(memberIds || [])]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/teams/:id', optionalAuth, async (req, res) => {
  try {
    const { name, description, memberIds } = req.body;
    const result = await pool.query(
      'UPDATE teams SET name = COALESCE($1, name), description = COALESCE($2, description), "memberIds" = COALESCE($3, "memberIds"), "updatedAt" = NOW() WHERE id = $4 RETURNING *',
      [name, description, memberIds ? JSON.stringify(memberIds) : null, req.params.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/teams/:id', optionalAuth, async (req, res) => {
  try {
    await pool.query('DELETE FROM teams WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Activities endpoints
app.get('/activities', optionalAuth, async (req, res) => {
  try {
    const { _limit = 50 } = req.query;
    const result = await pool.query(
      'SELECT * FROM activities ORDER BY timestamp DESC LIMIT $1',
      [_limit]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/activities', optionalAuth, async (req, res) => {
  try {
    const { type, message, userName, entityId, entityType } = req.body;
    const result = await pool.query(
      'INSERT INTO activities (type, message, "userName", "entityId", "entityType", timestamp) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [type, message, userName, entityId, entityType]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Initialize database and start server
const initDb = async () => {
  try {
    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        progress INT DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(50) DEFAULT 'backlog',
        priority VARCHAR(50) DEFAULT 'medium',
        "projectId" INT REFERENCES projects(id),
        "assigneeId" INT REFERENCES users(id),
        "dueDate" DATE,
        "estimatedHours" INT DEFAULT 0,
        "actualHours" INT DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        "memberIds" JSON DEFAULT '[]',
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        type VARCHAR(50),
        message TEXT,
        "userName" VARCHAR(255),
        "entityId" INT,
        "entityType" VARCHAR(50),
        timestamp TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS project_teams (
        id SERIAL PRIMARY KEY,
        "projectId" INT REFERENCES projects(id) ON DELETE CASCADE,
        "teamId" INT REFERENCES teams(id) ON DELETE CASCADE,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE("projectId", "teamId")
      );

      CREATE TABLE IF NOT EXISTS positions (
        id SERIAL PRIMARY KEY,
        "teamId" INT REFERENCES teams(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        "createdAt" TIMESTAMP DEFAULT NOW(),
        "updatedAt" TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS project_team_members (
        id SERIAL PRIMARY KEY,
        "projectId" INT REFERENCES projects(id) ON DELETE CASCADE,
        "teamId" INT REFERENCES teams(id) ON DELETE CASCADE,
        "positionId" INT REFERENCES positions(id) ON DELETE SET NULL,
        "userId" INT REFERENCES users(id),
        "createdAt" TIMESTAMP DEFAULT NOW(),
        UNIQUE("projectId", "teamId", "userId")
      );
    `);

    // Seed initial data
    const userCheck = await pool.query('SELECT COUNT(*) FROM users');
    if (userCheck.rows[0].count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await pool.query(
        'INSERT INTO users (email, password, name) VALUES ($1, $2, $3)',
        ['admin@example.com', hashedPassword, 'Admin User']
      );

      await pool.query(
        'INSERT INTO projects (name, description, status, progress) VALUES ($1, $2, $3, $4)',
        ['Sample Project', 'A sample project to get started', 'active', 30]
      );

      await pool.query(
        'INSERT INTO tasks (title, description, status, priority, "projectId") VALUES ($1, $2, $3, $4, $5)',
        ['Setup project', 'Initial project setup', 'in_progress', 'high', 1]
      );

      await pool.query(
        'INSERT INTO teams (name, description) VALUES ($1, $2)',
        ['Development Team', 'Main development team']
      );

      console.log('Database initialized with seed data');
    }

    app.listen(port, '0.0.0.0', () => {
      console.log(`Backend server running on port ${port}`);
    });
  } catch (error) {
    console.error('Failed to initialize database:', error);
    process.exit(1);
  }
};

initDb();

