// ============================================================================
// server.js - Campusclub Backend Server
// ============================================================================
// Main Express.js server providing REST API endpoints for the Campusclub
// College Club Management System.
// Uses parameterized SQL queries with mysql2 to ensure security against SQL injection.
// ============================================================================

require('dotenv').config();
const express = require('express');
const path = require('path');
const pool = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// ----------------------------------------------------------------------------
// Middleware
// ----------------------------------------------------------------------------
// Parse JSON request bodies (e.g. from fetch() calls in frontend)
app.use(express.json());

// Parse URL-encoded request bodies (e.g. from standard HTML forms)
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files (HTML, CSS, JavaScript, images) from 'public' folder
app.use(express.static(path.join(__dirname, 'public')));

// Helper function to format date strings for MySQL DATE/DATETIME columns
function formatDateTime(val) {
  if (!val) {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  }
  let s = String(val).trim().replace('T', ' ');
  // If only date is provided (YYYY-MM-DD), use it directly
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    return s;
  }
  // If missing seconds (YYYY-MM-DD HH:mm), append ':00'
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/.test(s)) {
    return s + ':00';
  }
  return s;
}

function formatDateOnly(val) {
  if (!val) {
    return new Date().toISOString().slice(0, 10);
  }
  return String(val).slice(0, 10);
}

// ============================================================================
// 1. DASHBOARD & STATS API
// ============================================================================

