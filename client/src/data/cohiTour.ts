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
    title: "Welcome",
    script: "You're looking at 7,052 loans totaling $1.86 billion in UPB. Geography, credit, pricing, composition, cash flows, and buyer matching — nine steps from raw tape to closed deal. No spreadsheets, no guesswork. Let's walk through it.",
    icon: "sparkles",
  },
  {
    route: "/step/1",
    target: "step-pills",
    title: "Your 9-Step Roadmap 🗺️",
    script: "These numbered pills are your shortcuts! Think of them like chapters in a book — click any number to jump straight to that analysis. We've got 9 steps plus a Bank Call Report. Ready to dive in?",
    icon: "list",
  },
  {
    route: "/step/1",
    target: "notif-bell",
    title: "Portfolio Health Alerts 🔔",
    script: "That little bell? That's your portfolio health monitor! It'll ping you about flood-risk concentrations, rate changes, and expiring commitments. Now let's explore each step — starting with the map!",
    icon: "bell",
  },

  // ─── STEP 1 — GEOGRAPHY ───────────────────────────────────────────────────
  {
    route: "/step/1",
    target: "map-layers",
    title: "Step 1 · Geography 🗺️",
    script: "Step 1 is all about geography! These layer controls let you switch between viewing loans by state, county, or census tract. Think of it like Google Maps, but for $1.86 billion worth of mortgages!",
    icon: "map",
  },
  {
    route: "/step/1",
    target: "geo-map",
    title: "The Interactive Loan Map 📍",
    script: "This interactive map shows where every loan in the pool is located. The darker the color, the more loan volume. California leads with 773 Provident loans alone — that's some serious West Coast concentration!",
    icon: "map",
  },
  {
    route: "/step/1",
    target: "filter-rail",
    title: "The Control Center 🎛️",
    script: "The filter rail on the left narrows everything down. Filter by state, product type, seller, or loan status. Whatever you filter here ripples through all 9 steps. It's the control center!",
    icon: "list",
  },

  // ─── STEP 2 — LOAN SEARCH ─────────────────────────────────────────────────
  {
    route: "/step/2",
    target: "status-bar",
    title: "Step 2 · Loan Search 🔍",
    script: "Step 2 is your loan-level search engine! This status bar shows the current selection: how many loans match your filters and their total unpaid balance. Right now, we're looking at all 7,052 loans!",
    icon: "chart",
  },
  {
    route: "/step/2",
    target: "loan-search-table",
    title: "Every Loan, Every Detail 📋",
    script: "This table lists every individual loan — sorted, filtered, searchable. Click any column header to sort. Each row shows the coupon rate, balance, FICO, LTV, and current status. Mortgage data heaven!",
    icon: "list",
  },
  {
    route: "/step/2",
    target: "loan-detail-panel",
    title: "Full Loan Tape Drilldown 📄",
    script: "Click any loan row to expand its full detail card. You'll see the complete loan tape — origination date, property type, occupancy, DTI, state, everything. This is the data behind the data!",
    icon: "lightbulb",
  },

  // ─── STEP 3 — CREDIT METRICS ──────────────────────────────────────────────
  {
    route: "/step/3",
    target: "step3-credit-row",
    title: "Step 3 · Credit Quality 💳",
    script: "Step 3 digs into credit quality! These cards show your weighted-average FICO, LTV, DTI, and coupon across the whole pool. The portfolio WA FICO is 744 — that's solidly prime territory!",
    icon: "shield",
  },
  {
    route: "/step/3",
    target: "step3-composition-row",
    title: "Credit Distribution Charts 📊",
    script: "These distribution charts show how credit metrics are spread across loans. See that FICO histogram? Most loans cluster between 720 and 800 — meaning this pool has very low default risk!",
    icon: "chart",
  },
  {
    route: "/step/3",
    target: "step3-footer",
    title: "Risk Posture Summary 🛡️",
    script: "The footer summarizes the overall risk posture. A WA LTV of 71% means borrowers have real equity. Lower LTV equals lower risk for the buyer. This is the stuff buyers love to see!",
    icon: "lightbulb",
  },

  // ─── STEP 4 — PRICING ─────────────────────────────────────────────────────
  {
    route: "/step/4",
    target: "pricing-header",
    title: "Step 4 · Pricing Sheet 💰",
    script: "Step 4 is where the money gets real! This is the Teraverde indicative pricing sheet — every loan gets a price based on LLPA adjustments. LLPA stands for Loan Level Price Adjustments, the industry's way of pricing risk.",
    icon: "dollar",
  },
  {
    route: "/step/4",
    target: "pricing-table",
    title: "Loan-by-Loan Pricing 🧮",
    script: "Each row is a loan with its base price, LLPA adjustments, and final execution price. The WA price across the pool is around 100.7 — that means loans are trading just above par. Near-par is great news for sellers!",
    icon: "list",
  },
  {
    route: "/step/4",
    target: "pricing-summary",
    title: "Total Deal Economics 📈",
    script: "This summary card shows total pool value at current market pricing. With 7,052 loans at roughly 100.7 price, the pool is worth approximately $1.87 billion at execution. That's what a buyer would actually pay!",
    icon: "chart",
  },

  // ─── STEP 5 — FINANCIAL METRICS ───────────────────────────────────────────
  {
    route: "/step/5",
    target: "financial-kpis",
    title: "Step 5 · Financial Metrics 📉",
    script: "Step 5 is the financial statement for the pool! Think of it like a quarterly earnings report — but for your mortgage portfolio. We're looking at interest income, net income, and return metrics.",
    icon: "chart",
  },
  {
    route: "/step/5",
    target: "financial-charts",
    title: "Income & Yield Analysis 💼",
    script: "These charts show trends over time. The yield curve tells you how the pool's income changes as rates shift. A pool with a WA coupon of 3.5% in a 6% rate world has real value — that's below-market servicing income!",
    icon: "dollar",
  },
  {
    route: "/step/5",
    target: "financial-footer",
    title: "Yield & Return Metrics 🎯",
    script: "The bottom line: ROA and ROE tell buyers how profitable holding this pool would be. Strong ROA means efficient capital use. These metrics are what insurance companies and banks look at first!",
    icon: "lightbulb",
  },

  // ─── STEP 6a — LOAN COMPOSITION ───────────────────────────────────────────
  {
    route: "/step/6a",
    target: "composition-chart",
    title: "Step 6a · Loan Composition 🥧",
    script: "Step 6a shows what the pool is MADE of! Product mix, occupancy types, property types, and seller breakdown. Think of this as the ingredient label for a $1.86 billion mortgage cake!",
    icon: "chart",
  },
  {
    route: "/step/6a",
    target: "composition-sellers",
    title: "Seller Breakdown 🏦",
    script: "This seller breakdown shows contributions from Provident, Stonegate, and New Penn Financial. Provident brings the highest FICO loans, Stonegate has broader LTV coverage, and New Penn brings the volume!",
    icon: "building",
  },
  {
    route: "/step/6a",
    target: "composition-proforma",
    title: "Pro-Forma Portfolio View 🔮",
    script: "The pro-forma section shows what the portfolio looks like AFTER you apply filters or remove certain loans. It's your what-if tool — super useful for structuring the exact pool a buyer wants!",
    icon: "sparkles",
  },

  // ─── STEP 6b — HISTORICAL YIELDS ──────────────────────────────────────────
  {
    route: "/step/6b",
    target: "yields-chart",
    title: "Step 6b · Historical Yields 📈",
    script: "Step 6b shows yield history! This chart plots coupon rates over time as the pool was originated. Loans from 2019 to 2021 have super-low rates — those are now extremely valuable in today's higher-rate environment!",
    icon: "chart",
  },
  {
    route: "/step/6b",
    target: "yields-spread",
    title: "Spread & Duration Analysis 📐",
    script: "The spread analysis compares the pool's weighted-average coupon against benchmark rates. A positive spread means the pool earns more than Treasuries — which is exactly what insurance companies love for duration matching!",
    icon: "dollar",
  },
  {
    route: "/step/6b",
    target: "yields-summary",
    title: "Current vs Pro-Forma Yields 🔄",
    script: "This summary shows current yield, duration, and convexity. Duration of roughly 5 years means the pool's value drops about 5% for every 1% rise in rates. Fixed-income buyers model this constantly!",
    icon: "lightbulb",
  },

  // ─── STEP 7 — LOAN SCHEDULE ───────────────────────────────────────────────
  {
    route: "/step/7",
    target: "schedule-table",
    title: "Step 7 · Loan Schedule 📅",
    script: "Step 7 is the loan-by-loan schedule! Every loan's remaining balance, monthly payment, and projected payoff date is here. This is what servicers use to track cash flows day by day!",
    icon: "list",
  },
  {
    route: "/step/7",
    target: "schedule-cashflow",
    title: "Cash Flow Projections 💸",
    script: "This cash flow projection shows total principal and interest payments month by month. Prepayment speeds, defaults, and extensions all affect this curve. Buyers model these cash flows to determine fair value!",
    icon: "chart",
  },
  {
    route: "/step/7",
    target: "schedule-maturity",
    title: "Maturity & Duration Profile ⏳",
    script: "The maturity distribution shows when loans pay off. Most of this pool matures between 2035 and 2040, which means a buyer is committing to a 10 to 15 year investment horizon. That's perfect for insurance company portfolios!",
    icon: "lightbulb",
  },

  // ─── STEP 8 — PURCHASE SUMMARY ────────────────────────────────────────────
  {
    route: "/step/8",
    target: "summary-header",
    title: "Step 8 · Purchase Summary 🤝",
    script: "Step 8 is the deal sheet! This is the executive summary a buyer's credit committee would review before approving an acquisition. Clean, concise, and packed with the key numbers!",
    icon: "dollar",
  },
  {
    route: "/step/8",
    target: "summary-table",
    title: "Acquisition Breakdown by Seller 📊",
    script: "This table breaks down the acquisition by seller — loan count, UPB, pricing, and status. Available loans are ready to sell. Allocated means under LOI. Committed means signed. Sold means done!",
    icon: "list",
  },
  {
    route: "/step/8",
    target: "summary-footer",
    title: "Deal Economics at a Glance 💼",
    script: "The footer shows the total deal economics: purchase price, carry cost, and expected yield. This is Teraverde's indicative pricing — for real execution pricing, you'd engage the capital markets desk!",
    icon: "sparkles",
  },

  // ─── STEP 9 — COHORT ANALYSIS ─────────────────────────────────────────────
  {
    route: "/step/9",
    target: "cohort-selector",
    title: "Step 9 · Cohort Analysis 🎯",
    script: "Step 9 segments the pool into cohorts for buyer matching! Choose to group by product type, rate bucket, LTV band, vintage year, state, or unit count. Each view tells a different story about who should buy which slice!",
    icon: "chart",
  },
  {
    route: "/step/9",
    target: "cohort-bar-chart",
    title: "UPB by Cohort Visualization 📊",
    script: "This bar chart shows UPB by cohort. See how 30-year fixed loans dominate at over 80% of the pool? GSEs like Fannie Mae and Freddie Mac LOVE 30-year fixed. Conforming loans with prime FICO equals GSE paradise!",
    icon: "chart",
  },
  {
    route: "/step/9",
    target: "cohort-table",
    title: "Cohort Metrics for Buyer Matching 🏆",
    script: "The cohort metrics table is your buyer pitch deck in data form. FICO 769 in the Provident tranche? That's AAA credit quality. WAC of 3.28%? Below-market yield that insurance companies will pay a premium for!",
    icon: "list",
  },

  // ─── BANK CALL REPORT ─────────────────────────────────────────────────────
  {
    route: "/bank-call-report",
    target: "buyer-intelligence",
    title: "Bank Call Report 🏛️",
    script: "Welcome to the Bank Call Report — Cohi's buyer research hub! This page pulls LIVE data from the FDIC BankFind Suite. Every number here is real, updated quarterly. Search any FDIC-insured bank to see their financial profile!",
    icon: "building",
  },
  {
    route: "/bank-call-report",
    target: "bcr-search",
    title: "Live FDIC Data Search 🔎",
    script: "Type any bank name here and hit Enter. Cohi will pull their total assets, deposits, equity, ROA, ROE — the full CALL REPORT. This is the same data bank regulators use. Now you can see if a buyer has the capital to close!",
    icon: "lightbulb",
  },
  {
    route: "/bank-call-report",
    target: "bcr-filter",
    title: "Filter by Institution Type 🎉",
    script: "Use these filter chips to narrow results by bank type. Looking for large buyers with $10 billion or more in assets? Click Large. Want community banks? Click Community. Match the right buyer size to your pool size — and you've got a deal! That's the full SprinkleX tour. I'm Cohi, and I'll be here whenever you need me!",
    icon: "sparkles",
  },
];
