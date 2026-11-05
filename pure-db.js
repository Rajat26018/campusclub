const fs = require('fs');
const path = require('path');

// Default initial data
function getDefaultData() {
  return {
    clubs: [
      { club_id: 1, club_name: 'Coding Club', category: 'Technical', description: 'Weekly coding practice and hackathons', faculty_coordinator: 'Dr. Ramesh', founded_year: 2018 },
      { club_id: 2, club_name: 'Cultural Club', category: 'Cultural', description: 'Dance, music and fest events', faculty_coordinator: 'Mrs. Anitha', founded_year: 2015 },
      { club_id: 3, club_name: 'Sports Club', category: 'Sports', description: 'Inter-college tournaments and fitness', faculty_coordinator: 'Mr. Kumar', founded_year: 2012 },
      { club_id: 4, club_name: 'Gravity SJCE', category: 'Cultural', description: '', faculty_coordinator: 'Divya sharma of EC department', founded_year: 2026 },
      { club_id: 5, club_name: 'chess club', category: 'Sports', description: '[icon:♟️]', faculty_coordinator: 'Pavan kumar', founded_year: 2025 }
    ],
    members: [
      { member_id: 1, full_name: 'Rajat', usn: '01JST25PCA005', email: 'rajat@example.com', phone: '9876543210', course: 'BCA', semester: 5 },
      { member_id: 2, full_name: 'Ananya S', usn: '01JST25PCA010', email: 'ananya@example.com', phone: '9876500001', course: 'BCA', semester: 5 },
      { member_id: 3, full_name: 'Kiran M', usn: '01JST25PCA021', email: 'kiran@example.com', phone: '9876500002', course: 'BCA', semester: 3 },
      { member_id: 4, full_name: 'Vaibhavi', usn: '1RVCS321', email: 'vaibhavishetti82@gmail.com', phone: '9901980002', course: 'cse', semester: 6 },
      { member_id: 5, full_name: 'Rahul sharma', usn: '01JST25PCA011', email: 'rahul@gmail.com', phone: '4201980002', course: 'MCA', semester: 2 },
      { member_id: 6, full_name: 'Sunil kumar', usn: '01JST25PCA234', email: 'sunil@gmail.com', phone: '4201980002', course: 'CsE', semester: 4 }
    ],
    memberships: [
      { membership_id: 1, member_id: 1, club_id: 1, role: 'President', joined_on: '2025-07-31 18:30:00' },
      { membership_id: 2, member_id: 2, club_id: 1, role: 'Member', joined_on: '2025-08-04 18:30:00' },
      { membership_id: 3, member_id: 2, club_id: 2, role: 'Secretary', joined_on: '2025-08-09 18:30:00' },
      { membership_id: 4, member_id: 3, club_id: 3, role: 'Member', joined_on: '2025-08-31 18:30:00' },
      { membership_id: 5, member_id: 4, club_id: 2, role: 'President', joined_on: '2026-11-02 18:30:00' },
      { membership_id: 6, member_id: 3, club_id: 4, role: 'Media & PR Lead', joined_on: '2026-09-02 18:30:00' },
      { membership_id: 7, member_id: 1, club_id: 5, role: 'Vice President', joined_on: '2026-11-03 18:30:00' },
      { membership_id: 8, member_id: 5, club_id: 2, role: 'Member', joined_on: '2026-09-08 18:30:00' }
    ],
    events: [
      { event_id: 1, club_id: 1, title: 'Hackathon 2026', description: '24-hour coding contest', event_date: '2026-12-09 18:30:00', venue: 'Seminar Hall' },
      { event_id: 2, club_id: 2, title: 'Annual Fest', description: 'Cultural programs', event_date: '2026-12-19 18:30:00', venue: 'Main Auditorium' },
      { event_id: 3, club_id: 3, title: 'Cricket Tournament', description: 'Inter-department matches', event_date: '2026-12-04 18:30:00', venue: 'College Ground' },
      { event_id: 4, club_id: 1, title: 'hack ai thon', description: 'hackthon for students', event_date: '2026-11-29 18:30:00', venue: 'A block' },
      { event_id: 5, club_id: 4, title: 'Solo Dance event', description: 'Show your steps and talent , get a chance to shine on stage', event_date: '2026-12-03 18:30:00', venue: 'golden jubilee' },
      { event_id: 6, club_id: 5, title: 'chess evenet', description: '', event_date: '2025-11-04 18:30:00', venue: 'block c' }
    ],
    registrations: [
      { registration_id: 1, event_id: 1, member_id: 1, registered_on: '2026-11-03 13:37:06' },
      { registration_id: 2, event_id: 1, member_id: 2, registered_on: '2026-11-03 13:37:06' },
      { registration_id: 3, event_id: 2, member_id: 2, registered_on: '2026-11-03 13:37:06' },
      { registration_id: 4, event_id: 3, member_id: 3, registered_on: '2026-11-03 13:37:06' }
    ]
  };
}

