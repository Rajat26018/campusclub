// ============================================================================
// seed.js - Seed Script for Campusclub Database
// ============================================================================
// Inserts realistic campus clubs (with logos), students, memberships with
// leadership roles, and campus events with registrations.
// Uses parameterized queries only. Does NOT create or alter tables.
// ============================================================================

require('dotenv').config();
const pool = require('./db');

async function seedData() {
  console.log('🌱 Starting Campusclub database seeding...');
  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    // ------------------------------------------------------------------------
    // 1. CLUBS DATA
    // ------------------------------------------------------------------------
    const clubsData = [
      {
        name: 'Google Developer Student Club',
        cat: 'Technical',
        desc: '[icon:💻] Empowering university students to build real-world software, AI models, mobile apps, and cloud infrastructure using modern Google technologies.',
        coord: 'Dr. Ramesh Kumar, Dept. of CSE',
        year: 2021
      },
      {
        name: 'RoboTech & Automation Society',
        cat: 'Technical',
        desc: '[icon:🤖] Designing autonomous robotics, micro-controller circuits, drone technology, and embedded IoT systems for national engineering competitions.',
        coord: 'Prof. Sneha Deshmukh, Dept. of ECE',
        year: 2020
      },
      {
        name: 'Crescendo Music & Cultural Club',
        cat: 'Cultural',
        desc: '[icon:🎵] The official collegiate acoustic and rock band, organizing musical fests, open mics, jam sessions, and cultural showdowns on campus.',
        coord: 'Dr. Ananya Roy, Dept. of Humanities',
        year: 2018
      },
      {
        name: 'ShutterSpeed Photography Society',
        cat: 'Cultural',
        desc: '[icon:📸] Capturing life on campus through lenses, documentary filmmaking, cinematography workshops, and annual photo exhibitions.',
        coord: 'Prof. Vikram Verma, Dept. of Media Studies',
        year: 2019
      },
      {
        name: 'E-Cell (Entrepreneurship Cell)',
        cat: 'Entrepreneurship',
        desc: '[icon:🚀] Fostering startup culture, venture building, founder networking, angel investor pitch sessions, and product hackathons.',
        coord: 'Dr. Rajiv Nambiar, Dept. of Management',
        year: 2019
      },
      {
        name: 'Literary & Debating Society',
        cat: 'Literary',
        desc: '[icon:📚] Parliamentary debates, Model United Nations (MUN), creative writing, book discussions, and public speaking championships.',
        coord: 'Prof. Meera Kulkarni, Dept. of English',
        year: 2017
      },
      {
        name: 'Blitz Sports & Athletics Society',
        cat: 'Sports',
        desc: '[icon:⚽] Training college athletes for inter-university tournaments in football, basketball, cricket, badminton, and track athletics.',
        coord: 'Coach Mahendra Singh, Dept. of Physical Education',
        year: 2016
      },
      {
        name: 'Rotaract & NSS Community',
        cat: 'Social',
        desc: '[icon:🤝] Driving campus social responsibility: blood donation camps, digital literacy drives for local schools, and clean campus initiatives.',
        coord: 'Dr. Sunita Patel, Dept. of Social Sciences',
        year: 2018
      }
    ];

    const clubIdMap = {};

    for (const c of clubsData) {
      // Check if club already exists
      const [existing] = await conn.query('SELECT club_id FROM clubs WHERE club_name = ?', [c.name]);
      if (existing.length > 0) {
        clubIdMap[c.name] = existing[0].club_id;
        console.log(`ℹ️ Club "${c.name}" already exists (ID: ${existing[0].club_id})`);
      } else {
        const [res] = await conn.query(
          `INSERT INTO clubs (club_name, category, description, faculty_coordinator, founded_year)
           VALUES (?, ?, ?, ?, ?)`,
          [c.name, c.cat, c.desc, c.coord, c.year]
        );
        clubIdMap[c.name] = res.insertId;
        console.log(`✅ Created Club: "${c.name}" (ID: ${res.insertId})`);
      }
    }

    // ------------------------------------------------------------------------
    // 2. MEMBERS DATA
    // ------------------------------------------------------------------------
    const membersData = [
      { name: 'Aarav Mehta', usn: '1RV22CS001', email: 'aarav.cs22@college.edu', phone: '+91 9876543201', course: 'B.Tech CSE', sem: 5 },
      { name: 'Priya Sengupta', usn: '1RV22CS045', email: 'priya.cs22@college.edu', phone: '+91 9876543202', course: 'B.Tech CSE', sem: 5 },
      { name: 'Rohan Nair', usn: '1RV22EC012', email: 'rohan.ec22@college.edu', phone: '+91 9876543203', course: 'B.Tech ECE', sem: 5 },
      { name: 'Ananya Sharma', usn: '1RV23CS019', email: 'ananya.cs23@college.edu', phone: '+91 9876543204', course: 'B.Tech CSE', sem: 3 },
      { name: 'Kavya Iyer', usn: '1RV21IS033', email: 'kavya.is21@college.edu', phone: '+91 9876543205', course: 'B.Tech ISE', sem: 7 },
      { name: 'Devendra Patel', usn: '1RV22ME008', email: 'devendra.me22@college.edu', phone: '+91 9876543206', course: 'B.Tech Mech', sem: 5 },
      { name: 'Sneha Varma', usn: '1RV23EC050', email: 'sneha.ec23@college.edu', phone: '+91 9876543207', course: 'B.Tech ECE', sem: 3 },
      { name: 'Vikramaditya Joshi', usn: '1RV21CS089', email: 'vikram.cs21@college.edu', phone: '+91 9876543208', course: 'B.Tech CSE', sem: 7 },
      { name: 'Tanvi Hegde', usn: '1RV22AI015', email: 'tanvi.ai22@college.edu', phone: '+91 9876543209', course: 'B.Tech AI & ML', sem: 5 },
      { name: 'Zayd Khan', usn: '1RV23IS041', email: 'zayd.is23@college.edu', phone: '+91 9876543210', course: 'B.Tech ISE', sem: 3 },
      { name: 'Megha Kulkarni', usn: '1RV22BT004', email: 'megha.bt22@college.edu', phone: '+91 9876543211', course: 'B.Tech Biotech', sem: 5 },
      { name: 'Arjun Malhotra', usn: '1RV21ME022', email: 'arjun.me21@college.edu', phone: '+91 9876543212', course: 'B.Tech Mech', sem: 7 }
    ];

    const memberIdMap = {};

    for (const m of membersData) {
      const [existing] = await conn.query('SELECT member_id FROM members WHERE usn = ?', [m.usn]);
      if (existing.length > 0) {
        memberIdMap[m.usn] = existing[0].member_id;
        console.log(`ℹ️ Member "${m.name}" (${m.usn}) already exists (ID: ${existing[0].member_id})`);
      } else {
        const [res] = await conn.query(
          `INSERT INTO members (full_name, usn, email, phone, course, semester)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [m.name, m.usn, m.email, m.phone, m.course, m.sem]
        );
        memberIdMap[m.usn] = res.insertId;
        console.log(`✅ Created Member: "${m.name}" (ID: ${res.insertId})`);
      }
    }

    // ------------------------------------------------------------------------
    // 3. MEMBERSHIPS DATA (Enroll students with leadership & member roles)
    // ------------------------------------------------------------------------
    const membershipsData = [
      { usn: '1RV22CS001', club: 'Google Developer Student Club', role: 'President', date: '2023-08-15' },
      { usn: '1RV22CS045', club: 'Google Developer Student Club', role: 'Technical Lead', date: '2023-08-20' },
      { usn: '1RV22AI015', club: 'Google Developer Student Club', role: 'Core Member', date: '2023-09-01' },
      { usn: '1RV23CS019', club: 'Google Developer Student Club', role: 'Member', date: '2024-01-15' },

      { usn: '1RV22EC012', club: 'RoboTech & Automation Society', role: 'President', date: '2023-08-10' },
      { usn: '1RV23EC050', club: 'RoboTech & Automation Society', role: 'Hardware Lead', date: '2023-09-05' },

      { usn: '1RV23CS019', club: 'Crescendo Music & Cultural Club', role: 'Lead Vocalist', date: '2023-09-12' },
      { usn: '1RV23IS041', club: 'Crescendo Music & Cultural Club', role: 'Guitarist', date: '2023-10-01' },

      { usn: '1RV23EC050', club: 'ShutterSpeed Photography Society', role: 'Media & PR Lead', date: '2023-08-25' },
      { usn: '1RV22CS045', club: 'ShutterSpeed Photography Society', role: 'Member', date: '2023-09-18' },

      { usn: '1RV21IS033', club: 'E-Cell (Entrepreneurship Cell)', role: 'Vice President', date: '2022-09-10' },
      { usn: '1RV22CS001', club: 'E-Cell (Entrepreneurship Cell)', role: 'Operations Lead', date: '2023-08-14' },

      { usn: '1RV21CS089', club: 'Literary & Debating Society', role: 'President', date: '2022-08-01' },
      { usn: '1RV22BT004', club: 'Literary & Debating Society', role: 'Debate Captain', date: '2023-08-28' },

      { usn: '1RV22ME008', club: 'Blitz Sports & Athletics Society', role: 'Football Captain', date: '2023-07-20' },
      { usn: '1RV21ME022', club: 'Blitz Sports & Athletics Society', role: 'Fitness Lead', date: '2022-09-01' },

      { usn: '1RV23IS041', club: 'Rotaract & NSS Community', role: 'Secretary', date: '2023-08-15' },
      { usn: '1RV22BT004', club: 'Rotaract & NSS Community', role: 'Campaign Lead', date: '2023-09-01' }
    ];

    for (const ms of membershipsData) {
      const memberId = memberIdMap[ms.usn];
      const clubId = clubIdMap[ms.club];

      if (memberId && clubId) {
        const [existing] = await conn.query(
          'SELECT membership_id FROM memberships WHERE member_id = ? AND club_id = ?',
          [memberId, clubId]
        );

        if (existing.length === 0) {
          await conn.query(
            `INSERT INTO memberships (member_id, club_id, role, joined_on)
             VALUES (?, ?, ?, ?)`,
            [memberId, clubId, ms.role, ms.date]
          );
          console.log(`✅ Enrolled ${ms.usn} in "${ms.club}" as ${ms.role}`);
        }
      }
    }

    // ------------------------------------------------------------------------
    // 4. EVENTS DATA
    // ------------------------------------------------------------------------
    const eventsData = [
      {
        club: 'Google Developer Student Club',
        title: 'HackTheCampus 2026: 24h AI Hackathon',
        desc: 'Build generative AI, web applications, and cloud automations. Prizes worth ₹50,000, mentor sessions, and free meals!',
        date: '2026-11-20 09:00:00',
        venue: 'Main Seminar Hall & CS Labs'
      },
      {
        club: 'RoboTech & Automation Society',
        title: 'Hands-on Drone Tech & Microcontroller Workshop',
        desc: 'Learn drone aerodynamics, motor controllers, Arduino/ESP32 programming, and fly quadcopters in the arena.',
        date: '2026-11-18 14:00:00',
        venue: 'Robotics Center, Block B'
      },
      {
        club: 'Crescendo Music & Cultural Club',
        title: 'Unplugged: Acoustic Night & Open Mic Jam',
        desc: 'An evening of live acoustic music, beatboxing, poetry, and band showdowns under the campus amphitheatre lights.',
        date: '2026-11-25 17:30:00',
        venue: 'Open Air Amphitheatre'
      },
      {
        club: 'E-Cell (Entrepreneurship Cell)',
        title: 'E-Summit 2026: Angel Pitch Deck Challenge',
        desc: 'Pitch your innovative startup ideas directly to active VCs and angel investors. Winner receives seed incubation support.',
        date: '2026-12-02 10:30:00',
        venue: 'MBA Auditorium, Block D'
      },
      {
        club: 'Literary & Debating Society',
        title: 'National Parliamentary Debate & MUN Showcase',
        desc: 'Three rounds of British Parliamentary debate debating geopolitical policies, tech ethics, and economic governance.',
        date: '2026-12-08 11:00:00',
        venue: 'Council Hall, Admin Block'
      },
      {
        club: 'Blitz Sports & Athletics Society',
        title: 'Campus Premier League (CPL) 7-a-side Football',
        desc: 'Inter-branch knockout tournament with rolling substitutions. Trophies for Top Scorer, Golden Glove, and Champions.',
        date: '2026-11-28 15:30:00',
        venue: 'Central Sports Complex Ground'
      }
    ];

    const eventIdMap = {};

    for (const ev of eventsData) {
      const clubId = clubIdMap[ev.club];
      if (clubId) {
        const [existing] = await conn.query(
          'SELECT event_id FROM events WHERE title = ? AND club_id = ?',
          [ev.title, clubId]
        );

        if (existing.length > 0) {
          eventIdMap[ev.title] = existing[0].event_id;
        } else {
          const [res] = await conn.query(
            `INSERT INTO events (club_id, title, description, event_date, venue)
             VALUES (?, ?, ?, ?, ?)`,
            [clubId, ev.title, ev.desc, ev.date, ev.venue]
          );
          eventIdMap[ev.title] = res.insertId;
          console.log(`✅ Scheduled Event: "${ev.title}" (ID: ${res.insertId})`);
        }
      }
    }

    // ------------------------------------------------------------------------
    // 5. REGISTRATIONS DATA
    // ------------------------------------------------------------------------
    const regsData = [
      { title: 'HackTheCampus 2026: 24h AI Hackathon', usn: '1RV22CS001' },
      { title: 'HackTheCampus 2026: 24h AI Hackathon', usn: '1RV22CS045' },
      { title: 'HackTheCampus 2026: 24h AI Hackathon', usn: '1RV22AI015' },
      { title: 'HackTheCampus 2026: 24h AI Hackathon', usn: '1RV23CS019' },
      { title: 'Hands-on Drone Tech & Microcontroller Workshop', usn: '1RV22EC012' },
      { title: 'Hands-on Drone Tech & Microcontroller Workshop', usn: '1RV23EC050' },
      { title: 'Hands-on Drone Tech & Microcontroller Workshop', usn: '1RV22ME008' },
      { title: 'Unplugged: Acoustic Night & Open Mic Jam', usn: '1RV23CS019' },
      { title: 'Unplugged: Acoustic Night & Open Mic Jam', usn: '1RV23IS041' },
      { title: 'Unplugged: Acoustic Night & Open Mic Jam', usn: '1RV22BT004' },
      { title: 'E-Summit 2026: Angel Pitch Deck Challenge', usn: '1RV21IS033' },
      { title: 'E-Summit 2026: Angel Pitch Deck Challenge', usn: '1RV22CS001' },
      { title: 'Campus Premier League (CPL) 7-a-side Football', usn: '1RV22ME008' },
      { title: 'Campus Premier League (CPL) 7-a-side Football', usn: '1RV21ME022' }
    ];

    for (const r of regsData) {
      const eventId = eventIdMap[r.title];
      const memberId = memberIdMap[r.usn];

      if (eventId && memberId) {
        const [existing] = await conn.query(
          'SELECT registration_id FROM registrations WHERE event_id = ? AND member_id = ?',
          [eventId, memberId]
        );

        if (existing.length === 0) {
          await conn.query(
            `INSERT INTO registrations (event_id, member_id, registered_on)
             VALUES (?, ?, ?)`,
            [eventId, memberId, new Date().toISOString().slice(0, 19).replace('T', ' ')]
          );
        }
      }
    }

    await conn.commit();
    console.log('🎉 Database seeding completed successfully!');
    return { success: true, message: 'Campusclub data seeded successfully!' };
  } catch (err) {
    await conn.rollback();
    console.error('❌ Error during seeding:', err);
    throw err;
  } finally {
    conn.release();
  }
}

// If executed directly from command line (node seed.js)
if (require.main === module) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = seedData;
