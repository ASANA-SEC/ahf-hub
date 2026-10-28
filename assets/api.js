// Data layer. Both backends answer the same actions through call(action, payload):
//   Remote — Google Apps Script web app (Sheets + Drive), used when API_URL is set
//   Demo   — this browser's localStorage with example data; runs the same rules (core.js)
(function () {
  'use strict';
  const CFG = window.APP_CONFIG || {};
  const DEMO_KEY = 'ahfhub_demo_v1';
  const DEMO_USER = 'ahfhub_demo_user';
  const clone = (o) => JSON.parse(JSON.stringify(o));

  function ssGet(k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }
  function ssSet(k, v) { try { if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { /* blocked */ } }

  function readBase64(file) {
    return new Promise((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result).split(',')[1] || '');
      r.onerror = () => reject(new Error('Could not read the file.'));
      r.readAsDataURL(file);
    });
  }

  // ------------------------------------------------------------ Remote

  const Remote = {
    mode: 'remote',
    token: null,

    async call(action, payload) {
      let res;
      try {
        res = await fetch(CFG.API_URL, {
          method: 'POST',
          // text/plain keeps this a "simple" request, so Apps Script needs no CORS preflight
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action, token: this.token, payload: payload || {} }),
        });
      } catch (e) {
        throw Object.assign(new Error('Cannot reach the server. Check your internet connection.'), { code: 'NETWORK' });
      }
      let out;
      try { out = await res.json(); } catch (e) {
        throw Object.assign(new Error('The server sent an unexpected reply. Check API_URL in config.js.'), { code: 'BAD_REPLY' });
      }
      if (!out.ok) throw Object.assign(new Error(out.error || 'Request failed'), { code: out.code });
      return out.data;
    },

    async upload(id, file) {
      return this.call('item.upload', { id, fileName: file.name, mimeType: file.type, base64: await readBase64(file) });
    },
  };

  // ------------------------------------------------------------ Demo

  function day(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  const stamp = (offsetDays) => new Date(Date.now() + offsetDays * 864e5).toISOString();

  const DEMO_ACCOUNTS = {
    'sam.secov@gmail.com': 'Super admin — everything, including accounts, access and sections',
    'szesian.mitosc@gmail.com': 'Super admin',
    'eileen.secov@gmail.com': 'Super admin',
    'aisha@example.com': 'Employee Register, Recruitment, Leave, Training: Manager · Staff Expense Claims: Viewer',
    'grace@example.com': 'Client Invoices, Supplier Payments, Staff Expense Claims, Statutory Payments: Manager · Employee Register: Viewer',
    'farid@example.com': 'Company Licences, Assets & Vehicles, Admin Requests: Manager · Employee Register, Training: Viewer',
    'kelvin@example.com': 'Supplier Payments, Staff Expense Claims: Editor · Client Invoices, Statutory Payments: Contributor',
    'raj@example.com': 'No section access — sees only his own leave, claims and requests, and what he approves',
  };

  function seed() {
    const SAM = 'sam.secov@gmail.com';
    const users = [
      ['sam.secov@gmail.com', 'Sam'], ['szesian.mitosc@gmail.com', 'Sze Sian'], ['eileen.secov@gmail.com', 'Eileen'], ['aisha@example.com', 'Aisha (HR)'],
      ['grace@example.com', 'Grace (Finance)'], ['farid@example.com', 'Farid (Admin)'], ['kelvin@example.com', 'Kelvin (Accounts)'], ['raj@example.com', 'Raj (Site Engineer)'],
    ].map(([id, name]) => ({ id, name, active: true, createdBy: SAM, createdAt: stamp(-60), updatedAt: stamp(-60) }));

    const ids = {
      employees: 's_emp', recruitment: 's_rec', leave: 's_leave', training: 's_train',
      licences: 's_lic', assets: 's_assets', requests: 's_req',
      invoices: 's_inv', payables: 's_pay', claims: 's_claims', statutory: 's_stat',
    };
    const sections = window.TEMPLATES.map((t, i) => {
      const fields = clone(t.fields).map((f) => { if (f.type === 'link') f.target = ids[f.target] || ''; return f; });
      return { id: ids[t.id], name: t.name, template: t.id, order: i + 1, fields, stageField: t.stageField, archived: false, createdBy: SAM, createdAt: stamp(-60), updatedAt: stamp(-60) };
    });

    const A = 'aisha@example.com', G = 'grace@example.com', F = 'farid@example.com', K = 'kelvin@example.com', R = 'raj@example.com';
    const access = [
      [A, 's_emp', 'manager'], [A, 's_rec', 'manager'], [A, 's_leave', 'manager'], [A, 's_train', 'manager'], [A, 's_claims', 'viewer'],
      [G, 's_inv', 'manager'], [G, 's_pay', 'manager'], [G, 's_claims', 'manager'], [G, 's_stat', 'manager'], [G, 's_emp', 'viewer'],
      [F, 's_lic', 'manager'], [F, 's_assets', 'manager'], [F, 's_req', 'manager'], [F, 's_emp', 'viewer'], [F, 's_train', 'viewer'],
      [K, 's_pay', 'editor'], [K, 's_claims', 'editor'], [K, 's_inv', 'contributor'], [K, 's_stat', 'contributor'],
    ].map(([userId, sectionId, level], i) => ({ id: 'a' + i, sectionId, userId, level, createdBy: SAM, createdAt: stamp(-60), updatedAt: stamp(-60) }));

    const item = (id, sectionId, title, data, editors, collaborators, ageDays) => ({
      id, sectionId, title, data, editors: [...new Set(editors || [])], collaborators: [...new Set(collaborators || [])], files: [],
      stageChangedAt: stamp(-(ageDays || 0)), createdBy: SAM, createdAt: stamp(-(ageDays || 0) - 2), updatedAt: stamp(-(ageDays || 0)),
    });
    const pad = (n) => String(n).padStart(3, '0');
    const opt = (n) => (n === null ? '' : day(n));

    // HR
    const emp = (n, title, position, department, manager, employment, status, joined, confirm, passExpiry, age) =>
      item('i_em' + n, 's_emp', title, { staffNo: 'EMP-' + pad(n), position, department, manager, employment, status, joinDate: day(joined), confirmDate: opt(confirm), phone: '', passExpiry: opt(passExpiry), notes: '' }, [A], [], age);
    const items = [
      emp(1, 'Aisha (example)', 'HR Executive', 'admin', SAM, 'permanent', 'confirmed', -900, -810, null, 120),
      emp(2, 'Grace (example)', 'Finance Manager', 'admin', SAM, 'permanent', 'confirmed', -1500, -1410, null, 200),
      emp(3, 'Farid (example)', 'Admin Executive', 'admin', SAM, 'permanent', 'confirmed', -600, -510, null, 90),
      emp(4, 'Kelvin (example)', 'Accounts Clerk', 'admin', G, 'permanent', 'probation', -70, 20, null, 70),
      emp(5, 'Raj (example)', 'Site Engineer', 'site', SAM, 'permanent', 'confirmed', -400, -310, null, 60),
      emp(6, 'Worker A (example)', 'Site Technician', 'site', R, 'foreign', 'confirmed', -700, -610, 25, 30),
      emp(7, 'New Joiner B (example)', 'Project Coordinator', 'project', SAM, 'contract', 'onboarding', -3, 87, null, 3),
      emp(8, 'Staff C (example)', 'Procurement Executive', 'procurement', SAM, 'permanent', 'notice', -1000, -910, null, 10),
      emp(9, 'Staff D (example)', 'Draftsman', 'project', SAM, 'contract', 'resigned', -800, -710, null, 40),
    ];

    const rec = (n, title, department, manager, candidate, source, stage, priority, headcount, interview, start, target, age) =>
      item('i_rc' + n, 's_rec', title, { department, hiringManager: manager, candidate, source, stage, priority, headcount, interviewDate: interview, startDate: opt(start), targetDate: day(target), notes: '' }, [A, manager], [], age);
    items.push(
      rec(1, 'Project Engineer (replacement for Staff C)', 'project', SAM, '', 'jobstreet', 'interview', 'high', 1, day(2) + 'T10:00', null, 21, 9),
      rec(2, 'Tender Executive', 'tender', SAM, 'Candidate E (example)', 'referral', 'offer', 'normal', 1, '', 14, 14, 4),
      rec(3, 'Site Supervisor × 2', 'site', R, '', 'agency', 'open', 'urgent', 2, '', null, -3, 20),
      rec(4, 'Project Coordinator', 'project', SAM, 'New Joiner B (example)', 'linkedin', 'joined', 'normal', 1, '', -3, -10, 3),
      rec(5, 'Accounts Assistant (intern)', 'admin', G, '', 'other', 'requested', 'normal', 1, '', null, 30, 1),
    );

    const lv = (n, title, empId, type, approver, status, start, end, days, cover, age, cols) =>
      item('i_lv' + n, 's_leave', title, { employee: empId, leaveType: type, approver, status, startDate: day(start), endDate: day(end), days, cover, notes: '' }, [A, approver], cols || [], age);
    items.push(
      lv(1, 'Annual leave — family trip', 'i_em5', 'annual', SAM, 'pending', 6, 10, 5, '', 1, [R]),
      lv(2, 'Medical leave', 'i_em4', 'medical', G, 'taken', -5, -4, 2, '', 4),
      lv(3, 'Annual leave — CNY', 'i_em2', 'annual', SAM, 'approved', 40, 44, 5, K, 6),
      lv(4, 'Emergency leave', 'i_em6', 'emergency', R, 'pending', -1, -1, 1, '', 3),
      lv(5, 'Annual leave', 'i_em3', 'annual', SAM, 'rejected', 3, 4, 2, '', 5),
    );

    const tr = (n, title, empId, type, provider, status, certNo, cost, hrdf, course, expiry, age) =>
      item('i_tr' + n, 's_train', title, { employee: empId, certType: type, provider, status, certNo, cost, hrdf, courseDate: opt(course), expiryDate: opt(expiry), notes: '' }, [A], [], age);
    items.push(
      tr(1, 'NIOSH SSO / OGSP renewal', 'i_em5', 'safety', 'NIOSH', 'renewal', 'OGSP-xxxx', 650, true, 12, 18, 10),
      tr(2, 'CIDB green card', 'i_em6', 'cidb', 'CIDB', 'valid', 'CIDB-xxxx', 10, false, -300, 65, 300),
      tr(3, 'CIDB green card', 'i_em7', 'cidb', 'CIDB', 'registered', '', 10, false, 5, null, 2),
      tr(4, 'Excel for finance — advanced', 'i_em4', 'course', 'Training provider (example)', 'planned', '', 1200, true, 20, 14, 5),
      tr(5, 'CSWIP 3.1 Welding Inspector', 'i_em5', 'competency', 'TWI', 'expired', 'CSWIP-xxxx', 0, false, -1800, -12, 30),
    );

    // Admin
    const lic = (n, title, refNo, authority, owner, status, grade, fee, issued, expiry, age) =>
      item('i_lc' + n, 's_lic', title, { refNo, authority, owner, status, grade, fee, issueDate: opt(issued), expiryDate: day(expiry), portal: '', notes: '' }, [F], [G], age);
    items.push(
      lic(1, 'SSM company registration', '2015010xxxxx (example)', 'ssm', F, 'valid', '', 0, -3650, 3650, 300),
      lic(2, 'CIDB registration — G7', 'CIDB-xxxx (example)', 'cidb', F, 'preparing', 'G7 · CE, ME', 2500, -700, 28, 12),
      lic(3, 'PETRONAS licence (SWEC)', 'PL-xxxx (example)', 'petronas', F, 'submitted', 'SG 2.x codes', 1800, -1095, -6, 20),
      lic(4, 'MOF registration (ePerolehan)', 'MOF-xxxx (example)', 'mof', F, 'valid', '', 400, -300, 430, 200),
      lic(5, 'Fire insurance — office', 'POL-xxxx (example)', 'insurer', G, 'valid', '', 3200, -340, 25, 60),
      lic(6, 'Business premise licence', 'LIC-xxxx (example)', 'council', F, 'expired', '', 350, -380, -15, 30),
    );

    const ast = (n, title, tag, type, empId, status, serial, cost, purchased, due, age) =>
      item('i_as' + n, 's_assets', title, { assetTag: tag, assetType: type, employee: empId, status, serialNo: serial, cost, purchaseDate: opt(purchased), dueDate: opt(due), notes: '' }, [F], [], age);
    items.push(
      ast(1, 'Toyota Hilux 2.4 (example)', 'VXX 1234', 'vehicle', 'i_em5', 'in_use', 'MR0xxxx', 135000, -900, 12, 30),
      ast(2, 'Proton X70 (example)', 'WXX 5678', 'vehicle', 'i_em2', 'in_use', 'PL1xxxx', 112000, -500, 95, 60),
      ast(3, 'Laptop — Dell Latitude', 'IT-021', 'it', 'i_em4', 'in_use', 'SN-xxxx', 4200, -70, null, 70),
      ast(4, 'Laptop — spare', 'IT-014', 'it', '', 'spare', 'SN-xxxx', 3800, -800, null, 40),
      ast(5, 'Gas detector (4-gas)', 'EQ-007', 'equipment', 'i_em5', 'repair', 'SN-xxxx', 5600, -400, -2, 9),
      ast(6, 'Company phone', 'PH-005', 'phone', 'i_em8', 'in_use', 'IMEI-xxxx', 2100, -600, null, 100),
    );

    const req = (n, title, type, requester, assignee, status, priority, cost, due, age, cols) =>
      item('i_rq' + n, 's_req', title, { requestType: type, requester, assignee, status, priority, cost, dueDate: day(due), notes: '' }, [F, requester], cols || [], age);
    items.push(
      req(1, 'Email & laptop for New Joiner B', 'it', A, F, 'progress', 'high', 0, 1, 2),
      req(2, 'Hotel 3 nights — Bintulu site visit', 'travel', R, F, 'new', 'normal', 900, 4, 0.5),
      req(3, 'Aircond service — level 2 office', 'office', F, F, 'waiting', 'normal', 680, -2, 6),
      req(4, 'Employment confirmation letter', 'letter', K, A, 'done', 'normal', 0, -8, 9, [A]),
      req(5, 'A4 paper & toner restock', 'stationery', F, F, 'new', 'normal', 450, 6, 1),
    );

    // Finance
    const inv = (n, title, no, client, project, owner, status, amount, received, retention, invoiced, paid, due, age) =>
      item('i_in' + n, 's_inv', title, { invoiceNo: no, client, project, owner, status, amount, received, retention, invoiceDate: opt(invoiced), paidDate: opt(paid), dueDate: day(due), notes: '' }, [G], [SAM, K], age);
    items.push(
      inv(1, 'Progress claim #3 — pipe spools Phase 1', 'PC-DEMO-003', 'Client A (example)', 'PO-DEMO-4410', G, 'submitted', 420000, 0, 21000, null, null, 6, 12),
      inv(2, 'Progress claim #2 — HVAC maintenance', 'INV-DEMO-118', 'Client B (example)', 'CT-DEMO-022', G, 'invoiced', 186000, 0, 9300, -40, null, -10, 40),
      inv(3, 'Supply of fire extinguishers — full delivery', 'INV-DEMO-121', 'Client D (example)', 'PO-DEMO-5521', K, 'partial', 185000, 92500, 0, -35, -5, -5, 5),
      inv(4, 'Progress claim #4 — pipe spools Phase 1', 'PC-DEMO-004', 'Client A (example)', 'PO-DEMO-4410', G, 'preparing', 380000, 0, 19000, null, null, 9, 2),
      inv(5, 'Calibration services Q3', 'INV-DEMO-109', 'Client B (example)', 'CT-DEMO-019', K, 'paid', 64000, 64000, 0, -75, -20, -15, 20),
      inv(6, 'Variation order VO-02 — extra spools', 'INV-DEMO-112', 'Client A (example)', 'PO-DEMO-4410', G, 'disputed', 58000, 0, 0, -60, null, -30, 14),
    );

    const pay = (n, title, no, supplier, po, verifier, status, amount, terms, invoiced, paid, due, age) =>
      item('i_py' + n, 's_pay', title, { invoiceNo: no, supplier, poNo: po, verifier, status, amount, terms, invoiceDate: day(invoiced), paidDate: opt(paid), dueDate: day(due), notes: '' }, [G, K], [], age);
    items.push(
      pay(1, 'Pipe spools — fabrication progress #3', 'SB-2291', 'Supplier B Engineering (example)', 'PO-DEMO-0912', R, 'verifying', 260000, 'backtoback', -6, null, 24, 6),
      pay(2, 'Valves delivery — lot 1', 'SA-1180', 'Supplier A Valves (example)', 'PO-DEMO-0915', K, 'approval', 148000, '60', -50, null, 10, 2),
      pay(3, 'Cable glands', 'SC-0455', 'Supplier C Electrical (example)', 'PO-DEMO-0920', K, 'scheduled', 36500, '30', -28, null, 2, 1),
      pay(4, 'Scaffolding rental — Oct', 'SS-7702', 'Subcon S Scaffold (example)', 'PO-DEMO-0901', R, 'paid', 18400, '30', -45, -12, -15, 12),
      pay(5, 'Toolbox & PPE', 'ST-0099', 'Supplier T Trading (example)', 'PO-DEMO-0925', K, 'on_hold', 7200, 'cod', -9, null, -2, 4),
      pay(6, 'Courier charges — Oct', 'CR-1031', 'Courier (example)', 'Office', K, 'received', 640, '30', -1, null, 29, 1),
    );

    const clm = (n, title, empId, type, approver, status, amount, project, spent, due, age, editors) =>
      item('i_cl' + n, 's_claims', title, { employee: empId, claimType: type, approver, status, amount, project, expenseDate: day(spent), dueDate: day(due), notes: '' }, [G, K].concat(editors || []), [], age);
    items.push(
      clm(1, 'Mileage & toll — Kerteh site, Oct', 'i_em5', 'mileage', SAM, 'approval', 1260, 'Pipe spools Phase 1', -10, 5, 3, [R]),
      clm(2, 'Flight & hotel — Bintulu kick-off', 'i_em5', 'travel', SAM, 'approved', 2480, 'HVAC maintenance', -20, 3, 6, [R]),
      clm(3, 'Client lunch — Client A', 'i_em2', 'meal', SAM, 'paid', 380, 'Business development', -25, -10, 10),
      clm(4, 'Office pantry & petty cash', 'i_em3', 'petty', G, 'returned', 215, 'Office', -8, -1, 4),
      clm(5, 'Clinic — outpatient', 'i_em4', 'medical', A, 'submitted', 90, '', -3, 7, 1),
    );

    const stat = (n, title, type, period, owner, status, amount, receipt, paid, due, age) =>
      item('i_st' + n, 's_stat', title, { paymentType: type, period, owner, status, amount, receiptNo: receipt, paidDate: opt(paid), dueDate: day(due), notes: '' }, [G], [K], age);
    items.push(
      stat(1, 'EPF — October', 'epf', 'Oct 2026', K, 'preparing', 48200, '', null, 17, 2),
      stat(2, 'SOCSO & EIS — October', 'socso', 'Oct 2026', K, 'pending', 6900, '', null, 17, 2),
      stat(3, 'PCB / MTD — October', 'pcb', 'Oct 2026', G, 'pending', 21500, '', null, 17, 2),
      stat(4, 'HRD Corp levy — October', 'hrdf', 'Oct 2026', K, 'pending', 2400, '', null, 17, 2),
      stat(5, 'SST-02 return — Sep–Oct', 'sst', 'Sep–Oct 2026', G, 'approval', 38600, '', null, 31, 3),
      stat(6, 'CP204 instalment — Oct', 'tax', 'Oct 2026', G, 'paid', 15000, 'LHDN-xxxx', -14, -14, 14),
      stat(7, 'EPF — September', 'epf', 'Sep 2026', K, 'paid', 47900, 'KWSP-xxxx', -15, -13, 15),
    );
    return { users, sections, access, items, comments: [] };
  }

  function demoStore() {
    let db = null;
    function load() {
      if (db) return db;
      try { db = JSON.parse(localStorage.getItem(DEMO_KEY) || 'null'); } catch (e) { db = null; }
      if (!db || !Array.isArray(db.sections)) db = seed();
      ['users', 'sections', 'access', 'items', 'comments'].forEach((t) => { if (!Array.isArray(db[t])) db[t] = []; });
      persist();
      return db;
    }
    function persist() { try { localStorage.setItem(DEMO_KEY, JSON.stringify(db)); } catch (e) { /* blocked */ } }
    const noDrive = () => Core.fail('DEMO', 'Attachments are saved to Google Drive. They start working after the Google setup in README.md.');
    return {
      all: (t) => clone(load()[t]),
      insert: (t, rec) => { load()[t].push(clone(rec)); persist(); },
      insertMany: (t, recs) => { load()[t].push(...clone(recs)); persist(); },
      save: (t, rec) => {
        const rows = load()[t];
        const i = rows.findIndex((r) => r.id === rec.id);
        if (i < 0) throw Core.fail('NOT_FOUND', 'This record no longer exists.');
        rows[i] = clone(rec);
        persist();
      },
      del: (t, id) => { db[t] = load()[t].filter((r) => r.id !== id); persist(); },
      delWhere: (t, fn) => { db[t] = load()[t].filter((r) => !fn(r)); persist(); },
      now: () => new Date().toISOString(),
      uid: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      saveFile: () => { throw noDrive(); },
      readFile: () => { throw noDrive(); },
      reset: () => { try { localStorage.removeItem(DEMO_KEY); } catch (e) { /* blocked */ } db = null; },
    };
  }

  const store = demoStore();

  const Demo = {
    mode: 'demo',
    me: null,

    restore() {
      const email = ssGet(DEMO_USER);
      if (!email) return false;
      try { this.me = Core.identify(store, email, ''); } catch (e) { this.me = null; ssSet(DEMO_USER, null); }
      return !!this.me;
    },
    login(email) {
      this.me = Core.identify(store, email, '');
      ssSet(DEMO_USER, email);
    },
    logout() { this.me = null; ssSet(DEMO_USER, null); },
    accounts() {
      return store.all('users').filter((u) => u.active !== false)
        .map((u) => ({ id: u.id, name: u.name, note: DEMO_ACCOUNTS[u.id] || 'Added in this demo' }));
    },
    async call(action, payload) {
      if (!this.me) throw Core.fail('AUTH_REQUIRED', 'Please sign in.');
      // Re-check the account each call, like the server does
      this.me = Core.identify(store, this.me.id, '');
      return clone(Core.handle(store, this.me, action, payload || {}));
    },
    async upload(id, file) {
      return this.call('item.upload', { id, fileName: file.name, mimeType: file.type, base64: '' });
    },
    reset() { store.reset(); this.logout(); },
  };

  // On this computer, http://localhost:8769/?demo forces demo mode for testing.
  // &reset starts from fresh example data; &as=<email> signs in as that example account (used to record the user guide).
  const local = /^(localhost|127\.0\.0\.1)$/.test(location.hostname);
  const params = new URLSearchParams(location.search);
  const forceDemo = local && params.has('demo');
  if (forceDemo && params.has('reset')) store.reset();
  if (forceDemo && params.get('as')) { try { Demo.login(params.get('as')); } catch (e) { /* unknown example account */ } }
  Demo.clean = forceDemo && params.has('clean'); // hide the demo banner for user-guide screenshots
  window.API = CFG.API_URL && !forceDemo ? Remote : Demo;
})();
