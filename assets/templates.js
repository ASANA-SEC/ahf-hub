// Starter templates for new sections. Once a section is created its columns live in the
// Google Sheet and are edited in the app (Customize), so changing this file only affects
// sections created afterwards. `target` on a link column names another template id; it is
// matched to the section created from that template, so a template must come after the
// ones it links to.
(function () {
  'use strict';
  const o = (value, label, color, extra) => Object.assign({ value, label, color }, extra || {});
  const title = (label) => ({ key: 'title', label, type: 'text', required: true, system: true, onCard: true });

  const priority = () => ({ key: 'priority', label: 'Priority', type: 'select', onCard: true, options: [o('normal', 'Normal', 'gray'), o('high', 'High', 'amber'), o('urgent', 'Urgent', 'red')] });
  const employee = (label) => ({ key: 'employee', label: label || 'Employee', type: 'link', target: 'employees', onCard: true });
  const dept = () => ({ key: 'department', label: 'Department', type: 'select', onCard: true, options: [o('management', 'Management', 'purple'), o('project', 'Project', 'blue'), o('tender', 'Tender / RFQ', 'amber'), o('procurement', 'Procurement', 'teal'), o('site', 'Site / Operations', 'green'), o('admin', 'Admin, HR & Finance', 'gray')] });

  window.TEMPLATES = [
    // ------------------------------------------------------------ HR
    {
      id: 'employees',
      name: 'Employee Register',
      blurb: 'Every staff member: position, department, join date, probation and pass / permit expiry. No salary.',
      stageField: 'status',
      fields: [
        title('Full name'),
        { key: 'staffNo', label: 'Staff no.', type: 'text', required: true, onCard: true },
        { key: 'position', label: 'Position', type: 'text', onCard: true },
        dept(),
        { key: 'manager', label: 'Reports to', type: 'person' },
        { key: 'employment', label: 'Employment type', type: 'select', options: [o('permanent', 'Permanent', 'green'), o('contract', 'Contract', 'blue'), o('intern', 'Intern / Trainee', 'teal'), o('foreign', 'Foreign worker', 'amber')] },
        { key: 'status', label: 'Status', type: 'select', options: [
          o('onboarding', 'Onboarding', 'blue', { alertDays: 7 }),
          o('probation', 'On Probation', 'amber'),
          o('confirmed', 'Confirmed', 'green'),
          o('notice', 'Serving Notice', 'red', { alertDays: 30 }),
          o('resigned', 'Resigned / Left', 'gray', { done: true }),
        ] },
        { key: 'joinDate', label: 'Join date', type: 'date' },
        { key: 'confirmDate', label: 'Probation ends', type: 'date' },
        { key: 'phone', label: 'Phone / email', type: 'text' },
        { key: 'passExpiry', label: 'Work pass / permit expiry', type: 'date', due: true, onCard: true },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
    {
      id: 'recruitment',
      name: 'Recruitment',
      blurb: 'Open positions and candidates, from approval and interviews to offer and joining.',
      stageField: 'stage',
      fields: [
        title('Position / candidate'),
        dept(),
        { key: 'hiringManager', label: 'Hiring manager', type: 'person', onCard: true },
        { key: 'candidate', label: 'Candidate', type: 'text', onCard: true },
        { key: 'source', label: 'Source', type: 'select', options: [o('jobstreet', 'JobStreet', 'blue'), o('linkedin', 'LinkedIn', 'teal'), o('referral', 'Referral', 'green'), o('agency', 'Agency', 'purple'), o('other', 'Other', 'gray')] },
        { key: 'stage', label: 'Stage', type: 'select', options: [
          o('requested', 'Requested — awaiting approval', 'gray', { alertDays: 3 }),
          o('open', 'Open — sourcing', 'blue', { alertDays: 14 }),
          o('interview', 'Interviewing', 'amber', { alertDays: 7 }),
          o('offer', 'Offer Sent', 'purple', { alertDays: 5 }),
          o('accepted', 'Accepted — to join', 'teal', { met: true }),
          o('joined', 'Joined', 'green', { done: true }),
          o('declined', 'Declined / Rejected', 'red', { done: true }),
          o('cancelled', 'Cancelled', 'gray', { done: true }),
        ] },
        priority(),
        { key: 'headcount', label: 'Headcount', type: 'number' },
        { key: 'interviewDate', label: 'Interview on', type: 'datetime' },
        { key: 'startDate', label: 'Start date', type: 'date' },
        { key: 'targetDate', label: 'Fill by', type: 'date', due: true, onCard: true },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
    {
      id: 'leave',
      name: 'Leave Applications',
      blurb: 'Annual, medical, emergency and other leave, with approval and who covers the work.',
      stageField: 'status',
      fields: [
        title('Leave'),
        employee(),
        { key: 'leaveType', label: 'Leave type', type: 'select', onCard: true, options: [o('annual', 'Annual', 'blue'), o('medical', 'Medical (MC)', 'red'), o('emergency', 'Emergency', 'amber'), o('hospital', 'Hospitalisation', 'purple'), o('unpaid', 'Unpaid', 'gray'), o('other', 'Other (maternity, compassionate…)', 'teal')] },
        { key: 'approver', label: 'Approver', type: 'person', onCard: true },
        { key: 'status', label: 'Status', type: 'select', options: [
          o('pending', 'Pending Approval', 'amber', { alertDays: 2 }),
          o('approved', 'Approved', 'green', { met: true }),
          o('rejected', 'Rejected', 'red', { done: true }),
          o('taken', 'Taken / Recorded', 'gray', { done: true }),
          o('cancelled', 'Cancelled', 'gray', { done: true }),
        ] },
        { key: 'startDate', label: 'First day', type: 'date', due: true, onCard: true },
        { key: 'endDate', label: 'Last day', type: 'date' },
        { key: 'days', label: 'Days', type: 'number', total: true, onCard: true },
        { key: 'cover', label: 'Work covered by', type: 'person' },
        { key: 'notes', label: 'Reason / notes', type: 'longtext' },
      ],
    },
    {
      id: 'training',
      name: 'Training & Certifications',
      blurb: 'Courses and safety / competency certificates (NIOSH, CIDB green card, OGSP…) with renewal dates.',
      stageField: 'status',
      fields: [
        title('Course / certificate'),
        employee(),
        { key: 'certType', label: 'Type', type: 'select', onCard: true, options: [o('safety', 'Safety passport (NIOSH / OGSP)', 'red'), o('cidb', 'CIDB green card', 'green'), o('competency', 'Competency (DOSH, ST, CSWIP…)', 'blue'), o('course', 'Internal / external course', 'purple'), o('other', 'Other', 'gray')] },
        { key: 'provider', label: 'Provider', type: 'text' },
        { key: 'status', label: 'Status', type: 'select', options: [
          o('planned', 'Planned', 'gray', { alertDays: 14 }),
          o('registered', 'Registered', 'blue', { alertDays: 7 }),
          o('valid', 'Certified — valid', 'green'),
          o('renewal', 'Renewal Due', 'amber', { alertDays: 14 }),
          o('expired', 'Expired', 'red'),
          o('cancelled', 'Cancelled / not needed', 'gray', { done: true }),
        ] },
        { key: 'certNo', label: 'Certificate no.', type: 'text' },
        { key: 'cost', label: 'Cost', type: 'currency', total: true },
        { key: 'hrdf', label: 'HRD Corp claimable', type: 'checkbox' },
        { key: 'courseDate', label: 'Course date', type: 'date' },
        { key: 'expiryDate', label: 'Expiry / renew by', type: 'date', due: true, onCard: true },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },

    // ------------------------------------------------------------ Admin
    {
      id: 'licences',
      name: 'Company Licences & Registrations',
      blurb: 'SSM, CIDB, PETRONAS / MOF registrations, trade licences, insurance and permits, with renewal dates.',
      stageField: 'status',
      fields: [
        title('Licence / registration'),
        { key: 'refNo', label: 'Registration / policy no.', type: 'text', onCard: true },
        { key: 'authority', label: 'Issued by', type: 'select', onCard: true, options: [o('ssm', 'SSM', 'blue'), o('cidb', 'CIDB', 'green'), o('petronas', 'PETRONAS / SWEC', 'teal'), o('mof', 'MOF / ePerolehan', 'purple'), o('council', 'Local council / DOSH / ST', 'amber'), o('insurer', 'Insurer', 'red'), o('other', 'Other', 'gray')] },
        { key: 'owner', label: 'Person in charge', type: 'person', onCard: true },
        { key: 'status', label: 'Status', type: 'select', options: [
          o('valid', 'Valid', 'green'),
          o('preparing', 'Preparing Renewal', 'amber', { alertDays: 14 }),
          o('submitted', 'Renewal Submitted', 'blue', { alertDays: 30, met: true }),
          o('expired', 'Expired', 'red'),
          o('closed', 'No Longer Needed', 'gray', { done: true }),
        ] },
        { key: 'grade', label: 'Grade / class / codes', type: 'text' },
        { key: 'fee', label: 'Renewal fee', type: 'currency', total: true },
        { key: 'issueDate', label: 'Issued on', type: 'date' },
        { key: 'expiryDate', label: 'Expiry date', type: 'date', due: true, onCard: true },
        { key: 'portal', label: 'Portal / renewal link', type: 'url' },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
    {
      id: 'assets',
      name: 'Assets & Vehicles',
      blurb: 'Company vehicles, laptops, phones and equipment: who holds what, and when road tax, insurance or service is due.',
      stageField: 'status',
      fields: [
        title('Asset'),
        { key: 'assetTag', label: 'Asset tag / plate no.', type: 'text', required: true, onCard: true },
        { key: 'assetType', label: 'Type', type: 'select', onCard: true, options: [o('vehicle', 'Vehicle', 'blue'), o('it', 'Laptop / IT', 'purple'), o('phone', 'Phone', 'teal'), o('equipment', 'Site equipment / tools', 'amber'), o('furniture', 'Office furniture', 'gray')] },
        employee('Assigned to'),
        { key: 'status', label: 'Status', type: 'select', options: [
          o('in_use', 'In Use', 'green'),
          o('spare', 'Spare / In Store', 'blue'),
          o('repair', 'Under Repair / Service', 'amber', { alertDays: 7 }),
          o('lost', 'Lost / Damaged', 'red', { alertDays: 3 }),
          o('disposed', 'Disposed', 'gray', { done: true }),
        ] },
        { key: 'serialNo', label: 'Serial / chassis no.', type: 'text' },
        { key: 'cost', label: 'Purchase cost', type: 'currency', total: true },
        { key: 'purchaseDate', label: 'Purchased on', type: 'date' },
        { key: 'dueDate', label: 'Next road tax / insurance / service', type: 'date', due: true, onCard: true },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
    {
      id: 'requests',
      name: 'Admin Requests',
      blurb: 'Office, IT, stationery, travel and facility requests from staff, until they are done.',
      stageField: 'status',
      fields: [
        title('Request'),
        { key: 'requestType', label: 'Type', type: 'select', onCard: true, options: [o('it', 'IT / access', 'purple'), o('office', 'Office / facility', 'blue'), o('stationery', 'Stationery / supplies', 'teal'), o('travel', 'Travel / accommodation', 'amber'), o('letter', 'Letter / document', 'green'), o('other', 'Other', 'gray')] },
        { key: 'requester', label: 'Requested by', type: 'person', onCard: true },
        { key: 'assignee', label: 'Handled by', type: 'person' },
        { key: 'status', label: 'Status', type: 'select', options: [
          o('new', 'New', 'gray', { alertDays: 1 }),
          o('progress', 'In Progress', 'blue', { alertDays: 3 }),
          o('waiting', 'Waiting (vendor / approval)', 'amber', { alertDays: 5 }),
          o('done', 'Done', 'green', { done: true }),
          o('rejected', 'Rejected', 'red', { done: true }),
        ] },
        priority(),
        { key: 'cost', label: 'Cost', type: 'currency', total: true },
        { key: 'dueDate', label: 'Needed by', type: 'date', due: true, onCard: true },
        { key: 'notes', label: 'Details', type: 'longtext' },
      ],
    },

    // ------------------------------------------------------------ Finance
    {
      id: 'invoices',
      name: 'Client Invoices & Collections',
      blurb: 'Progress claims and invoices to clients, from claim submission and certification to payment received.',
      stageField: 'status',
      fields: [
        title('Claim / invoice'),
        { key: 'invoiceNo', label: 'Invoice / claim no.', type: 'text', required: true, onCard: true },
        { key: 'client', label: 'Client', type: 'text', onCard: true },
        { key: 'project', label: 'Project / PO no.', type: 'text' },
        { key: 'owner', label: 'Follow-up PIC', type: 'person', onCard: true },
        { key: 'status', label: 'Status', type: 'select', options: [
          o('preparing', 'Preparing Claim', 'gray', { alertDays: 3 }),
          o('submitted', 'Claim Submitted — awaiting certification', 'amber', { alertDays: 14 }),
          o('certified', 'Certified', 'purple', { alertDays: 3 }),
          o('invoiced', 'Invoiced — awaiting payment', 'blue', { alertDays: 30 }),
          o('partial', 'Partially Paid', 'teal', { alertDays: 14 }),
          o('paid', 'Paid', 'green', { done: true }),
          o('disputed', 'Disputed', 'red', { alertDays: 7 }),
          o('written_off', 'Written Off', 'gray', { done: true }),
        ] },
        { key: 'amount', label: 'Invoice amount', type: 'currency', total: true, onCard: true },
        { key: 'received', label: 'Amount received', type: 'currency', total: true },
        { key: 'retention', label: 'Retention held', type: 'currency', total: true },
        { key: 'invoiceDate', label: 'Invoice date', type: 'date' },
        { key: 'paidDate', label: 'Paid on', type: 'date' },
        { key: 'dueDate', label: 'Payment due', type: 'date', due: true, onCard: true },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
    {
      id: 'payables',
      name: 'Supplier Payments',
      blurb: 'Supplier and subcontractor invoices, from verification and approval to payment.',
      stageField: 'status',
      fields: [
        title('Supplier invoice'),
        { key: 'invoiceNo', label: 'Supplier invoice no.', type: 'text', required: true, onCard: true },
        { key: 'supplier', label: 'Supplier / subcon', type: 'text', onCard: true },
        { key: 'poNo', label: 'Our PO / project', type: 'text' },
        { key: 'verifier', label: 'Verified by', type: 'person' },
        { key: 'status', label: 'Status', type: 'select', options: [
          o('received', 'Received', 'gray', { alertDays: 2 }),
          o('verifying', 'Verifying (GRN / work done)', 'blue', { alertDays: 5 }),
          o('approval', 'Pending Approval', 'amber', { alertDays: 3 }),
          o('scheduled', 'Approved — payment scheduled', 'purple'),
          o('paid', 'Paid', 'green', { done: true }),
          o('on_hold', 'On Hold / Disputed', 'red', { alertDays: 7 }),
        ] },
        { key: 'amount', label: 'Amount', type: 'currency', total: true, onCard: true },
        { key: 'terms', label: 'Payment terms', type: 'select', options: [o('cod', 'COD', 'red'), o('30', '30 days', 'blue'), o('60', '60 days', 'teal'), o('90', '90 days', 'green'), o('backtoback', 'Back-to-back', 'purple')] },
        { key: 'invoiceDate', label: 'Invoice date', type: 'date' },
        { key: 'paidDate', label: 'Paid on', type: 'date' },
        { key: 'dueDate', label: 'Payment due', type: 'date', due: true, onCard: true },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
    {
      id: 'claims',
      name: 'Staff Expense Claims',
      blurb: 'Mileage, travel, entertainment and petty cash claims, from submission and approval to reimbursement.',
      stageField: 'status',
      fields: [
        title('Claim'),
        employee('Claimant'),
        { key: 'claimType', label: 'Type', type: 'select', onCard: true, options: [o('mileage', 'Mileage / toll / parking', 'blue'), o('travel', 'Travel & accommodation', 'purple'), o('meal', 'Meals / entertainment', 'amber'), o('medical', 'Medical', 'red'), o('petty', 'Petty cash / purchases', 'teal'), o('other', 'Other', 'gray')] },
        { key: 'approver', label: 'Approver', type: 'person', onCard: true },
        { key: 'status', label: 'Status', type: 'select', options: [
          o('submitted', 'Submitted', 'gray', { alertDays: 2 }),
          o('approval', 'Pending Approval', 'amber', { alertDays: 3 }),
          o('approved', 'Approved — to pay', 'blue', { alertDays: 7 }),
          o('returned', 'Returned — needs receipts', 'red', { alertDays: 5 }),
          o('paid', 'Paid', 'green', { done: true }),
          o('rejected', 'Rejected', 'gray', { done: true }),
        ] },
        { key: 'amount', label: 'Amount', type: 'currency', total: true, onCard: true },
        { key: 'project', label: 'Charge to project', type: 'text' },
        { key: 'expenseDate', label: 'Expense date', type: 'date' },
        { key: 'dueDate', label: 'Pay by', type: 'date', due: true, onCard: true },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
    {
      id: 'statutory',
      name: 'Statutory Payments',
      blurb: 'Monthly EPF, SOCSO, EIS, PCB and HRD Corp, plus SST, income tax instalments (CP204) and other filings, with due dates.',
      stageField: 'status',
      fields: [
        title('Payment / filing'),
        { key: 'paymentType', label: 'Type', type: 'select', onCard: true, options: [o('epf', 'EPF / KWSP', 'blue'), o('socso', 'SOCSO & EIS', 'teal'), o('pcb', 'PCB / MTD', 'purple'), o('hrdf', 'HRD Corp levy', 'green'), o('sst', 'SST return', 'amber'), o('tax', 'Income tax (CP204 / Form C / Form E)', 'red'), o('other', 'Other', 'gray')] },
        { key: 'period', label: 'Period', type: 'text', onCard: true },
        { key: 'owner', label: 'Person in charge', type: 'person', onCard: true },
        { key: 'status', label: 'Status', type: 'select', options: [
          o('pending', 'Pending', 'gray', { alertDays: 5 }),
          o('preparing', 'Preparing', 'amber', { alertDays: 3 }),
          o('approval', 'Pending Approval', 'blue', { alertDays: 2 }),
          o('paid', 'Paid / Filed', 'green', { done: true }),
        ] },
        { key: 'amount', label: 'Amount', type: 'currency', total: true, onCard: true },
        { key: 'receiptNo', label: 'Receipt / reference no.', type: 'text' },
        { key: 'paidDate', label: 'Paid on', type: 'date' },
        { key: 'dueDate', label: 'Due date', type: 'date', due: true, onCard: true },
        { key: 'notes', label: 'Notes', type: 'longtext' },
      ],
    },
  ];

  /** A new section's settings from a template, with link columns pointed at existing sections. */
  window.sectionFromTemplate = function (tpl, sections) {
    const fields = JSON.parse(JSON.stringify(tpl.fields)).map((f) => {
      if (f.type === 'link') {
        const t = sections.find((s) => s.template === f.target && !s.archived);
        f.target = t ? t.id : '';
      }
      return f;
    });
    return { name: tpl.name, template: tpl.id, fields, stageField: tpl.stageField };
  };
})();
