export type CohiStop = {
  route: string;
  target: string;
  title: string;
  script: string;
  icon: "lightbulb" | "map" | "list" | "bell" | "upload" | "chart" | "sparkles" | "dollar" | "building" | "shield";
};

export const COHI_TOUR_STOPS: CohiStop[] = [
  // ─── WELCOME (Step 1 page) ────────────────────────────────────────────────
  {
    route: "/step/1",
    target: "sidebar-main-menu",
    title: "Hey, I'm Cohi! 👋",
    script: "Hey there! I'm Cohi, your AI mortgage analyst! Welcome to SprinkleX — the smartest way to analyze a loan portfolio. You're looking at 7,052 real loans worth $1.86 billion from Provident, Stonegate, and New Penn Financial. The sidebar here is your main navigation. Let's explore together — this is going to be fun!",
    icon: "sparkles",
  },
  {
    route: "/step/1",
    target: "step-pills",
    title: "Your 9-Step Roadmap 🗺️",
    script: "These numbered pills are your shortcuts to each analysis chapter! Think of them like a roadmap from raw data to deal execution. We've got 9 analytical steps plus a Bank Call Report at the end. You can jump to any step anytime. I'll walk you through all of them right now!",
    icon: "list",
  },
  {
    route: "/step/1",
    target: "notif-bell",
    title: "Portfolio Health Alerts 🔔",
    script: "That little bell is your portfolio health monitor! It'll ping you about flood-risk concentrations in coastal markets, interest rate movements, expiring loan commitments, and more. Think of it as your real-time risk radar. Now — let's explore each step, starting with the geographic map!",
    icon: "bell",
  },

  // ─── STEP 1 — GEOGRAPHY ───────────────────────────────────────────────────
  {
    route: "/step/1",
    target: "map-layers",
    title: "Step 1 · Geographic Search 🗺️",
    script: "Step 1 is all about geography! These layer controls let you switch between viewing loans by state, county, or census tract. It's like Google Maps, but for $1.86 billion worth of mortgages. California dominates with over 1,400 loans alone — that's some serious West Coast concentration!",
    icon: "map",
  },
  {
    route: "/step/1",
    target: "geo-map",
    title: "The Interactive Loan Map 📍",
    script: "This interactive map shows exactly where every loan in the pool is located. The darker the color, the more loan volume in that region. You can click any state to drill down into county-level detail. Try clicking California — you'll see the full breakdown across LA, Orange County, and the Bay Area!",
    icon: "map",
  },
  {
    route: "/step/1",
    target: "filter-rail",
    title: "The Control Center 🎛️",
    script: "The filter rail on the left is the control center for the entire platform. Filter by state, product type, seller, loan status, FICO range, LTV band — whatever you set here ripples across ALL nine steps. It's how you carve out a specific sub-pool for analysis. Powerful stuff!",
    icon: "list",
  },

  // ─── STEP 2 — LOAN SEARCH ─────────────────────────────────────────────────
  {
    route: "/step/2",
    target: "status-bar",
    title: "Step 2 · Loan Search 🔍",
    script: "Step 2 is your loan-level search engine! This status bar shows the current selection — how many loans match your filters and their total unpaid balance. The color-coded pills break it down by disposition status: Available, Allocated, Committed, and Sold. Real-time deal tracking!",
    icon: "chart",
  },
  {
    route: "/step/2",
    target: "loan-search-table",
    title: "Every Loan, Every Detail 📋",
    script: "This table lists every individual loan — sortable, filterable, searchable. Click any column header to re-sort instantly. Each row shows the coupon rate, unpaid balance, FICO score, LTV ratio, property type, state, and current status. This is the actual mortgage tape — 7,052 rows of real data!",
    icon: "list",
  },
  {
    route: "/step/2",
    target: "loan-detail-panel",
    title: "Full Loan Tape Drilldown 📄",
    script: "Clicking any status pill opens a full drilldown panel with KPIs, charts, and a complete sortable loan table for that status group. You can see exactly which loans are available to sell, which are committed to buyers, and which have already closed. This is where deals get done!",
    icon: "lightbulb",
  },

  // ─── STEP 3 — CREDIT METRICS ──────────────────────────────────────────────
  {
    route: "/step/3",
    target: "step3-credit-row",
    title: "Step 3 · Credit Quality 💳",
    script: "Step 3 is all about credit quality! These cards show your weighted-average FICO score, loan-to-value ratio, debt-to-income ratio, and coupon rate across the entire pool. The portfolio weighted-average FICO is 744 — that's solidly prime territory. Low default risk, high buyer appeal!",
    icon: "shield",
  },
  {
    route: "/step/3",
    target: "step3-composition-row",
    title: "Credit Distribution Charts 📊",
    script: "These distribution charts show how credit metrics are spread across all 7,052 loans. Look at that FICO histogram — most loans cluster between 720 and 800! That bell curve shape tells buyers this isn't cherry-picked data. It's a naturally high-quality pool. Lenders love to see this!",
    icon: "chart",
  },
  {
    route: "/step/3",
    target: "step3-footer",
    title: "Risk Posture Summary 🛡️",
    script: "The footer summarizes the overall risk posture of the portfolio. A weighted-average LTV of 71% means borrowers have substantial equity in their homes — lower LTV equals lower default risk equals lower loss severity. Combined with a 744 FICO? This pool is highly attractive to institutional buyers!",
    icon: "lightbulb",
  },

  // ─── STEP 4 — PRICING ─────────────────────────────────────────────────────
  {
    route: "/step/4",
    target: "pricing-header",
    title: "Step 4 · Pricing Sheet 💰",
    script: "Step 4 is where the money gets real! This is the Teraverde indicative pricing sheet. Every single loan gets a price based on LLPA adjustments — that stands for Loan Level Price Adjustments. It's the mortgage industry's precise method for pricing credit risk into every loan. Super important!",
    icon: "dollar",
  },
  {
    route: "/step/4",
    target: "pricing-table",
    title: "Loan-by-Loan Pricing 🧮",
    script: "Each row is an individual loan with its base price, LLPA adjustments for FICO, LTV, property type, and occupancy, plus its final execution price. The weighted-average price across the pool is around 100.71 — that means loans are trading just above par! Near-par pricing is fantastic news for sellers right now.",
    icon: "list",
  },
  {
    route: "/step/4",
    target: "pricing-summary",
    title: "Total Deal Economics 📈",
    script: "This summary shows the total pool value at current market pricing. With 7,052 loans priced at roughly 100.71, the portfolio is worth approximately $1.87 billion at execution. That's the all-in number a buyer's credit committee would see. Teraverde's pricing desk confirms this indicative bid weekly!",
    icon: "chart",
  },

  // ─── STEP 5 — FINANCIAL METRICS ───────────────────────────────────────────
  {
    route: "/step/5",
    target: "financial-kpis",
    title: "Step 5 · Financial Metrics 📉",
    script: "Step 5 is the financial statement for the loan pool — think of it like a quarterly earnings report, but for mortgages! The KPI strip at the top summarizes the core numbers: total UPB, weighted-average coupon, bond-equivalent yield, and duration. These are the metrics institutional buyers model first!",
    icon: "chart",
  },
  {
    route: "/step/5",
    target: "financial-charts",
    title: "Income & Balance Sheet Analysis 💼",
    script: "These charts break down the income statement and balance sheet considerations. First-year estimated income is $65 million before amortization. The balance sheet shows total purchase price at $1.874 billion — that's UPB plus the premium buyers pay for below-market coupon rates in today's 6% environment!",
    icon: "dollar",
  },
  {
    route: "/step/5",
    target: "financial-footer",
    title: "Yield & Return Metrics 🎯",
    script: "The yield analysis at the bottom is what insurance companies and pension funds scrutinize most carefully. A 3.17% bond-equivalent yield with 6.80 years of duration provides excellent risk-adjusted income for liability-matching portfolios. Insurance companies managing annuity liabilities LOVE this profile!",
    icon: "lightbulb",
  },

  // ─── STEP 6a — LOAN COMPOSITION ───────────────────────────────────────────
  {
    route: "/step/6a",
    target: "composition-chart",
    title: "Step 6a · Loan Composition 🥧",
    script: "Step 6a shows what the pool is made of! This comparison chart breaks down loan types side by side — current portfolio versus projected with selected loans. Total Real Estate Loans dominate at $523 million in California alone. Think of this as the ingredient label for a $1.86 billion mortgage cake!",
    icon: "chart",
  },
  {
    route: "/step/6a",
    target: "composition-sellers",
    title: "Seller Breakdown 🏦",
    script: "This narrative panel explains the seller breakdown in detail. Provident brings the highest-FICO loans averaging 769 — their borrowers are prime quality. Stonegate contributes broader LTV coverage for investors seeking yield. New Penn Financial brings the volume with 3,637 loans. Three sellers, one powerful pool!",
    icon: "building",
  },
  {
    route: "/step/6a",
    target: "composition-proforma",
    title: "Pro-Forma Portfolio View 🔮",
    script: "The pro-forma section is your what-if tool! It projects what the portfolio looks like after you add the selected loans. Just two loan types — 22% of categories — represent 82% of the total projected balance. That concentration tells you exactly which loan types drive portfolio economics. Invaluable for structuring!",
    icon: "sparkles",
  },

  // ─── STEP 6b — HISTORICAL YIELDS ──────────────────────────────────────────
  {
    route: "/step/6b",
    target: "yields-chart",
    title: "Step 6b · Historical Yields 📈",
    script: "Step 6b shows yield history over time! This area trend chart plots the portfolio's income metrics across quarters. Loans originated in 2019 through 2021 carry those historically low coupon rates — and in today's 6% rate environment, those below-market coupons are actually EXTREMELY valuable to certain buyers!",
    icon: "chart",
  },
  {
    route: "/step/6b",
    target: "yields-spread",
    title: "Spread & Duration Analysis 📐",
    script: "The spread analysis compares the pool's weighted-average coupon against benchmark Treasury rates. A 3.50% coupon versus 4.5% Treasuries means negative spread — but that's exactly what insurance companies seek! They're not chasing yield; they're matching the duration of their long-term liabilities. Perfect fit!",
    icon: "dollar",
  },
  {
    route: "/step/6b",
    target: "yields-summary",
    title: "Current vs Pro-Forma Yields 🔄",
    script: "This panel compares current yields against projected yields with the selected loans added. Click any KPI pill to drill into its historical detail. The bond-equivalent yield of 3.17% with 6.80 years of duration? That means the pool's value drops about 5% for every 1% rise in rates. Fixed-income buyers model this constantly!",
    icon: "lightbulb",
  },

  // ─── STEP 7 — LOAN SCHEDULE ───────────────────────────────────────────────
  {
    route: "/step/7",
    target: "schedule-table",
    title: "Step 7 · Loan Schedule 📅",
    script: "Step 7 is the complete loan-by-loan schedule! Every loan's remaining balance, monthly payment, current status, interest rate, and projected payoff date is listed right here. This is what mortgage servicers use to track cash flows on a daily basis. Sort by any column to find specific loans instantly!",
    icon: "list",
  },
  {
    route: "/step/7",
    target: "schedule-cashflow",
    title: "Cash Flow Projections 💸",
    script: "The status bar above the table shows real cash flow data — how many loans are available, allocated to buyers, committed under LOI, or already sold. Prepayment speeds, defaults, and loan extensions all affect these projections. Buyers model these monthly cash flows very carefully to determine what they'll actually pay!",
    icon: "chart",
  },
  {
    route: "/step/7",
    target: "schedule-maturity",
    title: "Maturity & Duration Profile ⏳",
    script: "The weighted-average duration of 6.8 years means a buyer is committing to roughly a 7-year investment horizon on average. Most loans in this pool have 20-28 years of remaining term. That long-duration profile is absolutely perfect for insurance company portfolios needing to match 10 to 20-year liability cash flows!",
    icon: "lightbulb",
  },

  // ─── STEP 8 — PURCHASE SUMMARY ────────────────────────────────────────────
  {
    route: "/step/8",
    target: "summary-header",
    title: "Step 8 · Purchase Summary 🤝",
    script: "Step 8 is the deal sheet — the executive summary that a buyer's credit committee would review before approving an acquisition! Clean, concise, and packed with every key number a decision-maker needs. Teraverde structures this to match what institutional buyers expect to see in their investment memos.",
    icon: "dollar",
  },
  {
    route: "/step/8",
    target: "summary-table",
    title: "Acquisition Breakdown by Seller 📊",
    script: "This summary table breaks the acquisition down by seller — loan count, unpaid balance, pricing indication, and current disposition status. Green means Available — ready to sell right now. Yellow is Allocated — under letter of intent. Orange is Committed — signed deal. Blue is Sold — deal closed and done!",
    icon: "list",
  },
  {
    route: "/step/8",
    target: "summary-footer",
    title: "Deal Economics at a Glance 💼",
    script: "The insights panel at the bottom summarizes deal economics in plain language. This is Teraverde's indicative pricing — based on current market conditions and LLPA tables. For actual execution pricing, you'd engage the capital markets desk for a live bid. But this gives you a precise starting point for negotiations!",
    icon: "sparkles",
  },

  // ─── STEP 9 — COHORT ANALYSIS ─────────────────────────────────────────────
  {
    route: "/step/9",
    target: "cohort-selector",
    title: "Step 9 · Cohort Analysis 🎯",
    script: "Step 9 is where we segment the pool for buyer matching! These dimension buttons let you group loans by product type, rate bucket, LTV band, vintage year, state, or unit count. Each view tells a completely different story about which institutional buyer is the best fit for each slice of the portfolio!",
    icon: "chart",
  },
  {
    route: "/step/9",
    target: "cohort-bar-chart",
    title: "UPB by Cohort Visualization 📊",
    script: "This bar chart shows unpaid principal balance broken down by cohort. See how 30-year fixed-rate loans dominate at over 80% of the pool? Here's the insider tip: GSEs like Fannie Mae and Freddie Mac absolutely LOVE 30-year fixed conforming loans with prime FICO scores. That's literally their core business!",
    icon: "chart",
  },
  {
    route: "/step/9",
    target: "cohort-table",
    title: "Cohort Metrics for Buyer Matching 🏆",
    script: "This sortable cohort metrics table is your buyer pitch deck in data form! A FICO of 769 in the Provident tranche? That's AAA credit quality — the best of the best. A WAC of 3.28%? That's below-market yield that insurance companies will pay a meaningful premium to acquire. This data tells the whole story!",
    icon: "list",
  },

  // ─── BANK CALL REPORT ─────────────────────────────────────────────────────
  {
    route: "/bank-call-report",
    target: "buyer-intelligence",
    title: "Bank Call Report 🏛️",
    script: "Welcome to the Bank Call Report — Cohi's live buyer research hub! This page connects directly to the FDIC BankFind Suite API. Every number here is real regulatory data, updated quarterly. Use the Buyer Intelligence cards to explore which institutional categories are best matched to your specific loan cohorts!",
    icon: "building",
  },
  {
    route: "/bank-call-report",
    target: "bcr-search",
    title: "Live FDIC Data Search 🔎",
    script: "Type any bank name here and hit Enter — Cohi pulls their complete FDIC Call Report data: total assets, net loans, total deposits, equity capital, ROA, and ROE. This is the exact same data bank regulators use for safety and soundness exams. Now you can verify whether a potential buyer actually has the capital to close your deal!",
    icon: "lightbulb",
  },
  {
    route: "/bank-call-report",
    target: "bcr-filter",
    title: "Filter by Institution Type 🎉",
    script: "Use these filter chips to narrow FDIC search results by institution type! Looking for large national banks with $10 billion or more in assets? Click 'Large'. Want community banks that might compete less on price? Click 'Community'. Match the right buyer size to your pool size — and you've got yourself a deal! That's the complete SprinkleX tour. I'm Cohi, and I'll be here whenever you need me!",
    icon: "sparkles",
  },
];