// GET /api/stats - Summary counts for the homepage dashboard
app.get('/api/stats', async (req, res) => {
  try {
    // Count total clubs
    const [[clubsCount]] = await pool.query('SELECT COUNT(*) AS totalClubs FROM clubs');
    // Count total members
    const [[membersCount]] = await pool.query('SELECT COUNT(*) AS totalMembers FROM members');
    // Count total events
    const [[eventsCount]] = await pool.query('SELECT COUNT(*) AS totalEvents FROM events');
    // Count total registrations
    const [[regsCount]] = await pool.query('SELECT COUNT(*) AS totalRegistrations FROM registrations');

    res.json({
      success: true,
      data: {
        clubs: clubsCount.totalClubs || 0,
        members: membersCount.totalMembers || 0,
        events: eventsCount.totalEvents || 0,
        registrations: regsCount.totalRegistrations || 0
      }
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch dashboard statistics: ' + err.message });
  }
});

// ============================================================================
// 2. CLUBS API (CRUD: List, Details, Create, Edit, Delete)
// ============================================================================

// GET /api/clubs - Retrieve all clubs along with member and event counts
app.get('/api/clubs', async (req, res) => {
  try {
    // Parameterized query using LEFT JOIN to include clubs even if they have 0 members or 0 events
    const [rows] = await pool.query(`
      SELECT 
        c.club_id, 
        c.club_name, 
        c.category, 
        c.description, 
        c.faculty_coordinator, 
        c.founded_year,
        COUNT(DISTINCT m.membership_id) AS member_count,
        COUNT(DISTINCT e.event_id) AS event_count
      FROM clubs c
      LEFT JOIN memberships m ON c.club_id = m.club_id
      LEFT JOIN events e ON c.club_id = e.club_id
      GROUP BY c.club_id, c.club_name, c.category, c.description, c.faculty_coordinator, c.founded_year
      ORDER BY c.club_name ASC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching clubs:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch clubs: ' + err.message });
  }
});

// GET /api/clubs/:id - Retrieve a single club with full details, members, and events
app.get('/api/clubs/:id', async (req, res) => {
  const clubId = req.params.id;

  try {
    // 1. Fetch club info using parameterized query
    const [clubRows] = await pool.query(
      'SELECT * FROM clubs WHERE club_id = ?',
      [clubId]
    );

    if (clubRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Club not found' });
    }

    const club = clubRows[0];

    // 2. Fetch all members associated with this club
    const [members] = await pool.query(`
      SELECT 
        ms.membership_id,
        ms.role,
        ms.joined_on,
        m.member_id,
        m.full_name,
        m.usn,
        m.email,
        m.phone,
        m.course,
        m.semester
      FROM memberships ms
      JOIN members m ON ms.member_id = m.member_id
      WHERE ms.club_id = ?
      ORDER BY ms.joined_on DESC
    `, [clubId]);

    // 3. Fetch all events organized by this club with attendee counts
    const [events] = await pool.query(`
      SELECT 
        e.event_id,
        e.club_id,
        e.title,
        e.description,
        e.event_date,
        e.venue,
        COUNT(r.registration_id) AS attendees_count
      FROM events e
      LEFT JOIN registrations r ON e.event_id = r.event_id
      WHERE e.club_id = ?
      GROUP BY e.event_id, e.club_id, e.title, e.description, e.event_date, e.venue
      ORDER BY e.event_date DESC
    `, [clubId]);

    res.json({
      success: true,
      data: {
        ...club,
        members,
        events
      }
    });
  } catch (err) {
    console.error('Error fetching club details:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch club details: ' + err.message });
  }
});

// POST /api/clubs - Create a new club
app.post('/api/clubs', async (req, res) => {
  const { club_name, category, description, faculty_coordinator, founded_year } = req.body;

  // Validation
  if (!club_name || !category || !faculty_coordinator) {
    return res.status(400).json({
      success: false,
      message: 'Club name, category, and faculty coordinator are required.'
    });
  }

  const year = founded_year ? parseInt(founded_year, 10) : new Date().getFullYear();

  try {
    // Parameterized INSERT query prevents SQL injection
    const [result] = await pool.query(
      `INSERT INTO clubs (club_name, category, description, faculty_coordinator, founded_year) 
       VALUES (?, ?, ?, ?, ?)`,
      [club_name.trim(), category.trim(), (description || '').trim(), faculty_coordinator.trim(), year]
    );

    res.status(201).json({
      success: true,
      message: 'Club created successfully!',
      club_id: result.insertId
    });
  } catch (err) {
    console.error('Error creating club:', err);
    res.status(500).json({ success: false, message: 'Failed to create club: ' + err.message });
  }
});

// PUT /api/clubs/:id - Update an existing club
app.put('/api/clubs/:id', async (req, res) => {
  const clubId = req.params.id;
  const { club_name, category, description, faculty_coordinator, founded_year } = req.body;

  // Validation
  if (!club_name || !category || !faculty_coordinator) {
    return res.status(400).json({
      success: false,
      message: 'Club name, category, and faculty coordinator are required.'
    });
  }

  const year = founded_year ? parseInt(founded_year, 10) : new Date().getFullYear();

  try {
    // Parameterized UPDATE query
    const [result] = await pool.query(
      `UPDATE clubs 
       SET club_name = ?, category = ?, description = ?, faculty_coordinator = ?, founded_year = ? 
       WHERE club_id = ?`,
      [club_name.trim(), category.trim(), (description || '').trim(), faculty_coordinator.trim(), year, clubId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Club not found or no changes made.' });
    }

    res.json({
      success: true,
      message: 'Club updated successfully!'
    });
  } catch (err) {
    console.error('Error updating club:', err);
    res.status(500).json({ success: false, message: 'Failed to update club: ' + err.message });
  }
});

// DELETE /api/clubs/:id - Delete a club and clean up its associated records
app.delete('/api/clubs/:id', async (req, res) => {
  const clubId = req.params.id;

  // Use a database connection with transaction to safely remove child records (events, registrations, memberships)
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // 1. Find all event IDs for this club
    const [events] = await connection.query('SELECT event_id FROM events WHERE club_id = ?', [clubId]);

    // 2. Delete registrations for those events
    if (events.length > 0) {
      const eventIds = events.map(e => e.event_id);
      for (const eid of eventIds) {
        await connection.query('DELETE FROM registrations WHERE event_id = ?', [eid]);
      }
      // Delete the events
      await connection.query('DELETE FROM events WHERE club_id = ?', [clubId]);
    }

    // 3. Delete memberships for this club
    await connection.query('DELETE FROM memberships WHERE club_id = ?', [clubId]);

    // 4. Delete the club itself
    const [result] = await connection.query('DELETE FROM clubs WHERE club_id = ?', [clubId]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res.status(404).json({ success: false, message: 'Club not found.' });
    }

    await connection.commit();
    res.json({ success: true, message: 'Club deleted successfully!' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error deleting club:', err);
    res.status(500).json({ success: false, message: 'Failed to delete club: ' + err.message });
  } finally {
    if (connection) connection.release();
  }
});

// ============================================================================
// 3. MEMBERS API
// ============================================================================

// GET /api/members - Retrieve all members with club membership summary
app.get('/api/members', async (req, res) => {
  try {
    // Parameterized query using LEFT JOIN to show clubs joined per member
    const [rows] = await pool.query(`
      SELECT 
        m.member_id, 
        m.full_name, 
        m.usn, 
        m.email, 
        m.phone, 
        m.course, 
        m.semester,
        COUNT(DISTINCT ms.club_id) AS clubs_count,
        GROUP_CONCAT(DISTINCT c.club_name ORDER BY c.club_name SEPARATOR ', ') AS club_names
      FROM members m
      LEFT JOIN memberships ms ON m.member_id = ms.member_id
      LEFT JOIN clubs c ON ms.club_id = c.club_id
      GROUP BY m.member_id, m.full_name, m.usn, m.email, m.phone, m.course, m.semester
      ORDER BY m.full_name ASC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching members:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch members: ' + err.message });
  }
});

// GET /api/members/:id - Retrieve single member with clubs joined & event registrations
app.get('/api/members/:id', async (req, res) => {
  const memberId = req.params.id;

  try {
    const [memberRows] = await pool.query('SELECT * FROM members WHERE member_id = ?', [memberId]);
    if (memberRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Member not found' });
    }

    const member = memberRows[0];

    // Clubs joined by this member
    const [clubs] = await pool.query(`
      SELECT ms.membership_id, ms.role, ms.joined_on, c.club_id, c.club_name, c.category
      FROM memberships ms
      JOIN clubs c ON ms.club_id = c.club_id
      WHERE ms.member_id = ?
      ORDER BY ms.joined_on DESC
    `, [memberId]);

    // Events registered by this member
    const [events] = await pool.query(`
      SELECT r.registration_id, r.registered_on, e.event_id, e.title, e.event_date, e.venue, c.club_name
      FROM registrations r
      JOIN events e ON r.event_id = e.event_id
      JOIN clubs c ON e.club_id = c.club_id
      WHERE r.member_id = ?
      ORDER BY e.event_date DESC
    `, [memberId]);

    res.json({
      success: true,
      data: {
        ...member,
        clubs,
        events
      }
    });
  } catch (err) {
    console.error('Error fetching member details:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch member details: ' + err.message });
  }
});

// POST /api/members - Register a new member
app.post('/api/members', async (req, res) => {
  const { full_name, usn, email, phone, course, semester } = req.body;

  // Validation
  if (!full_name || !usn || !email || !course || !semester) {
    return res.status(400).json({
      success: false,
      message: 'Full name, USN, email, course, and semester are required.'
    });
  }

  try {
    // Check if USN or Email is already registered
    const [existing] = await pool.query(
      'SELECT member_id, usn, email FROM members WHERE usn = ? OR email = ?',
      [usn.trim(), email.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'A member with this USN or Email is already registered.'
      });
    }

    // Parameterized INSERT query
    const [result] = await pool.query(
      `INSERT INTO members (full_name, usn, email, phone, course, semester) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name.trim(), usn.trim().toUpperCase(), email.trim().toLowerCase(), (phone || '').trim(), course.trim(), parseInt(semester, 10)]
    );

    res.status(201).json({
      success: true,
      message: 'Member registered successfully!',
      member_id: result.insertId
    });
  } catch (err) {
    console.error('Error adding member:', err);
    res.status(500).json({ success: false, message: 'Failed to add member: ' + err.message });
  }
});

// ============================================================================
// 4. EVENTS API
// ============================================================================

// GET /api/events - Retrieve all events with club name and registration counts
app.get('/api/events', async (req, res) => {
  try {
    // Parameterized query using JOIN to fetch club name and LEFT JOIN for attendees count
    const [rows] = await pool.query(`
      SELECT 
        e.event_id, 
        e.club_id, 
        e.title, 
        e.description, 
        e.event_date, 
        e.venue,
        c.club_name,
        c.category AS club_category,
        COUNT(r.registration_id) AS registered_count
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      LEFT JOIN registrations r ON e.event_id = r.event_id
      GROUP BY e.event_id, e.club_id, e.title, e.description, e.event_date, e.venue, c.club_name, c.category
      ORDER BY e.event_date ASC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching events:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch events: ' + err.message });
  }
});

// GET /api/events/:id - Retrieve single event with registered members list
app.get('/api/events/:id', async (req, res) => {
  const eventId = req.params.id;

  try {
    const [eventRows] = await pool.query(`
      SELECT e.*, c.club_name, c.category AS club_category
      FROM events e
      JOIN clubs c ON e.club_id = c.club_id
      WHERE e.event_id = ?
    `, [eventId]);

    if (eventRows.length === 0) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const event = eventRows[0];

    // Fetch registered attendees
    const [attendees] = await pool.query(`
      SELECT 
        r.registration_id, 
        r.registered_on, 
        m.member_id, 
        m.full_name, 
        m.usn, 
        m.email, 
        m.course, 
        m.semester
      FROM registrations r
      JOIN members m ON r.member_id = m.member_id
      WHERE r.event_id = ?
      ORDER BY r.registered_on DESC
    `, [eventId]);

    res.json({
      success: true,
      data: {
        ...event,
        attendees
      }
    });
  } catch (err) {
    console.error('Error fetching event details:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch event details: ' + err.message });
  }
});

// POST /api/events - Create a new event
app.post('/api/events', async (req, res) => {
  const { club_id, title, description, event_date, venue } = req.body;

  // Validation
  if (!club_id || !title || !event_date || !venue) {
    return res.status(400).json({
      success: false,
      message: 'Club, event title, date/time, and venue are required.'
    });
  }

  const formattedDate = formatDateTime(event_date);

  try {
    // Verify club exists
    const [clubCheck] = await pool.query('SELECT club_id FROM clubs WHERE club_id = ?', [club_id]);
    if (clubCheck.length === 0) {
      return res.status(400).json({ success: false, message: 'Selected club does not exist.' });
    }

    // Parameterized INSERT query
    const [result] = await pool.query(
      `INSERT INTO events (club_id, title, description, event_date, venue) 
       VALUES (?, ?, ?, ?, ?)`,
      [club_id, title.trim(), (description || '').trim(), formattedDate, venue.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Event created successfully!',
      event_id: result.insertId
    });
  } catch (err) {
    console.error('Error creating event:', err);
    res.status(500).json({ success: false, message: 'Failed to create event: ' + err.message });
  }
});

// ============================================================================
// 5. MEMBERSHIPS API (Join Club)
// ============================================================================

// GET /api/memberships - List all memberships
app.get('/api/memberships', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        ms.membership_id, 
        ms.role, 
        ms.joined_on,
        m.member_id, 
        m.full_name, 
        m.usn,
        c.club_id, 
        c.club_name
      FROM memberships ms
      JOIN members m ON ms.member_id = m.member_id
      JOIN clubs c ON ms.club_id = c.club_id
      ORDER BY ms.joined_on DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching memberships:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch memberships: ' + err.message });
  }
});