const dataFile = path.join(__dirname, 'campushub-data.json');
let data;
try {
  if (fs.existsSync(dataFile)) {
    data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } else {
    data = getDefaultData();
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
  }
} catch (e) {
  data = getDefaultData();
}

function save() {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), 'utf8');
  } catch (_) {}
}

function nextId(table, idCol) {
  return data[table].reduce((max, r) => Math.max(max, r[idCol] || 0), 0) + 1;
}

// Universal query runner in Pure JavaScript
async function executePureQuery(sql, params = []) {
  const norm = sql.replace(/\s+/g, ' ').trim();

  // Generic COUNT(*) handler
  const countMatch = norm.match(/SELECT COUNT\(\*\)\s+(?:AS\s+(\w+)\s+)?FROM\s+(\w+)/i);
  if (countMatch) {
    const alias = countMatch[1] || 'count';
    const tbl = countMatch[2].toLowerCase();
    if (data[tbl]) {
      return [[{ [alias]: data[tbl].length }], []];
    }
  }

  // 1. Specific Stats queries
  if (/SELECT COUNT\(\*\) AS totalClubs FROM clubs/i.test(norm)) {
    return [[{ totalClubs: data.clubs.length }], []];
  }
  if (/SELECT COUNT\(\*\) AS totalMembers FROM members/i.test(norm)) {
    return [[{ totalMembers: data.members.length }], []];
  }
  if (/SELECT COUNT\(\*\) AS totalEvents FROM events/i.test(norm)) {
    return [[{ totalEvents: data.events.length }], []];
  }
  if (/SELECT COUNT\(\*\) AS totalRegistrations FROM registrations/i.test(norm)) {
    return [[{ totalRegistrations: data.registrations.length }], []];
  }

  // 2. Clubs List with counts
  if (/FROM clubs c\s+LEFT JOIN memberships/i.test(norm)) {
    const rows = data.clubs.map(c => {
      const total_members = new Set(data.memberships.filter(m => m.club_id == c.club_id).map(m => m.member_id)).size;
      const total_events = new Set(data.events.filter(e => e.club_id == c.club_id).map(e => e.event_id)).size;
      return { ...c, total_members, total_events };
    });
    return [rows, []];
  }

  // 3. Single Club by ID
  if (/SELECT \* FROM clubs WHERE club_id = \?/i.test(norm)) {
    const row = data.clubs.find(c => c.club_id == params[0]);
    return [row ? [row] : [], []];
  }

  // 4. Club Members
  if (/FROM memberships ms\s+JOIN members m ON ms\.member_id = m\.member_id\s+WHERE ms\.club_id = \?/i.test(norm)) {
    const rows = data.memberships
      .filter(ms => ms.club_id == params[0])
      .map(ms => {
        const m = data.members.find(mem => mem.member_id == ms.member_id) || {};
        return {
          member_id: m.member_id,
          full_name: m.full_name,
          usn: m.usn,
          email: m.email,
          phone: m.phone,
          course: m.course,
          semester: m.semester,
          role: ms.role,
          joined_on: ms.joined_on
        };
      });
    return [rows, []];
  }

  // 5. Club Events
  if (/SELECT event_id, title, description, event_date, venue FROM events WHERE club_id = \?/i.test(norm)) {
    const rows = data.events.filter(e => e.club_id == params[0]);
    return [rows, []];
  }

  // 6. Check unique club name
  if (/SELECT club_id FROM clubs WHERE club_name = \?/i.test(norm)) {
    const existing = data.clubs.find(c => c.club_name.toLowerCase() === String(params[0]).toLowerCase());
    return [existing ? [existing] : [], []];
  }

  // 7. Insert Club
  if (/INSERT INTO clubs/i.test(norm)) {
    const id = nextId('clubs', 'club_id');
    const newClub = {
      club_id: id,
      club_name: params[0],
      category: params[1],
      description: params[2],
      faculty_coordinator: params[3],
      founded_year: params[4]
    };
    data.clubs.push(newClub);
    save();
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  // 8. Update Club
  if (/UPDATE clubs SET/i.test(norm)) {
    const id = params[5];
    const idx = data.clubs.findIndex(c => c.club_id == id);
    if (idx !== -1) {
      data.clubs[idx] = {
        club_id: Number(id),
        club_name: params[0],
        category: params[1],
        description: params[2],
        faculty_coordinator: params[3],
        founded_year: params[4]
      };
      save();
      return [{ affectedRows: 1 }, []];
    }
    return [{ affectedRows: 0 }, []];
  }

  // 9. Delete Club (and cascades)
  if (/DELETE FROM registrations WHERE event_id = \?/i.test(norm)) {
    const before = data.registrations.length;
    data.registrations = data.registrations.filter(r => r.event_id != params[0]);
    save();
    return [{ affectedRows: before - data.registrations.length }, []];
  }
  if (/DELETE FROM events WHERE club_id = \?/i.test(norm)) {
    const before = data.events.length;
    data.events = data.events.filter(e => e.club_id != params[0]);
    save();
    return [{ affectedRows: before - data.events.length }, []];
  }
  if (/DELETE FROM memberships WHERE club_id = \?/i.test(norm)) {
    const before = data.memberships.length;
    data.memberships = data.memberships.filter(m => m.club_id != params[0]);
    save();
    return [{ affectedRows: before - data.memberships.length }, []];
  }
  if (/DELETE FROM clubs WHERE club_id = \?/i.test(norm)) {
    const before = data.clubs.length;
    data.clubs = data.clubs.filter(c => c.club_id != params[0]);
    save();
    return [{ affectedRows: before - data.clubs.length }, []];
  }

  // 10. Members List with total_clubs
  if (/FROM members m\s+LEFT JOIN memberships ms/i.test(norm)) {
    const rows = data.members.map(m => {
      const total_clubs = new Set(data.memberships.filter(ms => ms.member_id == m.member_id).map(ms => ms.club_id)).size;
      return { ...m, total_clubs };
    });
    return [rows, []];
  }

  // 11. Single Member by ID
  if (/SELECT \* FROM members WHERE member_id = \?/i.test(norm)) {
    const row = data.members.find(m => m.member_id == params[0]);
    return [row ? [row] : [], []];
  }

  // 12. Member clubs
  if (/FROM memberships ms\s+JOIN clubs c ON ms\.club_id = c\.club_id\s+WHERE ms\.member_id = \?/i.test(norm)) {
    const rows = data.memberships
      .filter(ms => ms.member_id == params[0])
      .map(ms => {
        const c = data.clubs.find(cl => cl.club_id == ms.club_id) || {};
        return {
          membership_id: ms.membership_id,
          role: ms.role,
          joined_on: ms.joined_on,
          club_id: c.club_id,
          club_name: c.club_name,
          category: c.category
        };
      });
    return [rows, []];
  }

  // 13. Member events registered
  if (/FROM registrations r\s+JOIN events e ON r\.event_id = e\.event_id\s+JOIN clubs c ON e\.club_id = c\.club_id\s+WHERE r\.member_id = \?/i.test(norm)) {
    const rows = data.registrations
      .filter(r => r.member_id == params[0])
      .map(r => {
        const e = data.events.find(ev => ev.event_id == r.event_id) || {};
        const c = data.clubs.find(cl => cl.club_id == e.club_id) || {};
        return {
          registration_id: r.registration_id,
          registered_on: r.registered_on,
          event_id: e.event_id,
          title: e.title,
          event_date: e.event_date,
          venue: e.venue,
          club_name: c.club_name
        };
      });
    return [rows, []];
  }

  // 14. Check unique member (usn or email)
  if (/FROM members WHERE usn = \? OR email = \?/i.test(norm)) {
    const existing = data.members.find(m => m.usn === params[0] || m.email === params[1]);
    return [existing ? [existing] : [], []];
  }

  // 15. Insert Member
  if (/INSERT INTO members/i.test(norm)) {
    const id = nextId('members', 'member_id');
    const newMember = {
      member_id: id,
      full_name: params[0],
      usn: params[1],
      email: params[2],
      phone: params[3],
      course: params[4],
      semester: params[5]
    };
    data.members.push(newMember);
    save();
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  // 16. Events List with total_registrations
  if (/FROM events e\s+JOIN clubs c ON e\.club_id = c\.club_id\s+LEFT JOIN registrations r/i.test(norm)) {
    const rows = data.events.map(e => {
      const c = data.clubs.find(cl => cl.club_id == e.club_id) || {};
      const total_registrations = data.registrations.filter(r => r.event_id == e.event_id).length;
      return {
        ...e,
        club_name: c.club_name,
        club_category: c.category,
        total_registrations
      };
    });
    return [rows, []];
  }

  // 17. Single Event by ID
  if (/FROM events e\s+JOIN clubs c ON e\.club_id = c\.club_id\s+WHERE e\.event_id = \?/i.test(norm)) {
    const e = data.events.find(ev => ev.event_id == params[0]);
    if (!e) return [[], []];
    const c = data.clubs.find(cl => cl.club_id == e.club_id) || {};
    return [[{ ...e, club_name: c.club_name, club_category: c.category }], []];
  }

  // 18. Event Attendees
  if (/FROM registrations r\s+JOIN members m ON r\.member_id = m\.member_id\s+WHERE r\.event_id = \?/i.test(norm)) {
    const rows = data.registrations
      .filter(r => r.event_id == params[0])
      .map(r => {
        const m = data.members.find(mem => mem.member_id == r.member_id) || {};
        return {
          registration_id: r.registration_id,
          registered_on: r.registered_on,
          member_id: m.member_id,
          full_name: m.full_name,
          usn: m.usn,
          email: m.email,
          course: m.course,
          semester: m.semester
        };
      });
    return [rows, []];
  }

  // 19. Insert Event
  if (/INSERT INTO events/i.test(norm)) {
    const id = nextId('events', 'event_id');
    const newEvent = {
      event_id: id,
      club_id: Number(params[0]),
      title: params[1],
      description: params[2],
      event_date: params[3],
      venue: params[4]
    };
    data.events.push(newEvent);
    save();
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  // 20. Memberships List
  if (/FROM memberships ms\s+JOIN members m ON ms\.member_id = m\.member_id\s+JOIN clubs c ON ms\.club_id = c\.club_id/i.test(norm)) {
    const rows = data.memberships.map(ms => {
      const m = data.members.find(mem => mem.member_id == ms.member_id) || {};
      const c = data.clubs.find(cl => cl.club_id == ms.club_id) || {};
      return {
        ...ms,
        full_name: m.full_name,
        usn: m.usn,
        club_name: c.club_name,
        category: c.category
      };
    });
    return [rows, []];
  }

  // 21. Check existing membership
  if (/FROM memberships WHERE member_id = \? AND club_id = \?/i.test(norm)) {
    const row = data.memberships.find(ms => ms.member_id == params[0] && ms.club_id == params[1]);
    return [row ? [row] : [], []];
  }

  // 22. Insert Membership
  if (/INSERT INTO memberships/i.test(norm)) {
    const id = nextId('memberships', 'membership_id');
    const newMs = {
      membership_id: id,
      member_id: Number(params[0]),
      club_id: Number(params[1]),
      role: params[2] || 'Member',
      joined_on: params[3]
    };
    data.memberships.push(newMs);
    save();
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  // 23. Registrations List
  if (/FROM registrations r\s+JOIN events e ON r\.event_id = e\.event_id\s+JOIN members m ON r\.member_id = m\.member_id\s+JOIN clubs c/i.test(norm)) {
    const rows = data.registrations.map(r => {
      const e = data.events.find(ev => ev.event_id == r.event_id) || {};
      const m = data.members.find(mem => mem.member_id == r.member_id) || {};
      const c = data.clubs.find(cl => cl.club_id == e.club_id) || {};
      return {
        ...r,
        event_title: e.title,
        event_date: e.event_date,
        venue: e.venue,
        member_name: m.full_name,
        usn: m.usn,
        club_name: c.club_name
      };
    });
    return [rows, []];
  }

  // 24. Check existing registration
  if (/FROM registrations WHERE event_id = \? AND member_id = \?/i.test(norm)) {
    const row = data.registrations.find(r => r.event_id == params[0] && r.member_id == params[1]);
    return [row ? [row] : [], []];
  }

  // 25. Insert Registration
  if (/INSERT INTO registrations/i.test(norm)) {
    const id = nextId('registrations', 'registration_id');
    const newReg = {
      registration_id: id,
      event_id: Number(params[0]),
      member_id: Number(params[1]),
      registered_on: params[2] || new Date().toISOString().slice(0, 19).replace('T', ' ')
    };
    data.registrations.push(newReg);
    save();
    return [{ insertId: id, affectedRows: 1 }, []];
  }

  console.warn('Unhandled query in pure-db:', norm);
  return [[], []];
}

module.exports = {
  query: executePureQuery,
  getConnection: async () => ({
    query: executePureQuery,
    beginTransaction: async () => {},
    commit: async () => {},
    rollback: async () => {},
    release: () => {}
  })
};
