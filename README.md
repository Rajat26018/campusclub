# Campusclub - College Club Management System 🎓

A full-stack College Club Management web application built with **Node.js**, **Express**, **MySQL (via `mysql2`)**, and pure **HTML5, CSS3, and Vanilla JavaScript**.

Designed specifically for college projects with simple, well-commented code, parameterized queries for security, and a responsive modern user interface.

---

## 📌 Project Overview

**Campusclub** streamlines club and extracurricular activities on a college campus:
- **Clubs Directory & Management:** Create, view, search, edit, and delete campus clubs.
- **Club Details & Leadership:** View club profiles, faculty coordinators, member roles (President, Secretary, etc.), and club events.
- **Student Membership Management:** Register students with USN, course, and semester, and assign them to clubs with custom roles.
- **Events & Registration:** Schedule campus events (hackathons, workshops, fests) and enable 1-click student event registrations with live attendee counts.
- **Dashboard & Stats:** Live overview of total clubs, students enrolled, events scheduled, and registrations.

---

## 🛠️ Tech Stack

- **Backend:** Node.js, Express.js
- **Database Connector:** `mysql2` (Connection Pool with `async/await` Promises)
- **Security:** 100% Parameterized SQL Queries (`?` placeholders) preventing SQL Injection
- **Frontend:** Plain HTML5, CSS3 (Modern Flexbox/Grid, Responsive), Vanilla JavaScript (No heavy frameworks required)
- **Environment Management:** `dotenv`

---

## 🗄️ Database Tables Reference

The system connects to your existing MySQL database **`campushub`** (or configured in `.env`). 
*Note: No tables are created or altered by the application code.*

1. **`clubs`**
   - `club_id` (Primary Key)
   - `club_name`
   - `category` (e.g. Technical, Cultural, Sports, Literary, Social)
   - `description`
   - `faculty_coordinator`
   - `founded_year`

2. **`members`**
   - `member_id` (Primary Key)
   - `full_name`
   - `usn` (Student ID / Roll No)
   - `email`
   - `phone`
   - `course`
   - `semester`

3. **`memberships`**
   - `membership_id` (Primary Key)
   - `member_id` (Foreign Key -> members)
   - `club_id` (Foreign Key -> clubs)
   - `role` (e.g. President, Vice President, Core Member, Member)
   - `joined_on`

4. **`events`**
   - `event_id` (Primary Key)
   - `club_id` (Foreign Key -> clubs)
   - `title`
   - `description`
   - `event_date`
   - `venue`

5. **`registrations`**
   - `registration_id` (Primary Key)
   - `event_id` (Foreign Key -> events)
   - `member_id` (Foreign Key -> members)
   - `registered_on`

---

## 🚀 Getting Started

### 1. Database Configuration
Ensure your MySQL service is running and credentials in `.env` are accurate:

```env
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=campushub
```

*(If your database name is different, simply adjust `DB_NAME` in `.env`)*

### 2. Start the Server
You can start the server in any of these ways:

**Option A (Run Locally - 1 Click on Windows):**
- Double-click [`start.bat`](file:///c:/Users/rajat/Desktop/campusclub/start.bat) to launch the server and automatically open `http://localhost:3000` in your browser.

**Option B (Run Online Worldwide - 1 Click on Windows):**
- Double-click [`start-online.bat`](file:///c:/Users/rajat/Desktop/campusclub/start-online.bat). It starts the server and launches Cloudflare Tunnel to provide a worldwide public HTTPS link accessible from any browser or phone!

**Option C (Command Line):**
```bash
npm start
```
or:
```bash
node server.js
```

### 3. Open in Any Browser
Navigate to either of the following URLs in any web browser (Chrome, Edge, Firefox, Brave, Safari):
- **http://localhost:3000**
- **http://127.0.0.1:3000**

---

## 🌐 Pages & Navigation

| Page | URL | Description |
|---|---|---|
| **Home** | `/index.html` or `/` | Dashboard with campus statistics, quick action shortcuts, featured clubs, and upcoming events. |
| **Clubs Directory** | `/clubs.html` | Browse all clubs with live search, category filter, member/event counters, details view, edit, and delete options. |
| **Club Details** | `/club-details.html?id=:id` | Comprehensive view of a specific club: faculty coordinator, description, enrolled members with roles, and organized events. |
| **Members Directory** | `/members.html` | List of college students with USN, branch, semester, enrolled clubs, and search filter. |
| **Events Directory** | `/events.html` | Upcoming events with club badges, venue, date/time, and a **"Register Now"** modal. |
| **Add Club** | `/add-club.html` | Form to register a new college club. |
| **Edit Club** | `/edit-club.html?id=:id` | Form to update existing club information. |
| **Add Member** | `/add-member.html` | Form to enroll a new student into the college directory. |
| **Add Event** | `/add-event.html` | Form to schedule a campus event under an active club. |
| **Join Club** | `/join-club.html` | Form to associate a student member with a club and assign a role. |

---

## 🔌 REST API Endpoints

### Clubs
- `GET /api/clubs` - Retrieve all clubs with member & event counts
- `GET /api/clubs/:id` - Retrieve single club with member roster and event list
- `POST /api/clubs` - Create a new club (Parameterized query)
- `PUT /api/clubs/:id` - Update existing club (Parameterized query)
- `DELETE /api/clubs/:id` - Delete club and clean associated records safely in a transaction

### Members
- `GET /api/members` - Retrieve all students with joined clubs summary
- `GET /api/members/:id` - Retrieve single student with their clubs and event registrations
- `POST /api/members` - Register a new student (checks for unique USN/Email)

### Events
- `GET /api/events` - Retrieve all events with club name and attendee count
- `GET /api/events/:id` - Retrieve single event with registered attendees list
- `POST /api/events` - Create a new campus event

### Memberships & Registrations
- `GET /api/memberships` - List all club memberships
- `POST /api/memberships` - Enroll a student in a club with designated role
- `GET /api/registrations` - List all event registrations
- `POST /api/registrations` - Register a student member for an event

### Stats
- `GET /api/stats` - Total counts for dashboard cards

---

## 🔒 Security Highlights

1. **Parameterized Queries:** All SQL queries use `?` placeholders with values passed as arrays. No user input is directly concatenated into SQL strings, preventing SQL Injection vulnerabilities.
2. **Transaction-Safe Deletion:** Deleting a club safely cleans up child records (registrations -> events -> memberships -> club) inside a database transaction (`beginTransaction`, `commit`, `rollback`) to respect relational integrity.
3. **Input Sanitization & Escaping:** Dynamic text inserted into the DOM is escaped via `escapeHTML()` to protect against Cross-Site Scripting (XSS).