// POST /api/memberships - Join a club (create membership)
app.post('/api/memberships', async (req, res) => {
  const { member_id, club_id, role, joined_on } = req.body;

  // Validation
  if (!member_id || !club_id) {
    return res.status(400).json({
      success: false,
      message: 'Member and Club selections are required.'
    });
  }

  const assignedRole = (role && role.trim()) ? role.trim() : 'Member';
  const joinDate = formatDateOnly(joined_on);

  try {
    // Check if the student is already a member of this club
    const [existing] = await pool.query(
      'SELECT membership_id, role FROM memberships WHERE member_id = ? AND club_id = ?',
      [member_id, club_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `This student is already a member of this club (Current Role: ${existing[0].role}).`
      });
    }

    // Parameterized INSERT query
    const [result] = await pool.query(
      `INSERT INTO memberships (member_id, club_id, role, joined_on) 
       VALUES (?, ?, ?, ?)`,
      [member_id, club_id, assignedRole, joinDate]
    );

    res.status(201).json({
      success: true,
      message: 'Member added to club successfully!',
      membership_id: result.insertId
    });
  } catch (err) {
    console.error('Error adding membership:', err);
    res.status(500).json({ success: false, message: 'Failed to join club: ' + err.message });
  }
});

// ============================================================================
// 6. EVENT REGISTRATIONS API (Register for Event)
// ============================================================================

