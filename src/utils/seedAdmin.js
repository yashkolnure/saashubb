require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Listing = require('../models/Listing');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/saas-marketplace');

  // ── Admin ──────────────────────────────────────────────────────────────────
  const adminExists = await User.findOne({ email: 'admin@saashub.com' });
  if (!adminExists) {
    await User.create({
      email: 'admin@saashub.com',
      password: 'Admin@123456',
      name: 'SaaSHub Admin',
      role: 'admin',
      isVerified: true,
    });
    console.log('✅ Admin created: admin@saashub.com / Admin@123456');
  } else {
    console.log('ℹ️  Admin already exists');
  }

  // ── Root Seller — Yash Kolnure / Avenirya Solutions ───────────────────────
  let seller = await User.findOne({ email: 'yashkolnure58@gmail.com' });
  if (!seller) {
    seller = await User.create({
      email: 'yashkolnure58@gmail.com',
      password: 'Yash$5828',
      name: 'Yash Kolnure',
      role: 'seller',
      isVerified: true,
      company: {
        legalName: 'Avenirya Solutions OPC Pvt Ltd',
        website: 'https://avenirya.com',
        officialEmail: 'yashkolnure58@gmail.com',
        verificationStatus: 'approved',
        isVerified: true,
      },
      trustScore: 85,
      freeListingsQuota: 10,
    });
    console.log('✅ Seller created: yashkolnure58@gmail.com / Yash$5828');
  } else {
    // Ensure quota is enough for all seeded products
    await User.updateOne({ _id: seller._id }, { $max: { freeListingsQuota: 10 } });
    console.log('ℹ️  Seller already exists');
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // LISTINGS
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Listing 1 — Petoba (Restaurant OS) ─────────────────────────────────────
  const petobaExists = await Listing.findOne({ slug: 'petoba-restaurant-os' });
  if (!petobaExists) {
    await Listing.create({
      seller: seller._id,
      status: 'active',
      isPaid: false,
      listingType: 'saas',
      isRebrandable: false,
      hasResellRights: false,
      isFullSourceCode: false,

      productName: 'Petoba',
      slug: 'petoba-restaurant-os',
      tagline: 'The All-in-One Restaurant OS — QR Menu, POS, WhatsApp Orders & AI Waiter in one platform.',
      category: 'Restaurant Management',
      shortDescription: 'Petoba replaces 5 separate tools with one smart platform: QR digital menu, billing POS, WhatsApp ordering, AI upsell waiter, KOT printing, and live sales analytics. Trusted by 1,000+ restaurants.',

      fullDescription: `<h2>Run Your Entire Restaurant From One Dashboard</h2>
<p>Petoba is the all-in-one Restaurant OS trusted by <strong>1,000+ restaurants</strong>. Stop juggling multiple apps — manage your QR menu, billing, orders, kitchen, and analytics from a single platform that works even offline.</p>

<h3>Core Modules</h3>
<ul>
  <li><strong>QR Menu (No App Needed):</strong> Customers scan a QR code to browse your full menu with photos — no download required.</li>
  <li><strong>Direct WhatsApp Orders:</strong> Orders arrive on your WhatsApp with table number and item details instantly.</li>
  <li><strong>Billing POS (Works Offline):</strong> Fast desktop and tablet POS — never lose a sale even without internet.</li>
  <li><strong>AI Waiter:</strong> Embedded AI inside your QR menu that auto-upsells combos and answers customer questions 24/7.</li>
  <li><strong>KOT Printing:</strong> Auto-print kitchen order tickets to thermal printers for seamless kitchen coordination.</li>
  <li><strong>Live Sales Reports:</strong> Track daily revenue, tax, expenses, and best-selling items in real time.</li>
</ul>

<h3>Two Plans to Match Your Needs</h3>
<p><strong>Option 1 — Smart QR Menu:</strong> Digital menu with WhatsApp ordering, AI menu builder (photo-to-menu in 5 minutes), Google Review Booster, and social media integration.</p>
<p><strong>Option 2 — QR Menu + Full Billing POS:</strong> Everything in Option 1 plus a full POS system with table management, inventory tracking, KOT printing, and detailed tax reports.</p>

<h3>AI-Powered Menu Setup in 5 Minutes</h3>
<p>Upload a photo or PDF of your existing menu. Our AI extracts all items, organises categories, and adds food photos automatically. No typing, no technical skills needed.</p>

<h3>Proven Results</h3>
<ul>
  <li>30% increase in table turnover reported by restaurant owners</li>
  <li>Doubled Google ratings via the built-in review prompt</li>
  <li>0% commission on every order — you keep everything</li>
  <li>5-minute setup from sign-up to first QR code</li>
</ul>`,

      pricingModel: 'custom',
      askPriceOnly: true,
      startingPrice: null,
      currency: 'INR',
      hasFreerial: true,
      freeTrialDays: 30,
      minContractLength: 'annual',

      deployment: ['cloud'],
      platforms: ['web'],
      hasApi: false,
      isOpenSource: false,
      companyStage: 'growth',

      targetIndustries: ['Food & Beverage', 'Hospitality', 'Restaurant'],
      targetCompanySize: ['smb'],

      keyFeatures: [
        'QR Digital Menu — No App Required',
        'Direct WhatsApp Ordering with Table Number',
        'Billing POS — Works Offline',
        'AI Waiter for Auto-Upselling',
        'KOT Thermal Printer Support',
        'Live Sales & Tax Reports',
        'Table Management Dashboard',
        'Inventory Management',
        'AI Menu Builder (Photo or PDF to Menu)',
        'Google Review Booster',
        'One-Click WhatsApp Bill Sharing',
        'Social Media Integration',
      ],

      integrations: ['WhatsApp', 'Thermal Printers'],
      languagesSupported: ['English', 'Hindi'],

      useCases: [
        {
          title: 'QR Menu with WhatsApp Ordering',
          description: 'Replace physical menus with a smart QR catalog. Customers scan, browse, and send orders directly to your WhatsApp — perfect for cafes and small restaurants.',
        },
        {
          title: 'Full Restaurant POS & Operations',
          description: 'Manage tables, billing, kitchen orders, and inventory from one dashboard. Ideal for mid-size restaurants wanting complete operational control.',
        },
        {
          title: 'AI-Powered Upselling',
          description: 'The embedded AI waiter recommends add-ons and combos to customers while they browse the menu, increasing average order value automatically.',
        },
      ],

      testimonials: [
        {
          name: 'Rahul S.',
          designation: 'Owner',
          company: 'Cafe',
          quote: 'Since using Petoba, our table turnover increased by 30%. Customers love the WhatsApp integration!',
          approved: true,
        },
        {
          name: 'Priya M.',
          designation: 'Manager',
          company: 'Restaurant',
          quote: "The KOT printing is instant. No more shouting orders to the kitchen. It's so peaceful now.",
          approved: true,
        },
        {
          name: 'Amit K.',
          designation: 'Owner',
          company: 'Food Court',
          quote: 'Best decision for my fast food joint. The Google Review prompt has doubled our ratings.',
          approved: true,
        },
      ],

      faq: [
        {
          question: 'Do customers need to download an app?',
          answer: 'No. Customers simply scan the QR code with their phone camera and the menu opens instantly in the browser — no app download required.',
        },
        {
          question: 'How does the AI Menu Builder work?',
          answer: 'Upload a photo or PDF of your existing menu. Our AI scans the content, organises categories, extracts item names and prices, and even adds food photos automatically.',
        },
        {
          question: 'Can I use the Billing system offline?',
          answer: 'Yes. The POS system works fully offline. Your data syncs automatically when your internet connection is restored.',
        },
        {
          question: 'Does it support Thermal Printers?',
          answer: 'Yes. Petoba supports all major thermal printers for instant KOT (Kitchen Order Ticket) printing.',
        },
        {
          question: 'Is there a free trial?',
          answer: 'Yes! You get 1 month free trial of the Billing Software when you sign up for the QR Menu plan.',
        },
      ],

      supportChannels: ['chat', 'email'],
      supportHours: 'Mon–Sat, 9 AM – 7 PM IST',
      supportTimezone: 'Asia/Kolkata',
      onboardingType: 'self_serve',
      offersTraining: false,
      hasDedicatedManager: false,
      viewCount: 0, inquiryCount: 0, rating: 0, reviewCount: 0,
    });
    console.log('✅ Listing created: Petoba — Restaurant OS');
  } else {
    console.log('ℹ️  Listing already exists: Petoba');
  }

  // ── Listing 2 — WPLeads (WhatsApp Automation) ───────────────────────────────
  const wpleadsExists = await Listing.findOne({ slug: 'wpleads-whatsapp-automation' });
  if (!wpleadsExists) {
    await Listing.create({
      seller: seller._id,
      status: 'active',
      isPaid: false,
      listingType: 'saas',
      isRebrandable: false,
      hasResellRights: false,
      isFullSourceCode: false,

      productName: 'WPLeads',
      slug: 'wpleads-whatsapp-automation',
      tagline: 'Get WhatsApp API Free in 5 Minutes — Build powerful automated chatbot flows with a visual drag-and-drop builder.',
      category: 'Marketing Automation',
      shortDescription: 'WPLeads is an Official Meta Partner platform for WhatsApp automation. Build keyword-triggered workflows, interactive chatbots, and CRM pipelines with no code — live in under 5 minutes. 98M+ messages sent.',

      fullDescription: `<h2>The Smartest WhatsApp Automation Platform</h2>
<p>WPLeads is an <strong>Official Meta Partner</strong> that gives you instant access to the WhatsApp Business API — free, with no complex approvals. Build automated conversation flows using a visual drag-and-drop builder and start sending messages in under 5 minutes.</p>

<h3>Why WPLeads?</h3>
<ul>
  <li><strong>Instant Activation:</strong> No setup fee, no lengthy approval process. Paste your Meta credentials and you're live.</li>
  <li><strong>Visual Flow Builder:</strong> Build complex conversation trees without a single line of code using a drag-and-drop canvas.</li>
  <li><strong>Keyword Triggers:</strong> Fire workflows instantly when users message a specific phrase — supports exact match or contains.</li>
  <li><strong>Interactive Messages:</strong> Send rich menus, image cards, buttons, and list messages — full native WhatsApp interactive features.</li>
  <li><strong>Conversational Branches:</strong> Route users down different paths automatically based on the buttons they tap. True dynamic logic.</li>
  <li><strong>Built-in CRM:</strong> Every contact is automatically saved, tagged, and searchable.</li>
  <li><strong>Enterprise Security:</strong> AES-256 encryption, SOC 2 ready infrastructure, strict data privacy.</li>
</ul>

<h3>Pricing Plans</h3>
<ul>
  <li><strong>Free (Forever):</strong> 1 active workflow, 500 message triggers/month, 1 WhatsApp number.</li>
  <li><strong>Premium — ₹1,499/mo:</strong> Unlimited workflows, 15,000 triggers/month, 5 WhatsApp numbers, analytics dashboard, priority support.</li>
  <li><strong>Enterprise — Custom:</strong> Unlimited everything, dedicated instance, custom API & webhooks, SLA, personal account manager.</li>
</ul>

<h3>Proven Scale</h3>
<p>98M+ messages sent across thousands of businesses. Average latency of 24ms from our Mumbai edge cluster.</p>`,

      pricingModel: 'flat',
      askPriceOnly: false,
      startingPrice: 1499,
      currency: 'INR',
      hasFreerial: true,
      freeTrialDays: 0,
      minContractLength: 'monthly',

      deployment: ['cloud'],
      platforms: ['web'],
      hasApi: true,
      isOpenSource: false,
      companyStage: 'growth',
      uptimeSla: '99.9%',
      dataResidency: 'India (Mumbai)',
      securityCerts: ['AES-256', 'SOC 2'],

      targetIndustries: ['E-Commerce', 'Marketing', 'Customer Support', 'Retail'],
      targetCompanySize: ['smb', 'mid_market'],

      keyFeatures: [
        'Official Meta Partner — Instant WhatsApp API Access',
        'No Setup Fee — Free Forever Plan Available',
        'Visual Drag-and-Drop Flow Builder',
        'Keyword Triggers (Exact Match & Contains)',
        'Interactive Messages — Buttons, Lists, Media',
        'Conversational Branching Logic',
        'Built-in CRM — Auto Contact Tagging',
        'AES-256 Encryption & SOC 2 Ready',
        'Analytics Dashboard',
        'Multi-Number Support (up to 5 on Premium)',
        'Custom API & Webhooks (Enterprise)',
        '98M+ Messages Sent',
      ],

      integrations: ['WhatsApp Business API', 'Meta'],
      languagesSupported: ['English'],

      useCases: [
        {
          title: 'Customer Support Automation',
          description: 'Build keyword-triggered FAQ flows that answer customer questions instantly — zero human intervention needed for common queries.',
        },
        {
          title: 'Lead Generation & Nurturing',
          description: 'Capture leads via WhatsApp, auto-tag them in the CRM, and send personalised follow-up sequences automatically.',
        },
        {
          title: 'Product Catalog & Order Flow',
          description: 'Let customers browse your product catalog, place orders, and complete purchases — all inside a WhatsApp conversation.',
        },
      ],

      testimonials: [
        {
          name: 'Priya Mehta',
          designation: 'Founder',
          company: 'QuickKart',
          quote: 'We went from manually replying to 200+ messages a day to zero. WPLeads paid for itself in the first week.',
          approved: true,
        },
        {
          name: 'James Okafor',
          designation: 'Head of CX',
          company: 'Finova',
          quote: 'Set up our entire customer support FAQ in 20 minutes. Response time went from hours to under 3 seconds.',
          approved: true,
        },
        {
          name: 'Sana Rashid',
          designation: 'Marketing Lead',
          company: 'Bolt',
          quote: 'The branching logic is what sold me. Other tools only do linear flows — this one mirrors real conversations.',
          approved: true,
        },
      ],

      faq: [
        {
          question: 'Do I need a Meta Business account to use WPLeads?',
          answer: 'Yes. You need a Meta Business account and a WhatsApp Business number. Setup is guided — most users are live in under 5 minutes.',
        },
        {
          question: 'Is the Free plan really free forever?',
          answer: 'Yes. The Free plan includes 1 active workflow and 500 message triggers per month — no credit card required, no time limit.',
        },
        {
          question: 'What are message triggers?',
          answer: 'A message trigger is counted each time your workflow sends a message to a user. For example, a 3-message flow sends 3 triggers per conversation.',
        },
        {
          question: 'Can I use WPLeads for multiple businesses?',
          answer: 'Yes. The Premium plan supports up to 5 WhatsApp numbers. For more, the Enterprise plan offers unlimited numbers with a dedicated instance.',
        },
      ],

      supportChannels: ['chat', 'email'],
      supportHours: 'Mon–Fri, 9 AM – 6 PM IST',
      supportTimezone: 'Asia/Kolkata',
      onboardingType: 'self_serve',
      offersTraining: false,
      hasDedicatedManager: false,
      viewCount: 0, inquiryCount: 0, rating: 0, reviewCount: 0,
    });
    console.log('✅ Listing created: WPLeads — WhatsApp Automation');
  } else {
    console.log('ℹ️  Listing already exists: WPLeads');
  }

  // ── Listing 3 — BookEase (Booking & Scheduling) ─────────────────────────────
  const bookEaseExists = await Listing.findOne({ slug: 'bookease-booking-platform' });
  if (!bookEaseExists) {
    await Listing.create({
      seller: seller._id,
      status: 'active',
      isPaid: false,
      listingType: 'saas',
      isRebrandable: false,
      hasResellRights: false,
      isFullSourceCode: false,

      productName: 'BookEase',
      slug: 'bookease-booking-platform',
      tagline: 'Get Fully Booked Without the Chaos — Automate scheduling, payments, and reminders for service professionals.',
      category: 'Booking & Scheduling',
      shortDescription: 'BookEase is the booking platform for coaches, salons, and service professionals. Reduce no-shows by 80%, collect payments upfront via Stripe/PayPal, and go live in 4 minutes. Used by 2,000+ professionals.',

      fullDescription: `<h2>The Booking Platform Built for Service Professionals</h2>
<p>BookEase is the all-in-one scheduling solution for coaches, salons, consultants, and every service professional who is tired of chasing clients on WhatsApp. Automate bookings, payments, and reminders — and get back to doing what you love.</p>

<h3>The Problem It Solves</h3>
<ul>
  <li>Chasing clients on WhatsApp for confirmations — eliminated</li>
  <li>No-shows costing you revenue every week — reduced by 80%</li>
  <li>Double bookings and scheduling conflicts — prevented by smart calendar sync</li>
  <li>Hours wasted on manual payment follow-ups — replaced by upfront payments</li>
</ul>

<h3>Key Capabilities</h3>
<ul>
  <li><strong>Custom Booking Page:</strong> Your branded page with services, prices, and availability. Live in under 60 seconds.</li>
  <li><strong>Get Paid Upfront:</strong> Collect payments before every session via Stripe or PayPal. 0% commission, always.</li>
  <li><strong>Auto Reminders:</strong> Automated SMS & email reminders cut no-shows by up to 80%.</li>
  <li><strong>Zero Double Bookings:</strong> Smart calendar sync with Google Calendar, Outlook, and iCal.</li>
  <li><strong>Analytics Dashboard:</strong> Revenue trends, peak hours, repeat client data — know where growth comes from.</li>
  <li><strong>No App for Clients:</strong> Clients book from any browser — no download, no friction.</li>
</ul>

<h3>Pricing Plans</h3>
<ul>
  <li><strong>Starter — Free (7-day trial):</strong> 50 bookings/month, Stripe & PayPal integration, basic analytics.</li>
  <li><strong>Professional — ₹899/mo:</strong> Unlimited bookings, SMS + email reminders, custom branding, advanced analytics, 0% transaction fees.</li>
  <li><strong>Business — ₹4,999/yr:</strong> Multi-staff accounts, white-label domain, API access, dedicated account manager, SLA.</li>
</ul>

<h3>Who Uses BookEase?</h3>
<p>Beauty & wellness studios, fitness trainers, photographers, business consultants, tutors, yoga instructors, and healthcare professionals across India.</p>`,

      pricingModel: 'flat',
      askPriceOnly: false,
      startingPrice: 899,
      currency: 'INR',
      hasFreerial: true,
      freeTrialDays: 7,
      minContractLength: 'monthly',

      deployment: ['cloud'],
      platforms: ['web'],
      hasApi: true,
      isOpenSource: false,
      companyStage: 'growth',
      securityCerts: ['SSL', 'PCI-DSS', 'GDPR'],

      targetIndustries: ['Beauty & Wellness', 'Fitness', 'Healthcare', 'Education', 'Photography', 'Consulting'],
      targetCompanySize: ['smb'],

      keyFeatures: [
        'Custom Branded Booking Page — Live in 60 Seconds',
        'Upfront Payment Collection via Stripe & PayPal',
        '0% Commission on All Transactions',
        'SMS + Email Automated Reminders',
        'Google Calendar, Outlook & iCal Sync',
        'Advanced Analytics & Revenue Dashboard',
        'Custom Branding & Logo',
        'Multi-staff Accounts (Business Plan)',
        'White-label Domain (Business Plan)',
        'API Access (Business Plan)',
        'No App Download Required for Clients',
        '80% Reduction in No-shows',
      ],

      integrations: ['Stripe', 'PayPal', 'Google Calendar', 'Outlook', 'iCal'],
      languagesSupported: ['English'],

      useCases: [
        {
          title: 'Salon & Spa Booking Automation',
          description: 'Replace WhatsApp back-and-forth with a self-serve booking page. Clients pick time slots, pay upfront, and receive automatic reminders.',
        },
        {
          title: 'Fitness Coach Scheduling',
          description: 'Manage 1:1 sessions, group classes, and packages from one dashboard. Sync with your calendar to prevent double bookings.',
        },
        {
          title: 'Consultant Appointment Management',
          description: 'Share your booking link on LinkedIn or WhatsApp. Collect payment before every discovery call — no chasing, no no-shows.',
        },
      ],

      testimonials: [
        {
          name: 'Priya Sharma',
          designation: 'Fitness Coach',
          company: 'Mumbai',
          quote: 'I went from chasing clients on WhatsApp to fully automated bookings in 2 days. My revenue jumped 40% in the first month.',
          approved: true,
        },
        {
          name: 'Rohan Mehta',
          designation: 'Hair Salon Owner',
          company: 'Pune',
          quote: 'No-shows dropped to almost zero after SMS reminders. BookEase paid for itself in the very first week.',
          approved: true,
        },
        {
          name: 'Ananya Iyer',
          designation: 'Business Consultant',
          company: 'Bengaluru',
          quote: 'My clients love the clean booking experience. The Stripe integration is seamless and I get paid before every session.',
          approved: true,
        },
        {
          name: 'Karan Desai',
          designation: 'Yoga Instructor',
          company: 'Delhi',
          quote: "I'm not tech-savvy at all and had my store live in under 10 minutes. The calendar sync alone saves me 2 hours a week.",
          approved: true,
        },
      ],

      faq: [
        {
          question: 'Do I need any technical skills to get started?',
          answer: 'No. BookEase is designed so anyone can go live in under 4 minutes. No code, no tutorials, no setup calls needed.',
        },
        {
          question: 'What payment methods are supported?',
          answer: 'BookEase integrates with Stripe and PayPal for seamless upfront payment collection. No transaction commission on any paid plan.',
        },
        {
          question: 'Will my clients need to download an app?',
          answer: 'No. Clients book directly from their browser by visiting your unique booking link — no app download needed.',
        },
        {
          question: 'What happens if I want to cancel?',
          answer: 'You can cancel anytime. There are no long-term contracts on the Professional plan. Your data remains accessible for 30 days post-cancellation.',
        },
        {
          question: 'Is my payment data secure?',
          answer: 'Yes. BookEase is SSL secured, Stripe verified, PCI-DSS compliant, and GDPR ready. All payment data is handled by Stripe directly.',
        },
      ],

      supportChannels: ['chat', 'email'],
      supportHours: 'Mon–Sat, 9 AM – 7 PM IST',
      supportTimezone: 'Asia/Kolkata',
      onboardingType: 'self_serve',
      offersTraining: false,
      hasDedicatedManager: false,
      viewCount: 0, inquiryCount: 0, rating: 0, reviewCount: 0,
    });
    console.log('✅ Listing created: BookEase — Booking Platform');
  } else {
    console.log('ℹ️  Listing already exists: BookEase');
  }

  // ── Listing 4 — MyBusiness (ERP for Indian SMEs) ────────────────────────────
  const myBusinessExists = await Listing.findOne({ slug: 'mybusiness-erp-india' });
  if (!myBusinessExists) {
    await Listing.create({
      seller: seller._id,
      status: 'active',
      isPaid: false,
      listingType: 'saas',
      isRebrandable: false,
      hasResellRights: false,
      isFullSourceCode: false,

      productName: 'MyBusiness',
      slug: 'mybusiness-erp-india',
      tagline: 'The Business Platform Built for Bharat — Workforce, CRM, GST Invoicing, Inventory, and Finance in one modular platform.',
      category: 'ERP',
      shortDescription: 'MyBusiness is a modular, GST-compliant business management platform for Indian SMEs. Manage HR, CRM, invoicing, inventory, vendors, and finance from one dashboard. 5,000+ businesses, ₹120Cr+ invoiced monthly.',

      fullDescription: `<h2>One Platform to Run Your Entire Business</h2>
<p>MyBusiness is the all-in-one modular ERP built specifically for Indian businesses. Choose only the modules you need today, and enable more as your business grows — pay only for what you use.</p>

<h3>8 Powerful Modules</h3>
<ul>
  <li><strong>👥 Workforce / HR:</strong> Employee profiles, biometric attendance tracking, leave requests and approvals — HR that works as hard as you.</li>
  <li><strong>🤝 CRM / Clients:</strong> Client database, interaction history timeline, and deal tracking pipeline — every relationship, perfected.</li>
  <li><strong>📋 Quotations:</strong> Professional quote builder with products catalogue, GST engine, and discount management — win more deals, faster.</li>
  <li><strong>🧾 GST Invoicing:</strong> GST-compliant invoices in under 30 seconds. CGST, SGST, IGST support. Partial payment tracking and recurring invoice automation.</li>
  <li><strong>📦 Inventory:</strong> Real-time stock tracking, low-stock alerts, and automatic purchase reconciliation — never run out, never overstock.</li>
  <li><strong>🏪 Vendors & Purchase:</strong> Vendor database with KYC, purchase order management, and vendor payment tracking.</li>
  <li><strong>💰 Finance:</strong> Income & expense tracking, cash flow forecasting, and profit & loss reports — your money, completely clear.</li>
  <li><strong>📊 Reports & Analytics:</strong> 50+ built-in report types across sales, expenses, and employee productivity. Export to PDF or Excel instantly.</li>
</ul>

<h3>Built for India</h3>
<ul>
  <li>Full GST compliance — CGST, SGST, IGST — invoice in 30 seconds</li>
  <li>99.9% uptime SLA</li>
  <li>Works on mobile — manage your business from anywhere</li>
  <li>Import existing clients, products, and employees via onboarding wizard</li>
</ul>

<h3>Trusted at Scale</h3>
<p>5,000+ businesses · ₹120Cr+ invoiced monthly · 4.9★ user rating · 99.9% uptime SLA</p>`,

      pricingModel: 'custom',
      askPriceOnly: true,
      startingPrice: null,
      currency: 'INR',
      hasFreerial: true,
      freeTrialDays: 14,
      minContractLength: 'monthly',

      deployment: ['cloud'],
      platforms: ['web'],
      hasApi: false,
      isOpenSource: false,
      companyStage: 'growth',
      uptimeSla: '99.9%',
      dataResidency: 'India',

      targetIndustries: ['Manufacturing', 'Construction', 'E-Commerce', 'Export', 'Services', 'Retail'],
      targetCompanySize: ['smb', 'mid_market'],

      keyFeatures: [
        'GST-Compliant Invoicing in 30 Seconds (CGST, SGST, IGST)',
        'Workforce & HR — Attendance, Leave, Employee Profiles',
        'CRM — Client Database, Deal Pipeline, Interaction History',
        'Quotation Builder with GST & Discount Engine',
        'Real-Time Inventory Tracking with Low-Stock Alerts',
        'Vendor & Purchase Order Management',
        'Cash Flow Forecasting & P&L Reports',
        '50+ Built-in Report Types — Export to PDF or Excel',
        'Modular — Enable Only What You Need',
        'Recurring Invoice Automation',
        'Biometric Attendance Tracking',
        'Works on Mobile — No App Download Required',
      ],

      languagesSupported: ['English', 'Hindi'],
      integrations: ['GST Portal'],
      securityCerts: ['AES-256'],

      useCases: [
        {
          title: 'GST Invoicing for Indian SMEs',
          description: 'Generate fully GST-compliant invoices with CGST, SGST, and IGST in under 30 seconds. Track partial payments and automate recurring billing.',
        },
        {
          title: 'HR & Workforce Management',
          description: 'Manage employee profiles, track biometric attendance, handle leave approvals, and run productivity reports — all from one dashboard.',
        },
        {
          title: 'Finance Visibility for Business Owners',
          description: 'See your cash flow, P&L, and pending invoices in real time. Share reports instantly with your CA or investors.',
        },
      ],

      testimonials: [
        {
          name: 'Rahul Sharma',
          designation: 'CEO',
          company: 'TechVentive Pvt Ltd',
          quote: 'MyBusiness completely transformed how we manage our team and clients. The invoicing module alone saved us 10 hours a week.',
          approved: true,
        },
        {
          name: 'Priya Patel',
          designation: 'CFO',
          company: 'GreenLeaf Exports',
          quote: 'The finance and reporting modules give me clarity I never had before. I can see cash flow, P&L, and pending invoices in one dashboard.',
          approved: true,
        },
        {
          name: 'Amir Khan',
          designation: 'Founder',
          company: 'BuildRight Construction',
          quote: 'Vendor and inventory management in one place is exactly what we needed. Our purchase order process went from 2 days to 20 minutes.',
          approved: true,
        },
      ],

      faq: [
        {
          question: 'Is MyBusiness GST compliant?',
          answer: 'Yes. MyBusiness fully supports CGST, SGST, and IGST. Invoices are generated in the correct format and are ready for GST filing.',
        },
        {
          question: 'Do I need to enable all 8 modules?',
          answer: 'No. MyBusiness is fully modular. Start with the modules you need today — invoicing, CRM, or HR — and add more as your business grows.',
        },
        {
          question: 'How long does setup take?',
          answer: 'Most businesses are fully set up in under 10 minutes. The onboarding wizard guides you through importing existing clients, products, and employees.',
        },
        {
          question: 'Does it work on mobile?',
          answer: 'Yes. MyBusiness is fully responsive and works on any browser on mobile, tablet, or desktop — no separate app download needed.',
        },
        {
          question: 'Can I export reports to share with my CA?',
          answer: 'Yes. Any of the 50+ built-in reports can be exported to PDF or Excel in one click and shared instantly.',
        },
      ],

      supportChannels: ['email', 'phone'],
      supportHours: 'Mon–Sat, 9 AM – 7 PM IST',
      supportTimezone: 'Asia/Kolkata',
      onboardingType: 'assisted',
      offersTraining: true,
      hasDedicatedManager: false,
      viewCount: 0, inquiryCount: 0, rating: 0, reviewCount: 0,
    });
    console.log('✅ Listing created: MyBusiness — ERP for Indian SMEs');
  } else {
    console.log('ℹ️  Listing already exists: MyBusiness');
  }

  // ── Listing 5 — MyAutoBot (AI Lead Capture) ────────────────────────────────
  const myAutoBotExists = await Listing.findOne({ slug: 'myautobot-ai-sales-rep' });
  if (!myAutoBotExists) {
    await Listing.create({
      seller: seller._id,
      status: 'active',
      isPaid: false,
      listingType: 'saas',
      isRebrandable: false,
      hasResellRights: false,
      isFullSourceCode: false,

      productName: 'MyAutoBot',
      slug: 'myautobot-ai-sales-rep',
      tagline: 'Your AI Sales Rep That Never Misses a Lead — Train once, deploy on WhatsApp, Instagram & your website instantly.',
      category: 'AI & Automation',
      shortDescription: 'MyAutoBot is an AI-powered lead capture and sales bot. Train it on your FAQs and docs — it instantly replies on WhatsApp, Instagram, and your website, capturing name, email, and buying intent automatically. Sub-1s response, 24/7.',

      fullDescription: `<h2>Your AI Sales Rep. Never Misses a Lead.</h2>
<p>Train MyAutoBot once on your FAQs, product catalog, and policies — it becomes an expert on your business and instantly replies to every customer across <strong>WhatsApp, Instagram DMs, and your website chat</strong>, 24 hours a day.</p>

<h3>Six High-Value Roles in One Bot</h3>
<ul>
  <li><strong>💼 Sales Representative:</strong> Qualifies prospects, answers objections, shares pricing, and nudges customers toward a decision — around the clock.</li>
  <li><strong>🎧 Customer Support Agent:</strong> Resolves the top 80% of queries instantly — returns, shipping, order status, account issues — so your team handles only what needs a human.</li>
  <li><strong>🛠️ Technical Assistant:</strong> Trained on your product docs, it walks users through setup and troubleshooting — reduces Tier-1 support tickets by up to 70%.</li>
  <li><strong>🚀 Onboarding Assistant:</strong> Guides new users through your product's core value conversationally — without making them read a manual.</li>
  <li><strong>🎯 Lead Generator:</strong> Captures name, contact, intent, budget, and timeline naturally mid-conversation — syncs every lead to your dashboard.</li>
  <li><strong>📣 Brand Ambassador:</strong> Trained on your tone and values — every reply feels like it came from your best employee, not a generic chatbot.</li>
</ul>

<h3>3 Channels, 1 Brain</h3>
<p>WhatsApp, Instagram DMs, and website chat are all powered by the same AI — so your customers get the same great experience everywhere, no configuration needed per channel.</p>

<h3>How It Works</h3>
<ol>
  <li><strong>Upload Your Docs:</strong> Share FAQs, product catalog, pricing, policies — PDFs, Google Docs, Word files, URLs, or even WhatsApp chat exports. Takes ~10 minutes.</li>
  <li><strong>AI Learns Instantly:</strong> The AI reads everything, learns your tone and edge cases, and updates automatically when you change a document.</li>
  <li><strong>Leads Pour In:</strong> Deploy to WhatsApp, Instagram, and your website. Every conversation is a structured lead record — no manual data entry.</li>
</ol>

<h3>The Cost Comparison</h3>
<p>Hiring a sales rep, support agent, and onboarding specialist costs ₹12–25 lakh/year — and they still can't work 24/7. MyAutoBot replaces all of it for a fraction of the price, with zero sick days.</p>`,

      pricingModel: 'custom',
      askPriceOnly: true,
      startingPrice: null,
      currency: 'INR',
      hasFreerial: true,
      freeTrialDays: 7,
      minContractLength: 'monthly',

      deployment: ['cloud'],
      platforms: ['web'],
      hasApi: true,
      isOpenSource: false,
      companyStage: 'growth',
      dataResidency: 'India (Mumbai)',
      securityCerts: ['AES-256'],
      uptimeSla: '99.9%',

      targetIndustries: ['E-Commerce', 'Food & Beverage', 'Real Estate', 'Services', 'Marketing', 'Retail'],
      targetCompanySize: ['smb', 'mid_market'],

      keyFeatures: [
        'AI Trained on Your Own Docs, FAQs & Policies',
        'WhatsApp, Instagram DM & Website Chat — 1 AI Brain',
        'Sub-1 Second Response Time, 24/7/365',
        'Auto Lead Capture — Name, Email, Phone, Intent',
        'AI Sales Rep — Qualify, Pitch & Close Deals',
        'Customer Support — Resolves 80% of Queries Instantly',
        'Technical Assistant — Step-by-step Troubleshooting',
        'Lead Generator — Budget, Timeline & Intent Capture',
        'Live Dashboard — Every Conversation & Lead',
        'Official Meta Partner',
        'AES-256 Encryption — Enterprise Grade Security',
        'Free Setup Included',
      ],

      integrations: ['WhatsApp Business API', 'Instagram DM', 'Meta'],
      languagesSupported: ['English', 'Hindi'],

      useCases: [
        {
          title: 'Restaurants & Food Businesses',
          description: 'Takes table bookings, sends menus, answers dietary queries, and follows up with post-visit review requests — all automatically on WhatsApp.',
        },
        {
          title: 'Online Brands & E-Commerce',
          description: 'Turns Instagram and WhatsApp enquiries into a complete checkout flow — stock checks, size availability, order tracking, and payment links — without any manual effort.',
        },
        {
          title: 'Service Businesses & Agencies',
          description: 'Qualifies inbound leads, captures budget and timeline, books consultation slots, and delivers structured lead records so your team only talks to ready-to-buy clients.',
        },
      ],

      testimonials: [
        {
          name: 'Sarah Jenkins',
          designation: 'Owner',
          company: 'Apex Realty Group',
          quote: 'MyAutoBot completely changed how we handle WhatsApp enquiries. We now get customer details automatically — without chasing anyone. It paid for itself in the first week.',
          approved: true,
        },
        {
          name: 'Arjun Kapoor',
          designation: 'Founder',
          company: 'FreshBox Delivery',
          quote: 'I was sceptical at first, but within 72 hours of going live, we had 14 qualified leads — all captured while I was sleeping. The ROI is absurd.',
          approved: true,
        },
        {
          name: 'Meera Nair',
          designation: 'Owner',
          company: 'Spice Route Kitchen',
          quote: 'Our restaurant gets 200+ WhatsApp messages a week. MyAutoBot handles 90% of them — reservations, menu questions, everything. My staff can actually focus on cooking.',
          approved: true,
        },
      ],

      faq: [
        {
          question: 'Is it hard to set up?',
          answer: 'No. Upload your documents, we handle the rest. Most businesses go live within 24 hours. Free setup is included with every plan.',
        },
        {
          question: 'Does it work on WhatsApp?',
          answer: 'Yes. MyAutoBot is an Official Meta Partner and connects directly to the WhatsApp Business API — no third-party workarounds.',
        },
        {
          question: 'Can I see and export my leads?',
          answer: 'Yes. Every conversation and lead is visible in your real-time dashboard. You can export all leads as a CSV at any time.',
        },
        {
          question: 'What if the bot cannot answer a question?',
          answer: 'The bot gracefully escalates to a human agent with full conversation context — so your team takes over with complete background, not a cold handoff.',
        },
        {
          question: 'How does it learn my business?',
          answer: 'You upload your FAQs, product catalog, pricing sheets, and policies in any format (PDF, Google Doc, Word, URL, or WhatsApp export). The AI reads everything and becomes a true expert in minutes. It updates automatically when you change a document.',
        },
      ],

      supportChannels: ['chat', 'email'],
      supportHours: 'Mon–Sat, 9 AM – 7 PM IST',
      supportTimezone: 'Asia/Kolkata',
      onboardingType: 'assisted',
      offersTraining: false,
      hasDedicatedManager: false,
      viewCount: 0, inquiryCount: 0, rating: 0, reviewCount: 0,
    });
    console.log('✅ Listing created: MyAutoBot — AI Sales Rep');
  } else {
    console.log('ℹ️  Listing already exists: MyAutoBot');
  }

  // ── Listing 6 — GymPro India (Gym Management) ──────────────────────────────
  const gymProExists = await Listing.findOne({ slug: 'gymproindia-gym-management' });
  if (!gymProExists) {
    await Listing.create({
      seller: seller._id,
      status: 'active',
      isPaid: false,
      listingType: 'saas',
      isRebrandable: false,
      hasResellRights: false,
      isFullSourceCode: false,

      productName: 'GymPro India',
      slug: 'gymproindia-gym-management',
      tagline: 'Run Your Gym Like a Pro, Not on Paper — QR attendance, lead CRM, GST billing & Razorpay in one platform built for India.',
      category: 'Fitness & Gym Management',
      shortDescription: "GymPro India is India's complete gym management platform with QR check-in, 7-stage lead CRM, GST invoicing, Razorpay/UPI payments, inventory, multi-branch, and smart renewal automation. Built specifically for Indian gym owners.",

      fullDescription: `<h2>India's Most Powerful Gym Management Platform</h2>
<p>GymPro India is built from the ground up for Indian gym owners — not a Western product retrofitted for India. Every feature accounts for GST, Razorpay, UPI, +91 mobile numbers, and Indian compliance requirements.</p>

<h3>Core Modules</h3>
<ul>
  <li><strong>Smart Member Management:</strong> Full profiles, QR codes, auto-expiry, freeze memberships, emergency contacts, and fitness goals — all in one place.</li>
  <li><strong>QR Attendance System:</strong> 2-second scan check-in. Live attendance dashboard. Monthly calendar view per member.</li>
  <li><strong>Lead CRM & Pipeline:</strong> 7-stage Kanban pipeline from New → Converted. One-click lead-to-member conversion. Never lose a prospect again.</li>
  <li><strong>Payments & GST Billing:</strong> Razorpay integration (UPI, cards, net banking, wallets). Fully GST-compliant invoices auto-emailed to members after every payment.</li>
  <li><strong>Inventory & POS:</strong> Track supplements, equipment, and merchandise. Low-stock alerts. Sell directly from the app.</li>
  <li><strong>Multi-Branch Management:</strong> Unlimited branches with branch-wise member assignment, facilities, and operating hours.</li>
  <li><strong>RBAC & Security:</strong> Owner, Manager, Receptionist, and Trainer roles with data isolation and full audit logs.</li>
  <li><strong>Smart Automation:</strong> Daily 6 AM cron auto-expires memberships, sends renewal reminders, and detects member inactivity — zero manual effort.</li>
  <li><strong>Real-time Analytics:</strong> Revenue trends, attendance charts, plan distribution, and lead funnel — all live.</li>
</ul>

<h3>Built for India</h3>
<ul>
  <li>INR (₹) with GST-inclusive pricing and CGST/SGST invoicing</li>
  <li>Razorpay — UPI, cards, net banking, wallets</li>
  <li>Indian mobile number validation and +91 support</li>
  <li>India Data Privacy (PDPB ready)</li>
  <li>WhatsApp renewal reminders (coming soon)</li>
</ul>

<h3>Pricing Plans</h3>
<ul>
  <li><strong>Trial — Free (14 days):</strong> Up to 50 members, 1 branch, basic attendance.</li>
  <li><strong>Basic — ₹999/mo:</strong> Up to 500 members, 1 branch, QR attendance, lead CRM, inventory, GST invoicing.</li>
  <li><strong>Professional — ₹2,499/mo:</strong> Unlimited members, 5 branches, staff management, RBAC, advanced analytics, Razorpay, priority support.</li>
  <li><strong>Enterprise — Custom:</strong> Unlimited everything, custom branding, dedicated server, SLA, 24/7 phone support.</li>
</ul>
<p><em>All prices + 18% GST. Annual plans save 20%.</em></p>`,

      pricingModel: 'flat',
      askPriceOnly: false,
      startingPrice: 999,
      currency: 'INR',
      hasFreerial: true,
      freeTrialDays: 14,
      minContractLength: 'monthly',

      deployment: ['cloud'],
      platforms: ['web'],
      hasApi: true,
      isOpenSource: false,
      companyStage: 'growth',
      dataResidency: 'India',
      securityCerts: ['JWT', 'AES-256'],

      targetIndustries: ['Fitness', 'Health & Wellness', 'Sports'],
      targetCompanySize: ['smb', 'mid_market'],

      keyFeatures: [
        'QR Code Attendance — 2-Second Check-In',
        'Smart Member Management with Auto-Expiry',
        '7-Stage Lead CRM Kanban Pipeline',
        'GST-Compliant Invoicing (CGST/SGST) with Razorpay',
        'UPI, Cards, Net Banking & Wallet Payments',
        'Inventory & POS — Supplements, Equipment, Merchandise',
        'Multi-Branch Management (Unlimited Branches)',
        'RBAC — Owner, Manager, Receptionist, Trainer Roles',
        'Smart Automation — Auto-Expire & Renewal Reminders',
        'Real-Time Revenue & Attendance Analytics',
        'CSV Member Import',
        'PDPB Ready — India Data Privacy Compliant',
      ],

      integrations: ['Razorpay', 'UPI'],
      languagesSupported: ['English', 'Hindi'],

      useCases: [
        {
          title: 'Single-Location Gym Automation',
          description: 'Replace paper registers and WhatsApp reminders with QR attendance, auto-renewal crons, and Razorpay billing — saving 3+ hours of manual work daily.',
        },
        {
          title: 'Multi-Branch Gym Chain',
          description: 'Manage unlimited branches from one dashboard. Branch-wise member assignment, revenue tracking, and attendance visibility across all locations.',
        },
        {
          title: 'Lead Conversion for Fitness Studios',
          description: 'The 7-stage Kanban CRM tracks every walk-in and enquiry from New to Converted. One-click conversion turns a lead into a paid member with GST invoice.',
        },
      ],

      testimonials: [
        {
          name: 'Rahul Sharma',
          designation: 'Owner',
          company: 'Iron Temple Gym, Mumbai',
          quote: 'GymPro India transformed how we run our 3 branches. Renewals are now automated. We recovered ₹2.4L in pending payments in the first month!',
          approved: true,
        },
        {
          name: 'Priya Menon',
          designation: 'Owner',
          company: 'FitZone Fitness, Bangalore',
          quote: 'The lead CRM is a game changer. Our conversion rate jumped from 18% to 41% in 3 months. The Kanban view makes follow-ups effortless.',
          approved: true,
        },
        {
          name: 'Ajay Nair',
          designation: 'Manager',
          company: 'Powerhouse Club, Pune',
          quote: 'GST invoicing and Razorpay integration saved us 4 hours of manual billing every week. Best gym software for Indian businesses.',
          approved: true,
        },
      ],

      faq: [
        {
          question: 'How long does setup take?',
          answer: 'Most gyms are up and running in under 15 minutes. Import your existing members via CSV or add them manually — our onboarding wizard guides you through every step.',
        },
        {
          question: 'Does it support Razorpay and UPI?',
          answer: 'Yes. GymPro India integrates natively with Razorpay — supporting UPI, debit/credit cards, net banking, and wallets. GST invoices are auto-generated for every payment.',
        },
        {
          question: 'Can I manage multiple gym branches?',
          answer: 'Yes. The Professional and Enterprise plans support multiple branches with branch-wise member assignment, facilities, operating hours, and separate analytics.',
        },
        {
          question: 'Is there a free trial?',
          answer: 'Yes. A 14-day free trial is available with no credit card required. Supports up to 50 members and 1 branch during the trial.',
        },
        {
          question: 'What user roles are supported?',
          answer: 'GymPro India supports Owner, Manager, Receptionist, and Trainer roles — each with appropriate data access and permissions via role-based access control (RBAC).',
        },
      ],

      supportChannels: ['email', 'phone'],
      supportHours: 'Mon–Sat, 9 AM – 7 PM IST',
      supportTimezone: 'Asia/Kolkata',
      onboardingType: 'self_serve',
      offersTraining: true,
      hasDedicatedManager: false,
      viewCount: 0, inquiryCount: 0, rating: 0, reviewCount: 0,
    });
    console.log('✅ Listing created: GymPro India — Gym Management');
  } else {
    console.log('ℹ️  Listing already exists: GymPro India');
  }

  // ── Listing 7 — DigiQR (Digital Identity Platform) ─────────────────────────
  const digiQRExists = await Listing.findOne({ slug: 'digiqr-digital-identity' });
  if (!digiQRExists) {
    await Listing.create({
      seller: seller._id,
      status: 'active',
      isPaid: false,
      listingType: 'saas',
      isRebrandable: false,
      hasResellRights: false,
      isFullSourceCode: false,

      productName: 'DigiQR',
      slug: 'digiqr-digital-identity',
      tagline: 'Your Entire Identity. One Smart Link — Build your digital profile, share via QR code, and turn every visitor into a lead.',
      category: 'Digital Marketing',
      shortDescription: 'DigiQR is the smart digital identity platform. Create a branded profile page with all your links, socials, and contact info — share it via a single QR code. Built-in lead capture, realtime analytics',

      fullDescription: `<h2>One Smart Link. Your Entire Identity.</h2>
<p>DigiQR replaces the traditional business card and scattered social links with a single, beautiful profile URL and QR code. Share everything — contact info, socials, portfolio, and booking links — in one tap or scan. Trusted by <strong>50,000+ professionals</strong> across India.</p>

<h3>Key Capabilities</h3>
<ul>
  <li><strong>One Smart Link:</strong> All your socials, contact info, portfolio, and links in a single beautiful profile URL.</li>
  <li><strong>Instant QR Code:</strong> A printable, scannable QR code that updates automatically when you change your profile.</li>
  <li><strong>Lead Capture Form:</strong> Built-in contact form collects visitor details and sends them to your inbox — no third-party form tool needed.</li>
  <li><strong>Analytics Dashboard:</strong> Real-time profile views, QR scan locations, link click-through rates, and lead conversion metrics.</li>
  <li><strong>WhatsApp & Call CTA:</strong> Let visitors reach you instantly via WhatsApp, phone, or email directly from your profile.</li>
  <li><strong>Custom Domain:</strong> Use your own domain — yourname.com/profile — for a fully branded experience (Pro plan).</li>
  <li><strong>Custom Themes:</strong> Personalise with themes, colours, and layouts that match your brand.</li>
  <li><strong>CSV Lead Export:</strong> Download all captured leads in one click for CRM import or outreach.</li>
</ul>

<h3>Pricing Plans</h3>
<ul>
  <li><strong>Starter — Free:</strong> 1 profile, QR code, up to 5 links, basic analytics, DigiQR branding.</li>
  <li><strong>Pro — ₹249/mo (billed yearly):</strong> Unlimited links, custom domain, lead capture forms, advanced analytics, remove branding, QR customisation, priority support.</li>
  <li><strong>Business — ₹699/mo (billed yearly):</strong> Everything in Pro + 10 team members, team dashboard, API access, white-label, account manager, SLA.</li>
</ul>

<h3>Proven at Scale</h3>
<p>50,000+ active users · 2M+ profile views · 98% satisfaction rate · 4.9/5 app rating</p>`,

      pricingModel: 'flat',
      askPriceOnly: false,
      startingPrice: 249,
      currency: 'INR',
      hasFreerial: true,
      freeTrialDays: 0,
      minContractLength: 'annual',

      deployment: ['cloud'],
      platforms: ['web'],
      hasApi: true,
      isOpenSource: false,
      companyStage: 'growth',

      targetIndustries: ['Professional Services', 'Freelance', 'Marketing', 'Sales', 'Real Estate'],
      targetCompanySize: ['smb'],

      keyFeatures: [
        'One Smart Link — All Socials, Contact & Portfolio',
        'Instant Printable QR Code (Auto-Updates)',
        'Built-in Lead Capture Form',
        'Real-Time Analytics — Views, Clicks & Conversions',
        'Geographic QR Scan Location Data',
        'WhatsApp & Call CTA on Profile',
        'Custom Domain (Pro+)',
        'Custom Themes & Branding',
        'Remove DigiQR Branding (Pro+)',
        'Team Dashboard — 10 Members (Business)',
        'API Access (Business)',
        'White-label (Business)',
        'CSV Lead Export — One Click',
      ],

      integrations: ['WhatsApp', 'Instagram', 'LinkedIn', 'X (Twitter)', 'Google Calendar'],
      languagesSupported: ['English'],

      useCases: [
        {
          title: 'Freelancers & Professionals',
          description: 'Replace a business card with a dynamic digital profile. Share your link on social media or via QR at events — leads flow directly to your inbox via the capture form.',
        },
        {
          title: 'Networking & Events',
          description: 'Print your QR code on merchandise, banners, or name tags. Anyone who scans connects with you instantly and is logged as a contact.',
        },
        {
          title: 'Marketing Teams',
          description: 'Give every team member a branded profile. Track which campaigns drive profile visits using the analytics dashboard and geographic scan data.',
        },
      ],

      testimonials: [
        {
          name: 'Priya Sharma',
          designation: 'Freelance UX Designer',
          company: 'Mumbai',
          quote: 'DigiQR replaced my old LinkTree setup. The lead capture form alone brought me 40+ client inquiries in the first month. Genuinely the best tool I bought this year.',
          approved: true,
        },
        {
          name: 'Rahul Mehta',
          designation: 'Founder & CEO',
          company: 'Buildify Technologies',
          quote: 'I hand out QR codes at every networking event now. DigiQR makes me look polished and lets me follow up with every contact. It has become central to how I network.',
          approved: true,
        },
        {
          name: 'Aisha Khan',
          designation: 'Digital Marketing Manager',
          company: 'GrowthHive Agency',
          quote: "My team's profiles look so professional now. The analytics show exactly which campaigns drive profile visits. Client-facing results have improved dramatically.",
          approved: true,
        },
      ],

      faq: [
        {
          question: 'Do I need technical skills to set up DigiQR?',
          answer: 'No. The entire setup takes under 2 minutes — fill in your details, choose a theme, and publish. No code, no designer, no tutorials needed.',
        },
        {
          question: 'What happens to my QR code if I update my profile?',
          answer: 'Your QR code URL never changes. Any updates you make to your profile are reflected instantly — no need to reprint or reshare your QR.',
        },
        {
          question: 'Is there a free plan?',
          answer: 'Yes. The Starter plan is free forever — includes 1 profile, QR code generation, up to 5 links, and basic analytics.',
        },
        {
          question: 'Can I use my own domain?',
          answer: 'Yes. On the Pro plan and above, you can connect a custom domain for a fully branded profile URL (e.g., yourname.com or yourcompany.com/team).',
        },
        {
          question: 'Can I export leads captured through DigiQR?',
          answer: 'Yes. All leads captured via your profile contact form can be exported as a CSV in one click from your analytics dashboard.',
        },
      ],

      supportChannels: ['chat', 'email'],
      supportHours: 'Mon–Fri, 9 AM – 6 PM IST',
      supportTimezone: 'Asia/Kolkata',
      onboardingType: 'self_serve',
      offersTraining: false,
      hasDedicatedManager: false,
      viewCount: 0, inquiryCount: 0, rating: 0, reviewCount: 0,
    });
    console.log('✅ Listing created: DigiQR — Digital Identity Platform');
  } else {
    console.log('ℹ️  Listing already exists: DigiQR');
  }

  // ── Future listings go below ───────────────────────────────────────────────

  // ── Sync seller listingsUsed count ────────────────────────────────────────
  const listingCount = await Listing.countDocuments({ seller: seller._id });
  await User.updateOne({ _id: seller._id }, { listingsUsed: listingCount });
  console.log(`ℹ️  Seller listingsUsed synced → ${listingCount}`);

  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
