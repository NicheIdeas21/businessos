import type {
  AppState, Customer, Job, Document, Task, Opportunity,
  AutopilotAction, AutopilotMessage, Settings,
} from './types';

const today = new Date('2026-11-17T08:00:00');
const iso = (d: Date) => d.toISOString();
const dateOnly = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => { const d = new Date(today); d.setDate(d.getDate() + n); return d; };

let seq = 1;
const id = (prefix: string) => `${prefix}-${String(seq++).padStart(3, '0')}`;

export function createSeedData(): AppState {
  const customers: Customer[] = [
    { id: id('cust'), name: 'Sarah Mitchell', company: 'Mitchell Cafe', email: 'sarah@mitchellcafe.com.au', phone: '0412 555 014', address: '12 Queen St', suburb: 'Brisbane', state: 'QLD', postcode: '4000', notes: 'Prefers morning appointments. Regular monthly maintenance.', createdAt: iso(addDays(-120)), tags: ['VIP', 'Recurring'] },
    { id: id('cust'), name: 'James Anderson', company: 'Anderson Plumbing', email: 'james@andersonplumbing.com.au', phone: '0433 555 088', address: '8 Logan Rd', suburb: 'Woolloongabba', state: 'QLD', postcode: '4102', notes: 'Commercial client. Net 30 terms.', createdAt: iso(addDays(-95)), tags: ['Commercial'] },
    { id: id('cust'), name: 'Emily Chen', email: 'emily.chen@gmail.com', phone: '0401 555 237', address: '45 Brunswick St', suburb: 'Fortitude Valley', state: 'QLD', postcode: '4006', notes: 'Residential. Interested in ongoing support.', createdAt: iso(addDays(-80)), tags: ['Residential'] },
    { id: id('cust'), name: 'Michael O\'Brien', company: 'O\'Brien Electrical', email: 'michael@obrienelectrical.com.au', phone: '0428 555 411', address: '23 Adelaide St', suburb: 'Brisbane', state: 'QLD', postcode: '4000', notes: 'Quotes required for all work over $500.', createdAt: iso(addDays(-70)), tags: ['Commercial'] },
    { id: id('cust'), name: 'Priya Sharma', company: 'Spice Garden Restaurant', email: 'priya@spicegarden.com.au', phone: '0410 555 662', address: '168 Given Tce', suburb: 'Paddington', state: 'QLD', postcode: '4064', notes: 'High volume. Monthly invoicing preferred.', createdAt: iso(addDays(-60)), tags: ['VIP', 'Recurring'] },
    { id: id('cust'), name: 'David Thompson', email: 'david.thompson@outlook.com', phone: '0455 555 778', address: '78 Hawthorne St', suburb: 'Bulimba', state: 'QLD', postcode: '4171', notes: 'New customer from marketplace.', createdAt: iso(addDays(-25)), tags: ['New'] },
    { id: id('cust'), name: 'Lisa Walker', email: 'lisa.walker@gmail.com', phone: '0477 555 019', address: '34 Riding Rd', suburb: 'Balmoral', state: 'QLD', postcode: '4171', notes: 'Referral from Sarah Mitchell.', createdAt: iso(addDays(-18)), tags: ['Residential'] },
    { id: id('cust'), name: 'Tom Nguyen', company: 'Nguyen & Co Accountants', email: 'tom@nguyenco.com.au', phone: '0422 555 388', address: 'Level 4, 100 Creek St', suburb: 'Brisbane', state: 'QLD', postcode: '4000', notes: 'Office fit-out project.', createdAt: iso(addDays(-12)), tags: ['Commercial'] },
  ];

  const c = customers;
  const jobs: Job[] = [
    { id: id('job'), customerId: c[0].id, title: 'Monthly maintenance — coffee machines', description: 'Scheduled descale and service of two espresso machines.', status: 'scheduled', date: dateOnly(today), startTime: '08:30', durationHours: 1.5, price: 180, location: 'Mitchell Cafe, Queen St', createdAt: iso(addDays(-7)) },
    { id: id('job'), customerId: c[2].id, title: 'Install new rangehood', description: 'Supply and install 90cm undermount rangehood.', status: 'scheduled', date: dateOnly(today), startTime: '11:00', durationHours: 2, price: 640, location: 'Fortitude Valley', createdAt: iso(addDays(-6)) },
    { id: id('job'), customerId: c[1].id, title: 'Bathroom renovation — plumbing rough-in', description: 'Rough-in for new bathroom: basin, shower, toilet.', status: 'in_progress', date: dateOnly(today), startTime: '14:00', durationHours: 3, price: 1450, location: 'Woolloongabba', createdAt: iso(addDays(-10)) },
    { id: id('job'), customerId: c[4].id, title: 'Kitchen exhaust cleaning', description: 'Quarterly deep clean of commercial kitchen exhaust.', status: 'completed', date: dateOnly(addDays(-2)), startTime: '09:00', durationHours: 2.5, price: 420, createdAt: iso(addDays(-12)) },
    { id: id('job'), customerId: c[3].id, title: 'Switchboard upgrade', description: 'Upgrade to 3-phase switchboard with safety switches.', status: 'completed', date: dateOnly(addDays(-3)), startTime: '08:00', durationHours: 4, price: 1980, createdAt: iso(addDays(-14)) },
    { id: id('job'), customerId: c[5].id, title: 'Garden maintenance and cleanup', description: 'Full garden tidy, hedge trimming, green waste removal.', status: 'completed', date: dateOnly(addDays(-5)), startTime: '07:30', durationHours: 3, price: 360, createdAt: iso(addDays(-9)) },
    { id: id('job'), customerId: c[0].id, title: 'Coffee machine emergency callout', description: 'No hot water — likely element failure.', status: 'completed', date: dateOnly(addDays(-8)), startTime: '15:00', durationHours: 1, price: 240, createdAt: iso(addDays(-15)) },
    { id: id('job'), customerId: c[6].id, title: 'Hang TV and mount shelves', description: 'Mount 65" TV and 3 floating shelves to masonry wall.', status: 'completed', date: dateOnly(addDays(-12)), startTime: '10:00', durationHours: 1.5, price: 220, createdAt: iso(addDays(-16)) },
    { id: id('job'), customerId: c[4].id, title: 'Cool room service', description: 'Service commercial cool room, check refrigerant.', status: 'completed', date: dateOnly(addDays(-15)), startTime: '09:30', durationHours: 2, price: 380, createdAt: iso(addDays(-20)) },
    { id: id('job'), customerId: c[1].id, title: 'Replace hot water system', description: 'Supply and install 250L heat pump hot water system.', status: 'completed', date: dateOnly(addDays(-22)), startTime: '08:00', durationHours: 5, price: 2890, createdAt: iso(addDays(-28)) },
    { id: id('job'), customerId: c[7].id, title: 'Office cabling — 6 workstations', description: 'Data and power cabling for 6 new workstations.', status: 'scheduled', date: dateOnly(addDays(2)), startTime: '08:00', durationHours: 6, price: 2400, createdAt: iso(addDays(-5)) },
    { id: id('job'), customerId: c[2].id, title: 'Replace kitchen taps', description: 'Replace mixer taps in kitchen and laundry.', status: 'pending', date: dateOnly(addDays(5)), startTime: '10:00', durationHours: 1.5, price: 320, createdAt: iso(addDays(-2)) },
    { id: id('job'), customerId: c[3].id, title: 'Smoke alarm compliance check', description: 'Annual smoke alarm compliance for rental property.', status: 'pending', date: '', startTime: '09:00', durationHours: 1, price: 150, createdAt: iso(addDays(-1)) },
    { id: id('job'), customerId: c[5].id, title: 'Retaining wall repair', description: 'Repair and reinforce timber retaining wall.', status: 'cancelled', date: dateOnly(addDays(-3)), startTime: '13:00', durationHours: 4, price: 850, createdAt: iso(addDays(-11)) },
  ];

  const documents: Document[] = [
    {
      id: id('doc'), type: 'invoice', number: 'INV-0012', customerId: c[0].id, jobId: jobs[6].id,
      issueDate: dateOnly(addDays(-8)), dueDate: dateOnly(addDays(6)), status: 'paid',
      lineItems: [{ id: id('li'), description: 'Emergency callout — coffee machine', quantity: 1, unitPrice: 240 }],
      taxRate: 0.1, createdAt: iso(addDays(-8)),
    },
    {
      id: id('doc'), type: 'invoice', number: 'INV-0011', customerId: c[4].id, jobId: jobs[4].id,
      issueDate: dateOnly(addDays(-2)), dueDate: dateOnly(addDays(12)), status: 'sent',
      lineItems: [{ id: id('li'), description: 'Kitchen exhaust deep clean', quantity: 1, unitPrice: 420 }],
      taxRate: 0.1, createdAt: iso(addDays(-2)),
    },
    {
      id: id('doc'), type: 'invoice', number: 'INV-0010', customerId: c[3].id, jobId: jobs[5].id,
      issueDate: dateOnly(addDays(-3)), dueDate: dateOnly(addDays(11)), status: 'sent',
      lineItems: [
        { id: id('li'), description: 'Switchboard upgrade labour', quantity: 4, unitPrice: 185 },
        { id: id('li'), description: '3-phase switchboard', quantity: 1, unitPrice: 820 },
        { id: id('li'), description: 'Safety switches (3)', quantity: 3, unitPrice: 95 },
      ],
      taxRate: 0.1, createdAt: iso(addDays(-3)),
    },
    {
      id: id('doc'), type: 'invoice', number: 'INV-0009', customerId: c[5].id,
      issueDate: dateOnly(addDays(-20)), dueDate: dateOnly(addDays(-6)), status: 'overdue',
      lineItems: [
        { id: id('li'), description: 'Garden maintenance', quantity: 3, unitPrice: 120 },
      ],
      taxRate: 0.1, createdAt: iso(addDays(-20)),
    },
    {
      id: id('doc'), type: 'invoice', number: 'INV-0008', customerId: c[1].id, jobId: jobs[9].id,
      issueDate: dateOnly(addDays(-22)), dueDate: dateOnly(addDays(-8)), status: 'overdue',
      lineItems: [
        { id: id('li'), description: 'Hot water system — 250L heat pump', quantity: 1, unitPrice: 2200 },
        { id: id('li'), description: 'Installation labour', quantity: 5, unitPrice: 138 },
      ],
      taxRate: 0.1, createdAt: iso(addDays(-22)),
    },
    {
      id: id('doc'), type: 'invoice', number: 'INV-0007', customerId: c[4].id, jobId: jobs[8].id,
      issueDate: dateOnly(addDays(-15)), dueDate: dateOnly(addDays(-1)), status: 'paid',
      lineItems: [{ id: id('li'), description: 'Cool room service', quantity: 1, unitPrice: 380 }],
      taxRate: 0.1, createdAt: iso(addDays(-15)),
    },
    {
      id: id('doc'), type: 'invoice', number: 'INV-0006', customerId: c[6].id, jobId: jobs[7].id,
      issueDate: dateOnly(addDays(-12)), dueDate: dateOnly(addDays(2)), status: 'paid',
      lineItems: [{ id: id('li'), description: 'TV mount and shelves', quantity: 1, unitPrice: 220 }],
      taxRate: 0.1, createdAt: iso(addDays(-12)),
    },
    {
      id: id('doc'), type: 'invoice', number: 'INV-0005', customerId: c[1].id,
      issueDate: dateOnly(addDays(-30)), dueDate: dateOnly(addDays(-16)), status: 'paid',
      lineItems: [{ id: id('li'), description: 'General plumbing maintenance', quantity: 1, unitPrice: 540 }],
      taxRate: 0.1, createdAt: iso(addDays(-30)),
    },
    {
      id: id('doc'), type: 'quote', number: 'Q-0007', customerId: c[2].id, jobId: jobs[1].id,
      issueDate: dateOnly(addDays(-6)), dueDate: dateOnly(addDays(8)), status: 'sent',
      lineItems: [
        { id: id('li'), description: '90cm undermount rangehood', quantity: 1, unitPrice: 480 },
        { id: id('li'), description: 'Installation labour', quantity: 2, unitPrice: 80 },
      ],
      taxRate: 0.1, createdAt: iso(addDays(-6)),
    },
    {
      id: id('doc'), type: 'quote', number: 'Q-0006', customerId: c[7].id, jobId: jobs[10].id,
      issueDate: dateOnly(addDays(-5)), dueDate: dateOnly(addDays(9)), status: 'sent',
      lineItems: [
        { id: id('li'), description: 'Data cabling (Cat6) per outlet', quantity: 12, unitPrice: 95 },
        { id: id('li'), description: 'Power point installation', quantity: 6, unitPrice: 145 },
        { id: id('li'), description: 'Patch panel and testing', quantity: 1, unitPrice: 320 },
      ],
      taxRate: 0.1, createdAt: iso(addDays(-5)),
    },
    {
      id: id('doc'), type: 'quote', number: 'Q-0005', customerId: c[5].id, jobId: jobs[13].id,
      issueDate: dateOnly(addDays(-11)), dueDate: dateOnly(addDays(3)), status: 'draft',
      lineItems: [
        { id: id('li'), description: 'Retaining wall repair labour', quantity: 4, unitPrice: 120 },
        { id: id('li'), description: 'Treated pine sleepers', quantity: 8, unitPrice: 42 },
      ],
      taxRate: 0.1, createdAt: iso(addDays(-11)),
    },
  ];

  const tasks: Task[] = [
    { id: id('task'), title: 'Follow up INV-0009 overdue payment — David Thompson', kind: 'invoice_reminder', dueDate: dateOnly(addDays(-2)), customerId: c[5].id, documentId: documents[3].id, status: 'pending', createdAt: iso(addDays(-3)) },
    { id: id('task'), title: 'Follow up INV-0008 overdue payment — Anderson Plumbing', kind: 'invoice_reminder', dueDate: dateOnly(addDays(-1)), customerId: c[1].id, documentId: documents[4].id, status: 'pending', createdAt: iso(addDays(-2)) },
    { id: id('task'), title: 'Prepare quote for cool room upgrade — Spice Garden', kind: 'follow_up', dueDate: dateOnly(today), customerId: c[4].id, status: 'pending', createdAt: iso(addDays(-2)) },
    { id: id('task'), title: 'Confirm materials for office cabling job', kind: 'task', dueDate: dateOnly(today), jobId: jobs[10].id, status: 'pending', createdAt: iso(addDays(-1)) },
    { id: id('task'), title: 'Call Lisa Walker re: referral thank you', kind: 'follow_up', dueDate: dateOnly(today), customerId: c[6].id, status: 'pending', createdAt: iso(addDays(-1)) },
    { id: id('task'), title: 'Order rangehood stock for Emily Chen job', kind: 'task', dueDate: dateOnly(addDays(1)), jobId: jobs[1].id, status: 'pending', createdAt: iso(addDays(-1)) },
    { id: id('task'), title: 'Send weekly invoice reminders', kind: 'reminder', dueDate: dateOnly(addDays(1)), status: 'pending', createdAt: iso(addDays(-1)) },
    { id: id('task'), title: 'Review Q-0006 before sending to Nguyen & Co', kind: 'task', dueDate: dateOnly(addDays(2)), documentId: documents[9].id, status: 'pending', createdAt: iso(addDays(-1)) },
    { id: id('task'), title: 'Schedule annual service — Mitchell Cafe', kind: 'follow_up', dueDate: dateOnly(addDays(3)), customerId: c[0].id, status: 'pending', createdAt: iso(addDays(-1)) },
    { id: id('task'), title: 'Follow up quote Q-0007 — Emily Chen', kind: 'follow_up', dueDate: dateOnly(addDays(2)), documentId: documents[8].id, customerId: c[2].id, status: 'completed', createdAt: iso(addDays(-4)) },
  ];

  const opportunities: Opportunity[] = [
    { id: id('opp'), category: 'Plumbing', title: 'Leaking kitchen tap — urgent', description: 'Kitchen tap leaking under sink, water pooling. Need someone today if possible.', suburb: 'New Farm', region: 'Brisbane North', preferredDate: dateOnly(today), postedAt: iso(addDays(0)) - (1000 * 60 * 35), budgetMin: 150, budgetMax: 300, status: 'new', contactName: 'Rebecca L.' },
    { id: id('opp'), category: 'Electrical', title: 'Install 4 downlights in living area', description: 'Looking to replace old oyster lights with 4 LED downlights. Ceiling access available.', suburb: 'Coorparoo', region: 'Brisbane East', preferredDate: dateOnly(addDays(3)), postedAt: iso(addDays(0)) - (1000 * 60 * 60 * 2), budgetMin: 250, budgetMax: 450, status: 'new', contactName: 'Marcus T.' },
    { id: id('opp'), category: 'Cleaning', title: 'End of lease clean — 3 bed house', description: 'Full end of lease clean including carpets, windows, oven. Bond clean.', suburb: 'Annerley', region: 'Brisbane South', preferredDate: dateOnly(addDays(5)), postedAt: iso(addDays(0)) - (1000 * 60 * 60 * 5), budgetMin: 350, budgetMax: 550, status: 'new', contactName: 'Jasmine K.' },
    { id: id('opp'), category: 'Handyman', title: 'Assemble flat-pack furniture', description: '3x IKEA items: PAX wardrobe, 2x chest of drawers. Have instructions and tools.', suburb: 'Toowong', region: 'Brisbane West', preferredDate: dateOnly(addDays(2)), postedAt: iso(addDays(0)) - (1000 * 60 * 60 * 8), budgetMin: 180, budgetMax: 280, status: 'new', contactName: 'Henry W.' },
    { id: id('opp'), category: 'Plumbing', title: 'Bathroom renovation — full fit-out', description: 'Gut and refit main bathroom. New tiles, vanity, shower, screen. Plans available.', suburb: 'Ashgrove', region: 'Brisbane North', preferredDate: dateOnly(addDays(14)), postedAt: iso(addDays(0)) - (1000 * 60 * 60 * 14), budgetMin: 8000, budgetMax: 15000, status: 'new', contactName: 'Sophie R.' },
    { id: id('opp'), category: 'Electrical', title: 'Smoke alarm compliance — 4 properties', description: 'Property manager needs compliance certificates for 4 rental properties across Brisbane.', suburb: 'Multiple', region: 'Brisbane Wide', preferredDate: dateOnly(addDays(7)), postedAt: iso(addDays(0)) - (1000 * 60 * 60 * 22), budgetMin: 400, budgetMax: 800, status: 'new', contactName: 'Agency' },
    { id: id('opp'), category: 'Cleaning', title: 'Regular office clean — twice weekly', description: 'Small office, 6 staff. Need ongoing Mon/Thu evening clean. Ongoing contract.', suburb: 'Fortitude Valley', region: 'Brisbane CBD', preferredDate: dateOnly(addDays(4)), postedAt: iso(addDays(0)) - (1000 * 60 * 60 * 30), budgetMin: 90, budgetMax: 140, status: 'new', contactName: 'Office Mgr' },
    { id: id('opp'), category: 'Handyman', title: 'Mount 3 TVs and patch walls', description: 'Mount 3 TVs (65, 55, 43) and patch previous wall holes before move-out.', suburb: 'Kangaroo Point', region: 'Brisbane East', preferredDate: dateOnly(addDays(6)), postedAt: iso(addDays(0)) - (1000 * 60 * 60 * 40), budgetMin: 200, budgetMax: 350, status: 'new', contactName: 'Daniel P.' },
  ];

  const autopilotActions: AutopilotAction[] = [
    { id: id('ap'), title: 'Send reminder for overdue invoice INV-0009', description: 'David Thompson\'s invoice is 2 days overdue ($396 inc. GST). Suggested: polite reminder email + SMS.', category: 'follow_up', level: 'execute_with_approval', status: 'pending', createdAt: iso(addDays(-1)), customerId: c[5].id, documentId: documents[3].id },
    { id: id('ap'), title: 'Prepare quote for cool room upgrade', description: 'Spice Garden has shown interest in cool room upgrade. Suggested quote: $2,400–$2,900 based on similar past work.', category: 'quote', level: 'prepare', status: 'pending', createdAt: iso(addDays(-1)), customerId: c[4].id },
    { id: id('ap'), title: 'Respond to opportunity: Bathroom renovation — Ashgrove', description: 'High-value opportunity ($8–15k) in your service area. Suggested: express interest + request site visit.', category: 'respond', level: 'execute_with_approval', status: 'pending', createdAt: iso(addDays(0)), opportunityId: opportunities[4].id },
    { id: id('ap'), title: 'Review tomorrow\'s schedule', description: 'You have 1 job scheduled tomorrow at 08:00 (Nguyen & Co office cabling). Confirm materials are on hand.', category: 'review', level: 'observe', status: 'pending', createdAt: iso(addDays(0)), jobId: jobs[10].id },
    { id: id('ap'), title: 'Follow up quote Q-0007 — Emily Chen', description: 'Quote sent 6 days ago, no response. Suggested: short follow-up call offering to adjust timing.', category: 'follow_up', level: 'prepare', status: 'pending', createdAt: iso(addDays(0)), customerId: c[2].id, documentId: documents[8].id },
    { id: id('ap'), title: 'Send thank-you to new customer Lisa Walker', description: 'Lisa was referred by Sarah Mitchell (VIP). A thank-you message could strengthen the relationship.', category: 'insight', level: 'prepare', status: 'pending', createdAt: iso(addDays(0)), customerId: c[6].id },
  ];

  const autopilotMessages: AutopilotMessage[] = [
    { id: id('msg'), role: 'assistant', content: 'Good morning Alex. Here\'s your business overview for today, Tuesday 17 November.\n\n• Revenue this month: $8,478 (up 12% on last month)\n• 2 invoices are overdue totalling $5,806\n• 3 jobs scheduled today, 1 in progress\n• 8 new opportunities in your marketplace, 2 are high-value\n\nI\'ve prepared 6 suggested actions for your review. Would you like me to walk through the most urgent ones?', createdAt: iso(addDays(0)) },
  ];

  const settings: Settings = {
    businessName: 'Brightside Trade Services',
    ownerName: 'Alex Brightside',
    businessType: 'Trade & Maintenance',
    currency: 'AUD',
    currencySymbol: '$',
    timeZone: 'Australia/Brisbane',
    email: 'alex@brightside.com.au',
    phone: '0412 000 123',
    notifications: {
      newOpportunities: true,
      overdueInvoices: true,
      upcomingJobs: true,
      autopilotActions: true,
      weeklyDigest: false,
    },
    autopilot: {
      enabled: true,
      level: 'execute_with_approval',
    },
  };

  return { customers, jobs, documents, tasks, opportunities, autopilotActions, autopilotMessages, settings };
}