// GET /api/registrations - List event registrations
app.get('/api/registrations', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        r.registration_id, 
        r.registered_on,
        m.member_id, 
        m.full_name, 
        m.usn,
        e.event_id, 
        e.title AS event_title, 
        e.event_date,
        c.club_name
      FROM registrations r
      JOIN members m ON r.member_id = m.member_id
      JOIN events e ON r.event_id = e.event_id
      JOIN clubs c ON e.club_id = c.club_id
      ORDER BY r.registered_on DESC
    `);

    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Error fetching registrations:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch registrations: ' + err.message });
  }
});

// POST /api/registrations - Register a member for an event
app.post('/api/registrations', async (req, res) => {
  const { event_id, member_id, registered_on } = req.body;

  // Validation
  if (!event_id || !member_id) {
    return res.status(400).json({
      success: false,
      message: 'Event and Member selections are required.'
    });
  }

  const regDate = formatDateTime(registered_on);

  try {
    // Check if member is already registered for this event
    const [existing] = await pool.query(
      'SELECT registration_id FROM registrations WHERE event_id = ? AND member_id = ?',
      [event_id, member_id]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'This member is already registered for this event.'
      });
    }

    // Parameterized INSERT query
    const [result] = await pool.query(
      `INSERT INTO registrations (event_id, member_id, registered_on) 
       VALUES (?, ?, ?)`,
      [event_id, member_id, regDate]
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful! See you at the event.',
      registration_id: result.insertId
    });
  } catch (err) {
    console.error('Error registering for event:', err);
    res.status(500).json({ success: false, message: 'Failed to register: ' + err.message });
  }
});

// ============================================================================
// 7. SEED DATA API (Populate Demo Clubs, Members, Memberships & Events)
// ============================================================================
app.post('/api/seed', async (req, res) => {
  try {
    const seedData = require('./seed');
    const result = await seedData();
    res.json(result);
  } catch (err) {
    console.error('Error seeding data:', err);
    res.status(500).json({ success: false, message: 'Seeding failed: ' + err.message });
  }
});

// ----------------------------------------------------------------------------
// Catch-all fallback middleware to serve the homepage for unspecified routes
// ----------------------------------------------------------------------------
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ----------------------------------------------------------------------------
// Start Server
// ----------------------------------------------------------------------------
const HOST = process.env.HOST || '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`====================================================`);
  console.log(` Campusclub Server is active and accessible at:`);
  console.log(`  - http://localhost:${PORT}`);
  console.log(`  - http://127.0.0.1:${PORT}`);
  console.log(` Connecting to MySQL database: ${process.env.DB_NAME || 'campushub'}`);
  console.log(`====================================================`);
});
