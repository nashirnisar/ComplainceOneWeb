import { UserProfile, ComplianceTask, ComplianceStatus, CompliancePriority } from '../types';

interface ComplianceTemplate {
  name: string;
  category: string;
  description: string;
  priority: CompliancePriority;
  penalty: string;
  risks: string;
  guidanceSteps: string[];
  daysOffsetFromOnboarding?: number; // Simulated deadline relative to company registration
  monthAndDay?: { month: number; day: number }; // Annual recurring fixed dates (0-based month)
  monthlyDay?: number; // Monthly recurring day (e.g. 11th for GSTR-1)
  condition?: (profile: UserProfile) => boolean;
}

export const COMPLIANCE_TEMPLATES: ComplianceTemplate[] = [
  // 1. INDIVIDUALS & GENERAL
  {
    name: 'Income Tax Return (ITR-1/ITR-2) Filing',
    category: 'Income Tax',
    description: 'Annual submission of income tax returns for individuals having salaried income, house property, or interest earnings.',
    priority: 'High',
    penalty: 'Late-filing fee up to ₹5,000 under Section 234F plus interest charging on overdue tax.',
    risks: 'Inability to carry forward capital losses, rejection of visa/loan applications, potential scrutiny audits.',
    guidanceSteps: [
      'Collect Form 16 from your employer(s) and Form 26AS / AIS from the Income Tax Portal.',
      'Compile interest certificates from banks and receipts for tax savings deductions (80C, 80D, etc.).',
      'Verify details on the e-filing portal (incomes, TDS deductions).',
      'Select correct ITR form, compute tax liability, pay self-assessment tax if any, and submit return.',
      'Mandatory: E-verify your filed return within 30 days via Aadhaar OTP or Net Banking.'
    ],
    monthAndDay: { month: 6, day: 31 }, // July 31
    condition: (profile) => profile.userType === 'Individual'
  },
  {
    name: 'Self-Assessment & Advance Tax (Q2 Installment)',
    category: 'Income Tax',
    description: 'Payment of second installment of advance tax (30% of total estimated tax liability for the year).',
    priority: 'Medium',
    penalty: 'Interest charging under section 234C at 1% per month on the shortfall amount.',
    risks: 'Compounding interest liability making ultimate tax bill significantly higher.',
    guidanceSteps: [
      'Estimate total gross income from all sources for the current financial year.',
      'Calculate eligible tax deductions and compute net taxable income and final tax liability.',
      'Determine the advance tax payable (30% by mid-September). Deduct TDS already cut.',
      'Log into the e-filing portal, navigate to e-Pay Tax, select Challan 280 / Tax payment and complete online net-banking transaction.'
    ],
    monthAndDay: { month: 8, day: 15 }, // September 15
    condition: (profile) => profile.userType === 'Individual' || profile.userType === 'Freelancer'
  },
  {
    name: 'Form AIS (Annual Information Statement) Audit Check',
    category: 'Financial Tracking',
    description: 'Review and confirm financial transaction details logged in your Annual Information Statement on the tax portal.',
    priority: 'Low',
    penalty: 'No immediate direct penalty, but mismatched reporting can attract severe tax adjustment notices.',
    risks: 'Discrepancies between ITR filed figures and government backend tracking, inviting notices.',
    guidanceSteps: [
      'Log into the Income Tax E-filing online portal.',
      'Go to services menu and click on AIS (Annual Information Statement).',
      'Download the AIS/TIS summary PDF.',
      'Cross-check bank interest, stock dividends, and property sell/buy reports against your bank passbook.',
      'Submit online feedback if any transaction belongs to another PAN or is double-calculated.'
    ],
    monthAndDay: { month: 5, day: 15 }, // June 15
    condition: (p) => true // For everyone
  },

  // 2. FREELancers & CONSULTANTS
  {
    name: 'Presumptive Tax ITR-4 (Section 44ADA) Filing',
    category: 'Income Tax',
    description: 'Simpler tax return filing for specified professionals (freelancers, IT consultants, designers) declaring profit at 50% of gross earnings.',
    priority: 'High',
    penalty: '₹1,000 to ₹5,000 delay fee; interest at 1% per month on outstanding due tax under Section 234A.',
    risks: 'Disqualification from Presumptive scheme; mandatory detailed books and balancing ledger requirements.',
    guidanceSteps: [
      'Consolidate gross professional receipts from all bank statements and domestic/international payments.',
      'Confirm total receipts do not exceed client limits under Sec 44ADA (e.g. ₹75 Lakhs).',
      'Estimate operational professional expenses (internet, sub-contractors, office utilities).',
      'Fill ITR-4 form showing presumptive block profit. File e-return and perform e-verification.'
    ],
    monthAndDay: { month: 6, day: 31 }, // July 31
    condition: (profile) => profile.userType === 'Freelancer'
  },
  
  // 3. STARTUPS & BUSINESSES (ROC, CORPORATE, GST)
  {
    name: 'GST Monthly Return (GSTR-1)',
    category: 'GST',
    description: 'Monthly return containing details of outward taxable supplies of goods and services.',
    priority: 'High',
    penalty: 'Late fee of ₹50 per day (₹20 for Nil return) of delay, capped at statutory ceilings.',
    risks: 'Inability of clients to claim Input Tax Credit (ITC), severely damaging client relations and business reputation.',
    guidanceSteps: [
      'Gather all sales invoices, debit notes, and credit bills generated during the previous calendar month.',
      'Format and reconcile invoices with state-wise GST rates.',
      'Log into the GST portal, prepare GSTR-1, upload taxable invoices under B2B and totals under B2C sections.',
      'Preview draft summary, verify correct GSTIN allocations, and submit with DSC (Digital Signature) or EVC OTP.'
    ],
    monthlyDay: 11, // Due 11th of every month
    condition: (profile) => profile.userType === 'Startup' || profile.userType === 'Business' || !!profile.businessInfo?.gstNumber
  },
  {
    name: 'GST Returns Summary (GSTR-3B) & Tax Payment',
    category: 'GST',
    description: 'Monthly self-declaration of tax liability, claimable Input Tax Credit (ITC), and final tax payment transaction.',
    priority: 'High',
    penalty: 'Late fee of ₹50/day plus interest at 18% per annum on net cash tax liabilities paid late.',
    risks: 'Blocking of GST registration number, issuance of electronic recovery warrants, restriction of outward bill generation.',
    guidanceSteps: [
      'Wait for supplier invoices to reflect in your GSTR-2B dashboard (normally by 14th).',
      'Verify eligible Input Tax Credit (ITC) available for the month.',
      'Reconcile GSTR-1 sales summary against your internal sales books and target ITC metrics.',
      'Compute net tax to pay = Outward tax liability minus eligible ITC.',
      'Deposit cash balance to electronic ledger via net-banking challan, offset liabilities, and file GSTR-3B.'
    ],
    monthlyDay: 20, // Due 20th of every month
    condition: (profile) => profile.userType === 'Startup' || profile.userType === 'Business' || !!profile.businessInfo?.gstNumber
  },
  {
    name: 'Corporate Income Tax Return (ITR-6) Filing',
    category: 'Income Tax',
    description: 'Annual statutory income tax filing for registered companies (Private Limited, Public Limited, etc.).',
    priority: 'High',
    penalty: 'Penalty up to ₹10,000 under section 234F, plus 1% monthly interest on unpaid taxes.',
    risks: 'Disallowance of business losses for carryover, penalty audits, statutory warning notices from CBDT.',
    guidanceSteps: [
      'Finalize company annual profit and loss statement alongside balance sheet.',
      'Approve accounts and hand over materials to Chartered Accountant for tax audit certification.',
      'Obtain Form 3CD Tax Audit report (due by Sept 30 usually).',
      'File detailed ITR-6 with audited figures, tax adjustments, and deferred tax calculations on the Web E-filing portal.'
    ],
    monthAndDay: { month: 9, day: 31 }, // October 31
    condition: (profile) => profile.userType === 'Startup' || profile.userType === 'Business'
  },
  {
    name: 'First Statutory Board Meeting Compliance',
    category: 'ROC Corporate',
    description: 'The first meeting of the Board of Directors of a newly incorporated company.',
    priority: 'Medium',
    penalty: 'Company penalty of ₹25,000; individual directors fined up to ₹5,000 for non-compliance.',
    risks: 'Statutory non-compliance recorded on MCA profile, negative score on company master data credit check.',
    guidanceSteps: [
      'Draft and circulate formal notice of first board meeting to all listed directors at least 7 days in advance.',
      'Hold board meeting. Appoint first statutory auditors (Form ADT-1), adopt corporate resolution for bank accounts.',
      'Draft minutes of board meeting, approve them, and secure signature in physical Board Minutes binder.'
    ],
    daysOffsetFromOnboarding: 30, // 30 days within registration/onboarding
    condition: (profile) => profile.userType === 'Startup' || profile.userType === 'Business'
  },
  {
    name: 'ROC Annual Filing: AOC-4 (Financial Statements)',
    category: 'ROC Corporate',
    description: 'Filing of approved financial statements, balance sheet, audit reports, and Director board reports with the Registrar of Companies.',
    priority: 'High',
    penalty: 'Continuous ₹100 per day of delay per corporate form (no statutory limit).',
    risks: 'Company status flagged in MCA active database as "Defaulter", directors face absolute disqualification.',
    guidanceSteps: [
      'Hold Annual General Meeting (AGM) to present audited financial books to shareholders.',
      'Collect and prepare PDFs of Auditor Report, Board Report, Balance Sheet and Notes to Accounts.',
      'Initialize AOC-4 MCA XBRL/Standard e-form software.',
      'Fill credentials, attach certified balance items, sign using digital signature (DSC) of 2 directors & CA, and submit on MCA21 portal.'
    ],
    monthAndDay: { month: 9, day: 29 }, // AGM + 30 days (usually Oct 29)
    condition: (profile) => profile.userType === 'Startup' || profile.userType === 'Business'
  },
  {
    name: 'ROC Annual Filing: MGT-7 (Annual Return)',
    category: 'ROC Corporate',
    description: 'ROC filing containing company shareholder list, registers, debt, ownership structure, and legal compliance profiles.',
    priority: 'High',
    penalty: 'Accumulating ₹100 per day of delay per corporate form.',
    risks: 'De-registration threat, litigation against managing directors, blocking of future MCA system filings.',
    guidanceSteps: [
      'Prepare lists of equity and preference shareholders with respective transfers made during year.',
      'Finalize list of directors, key managerial personnel, and details of board meetings held.',
      'Download and complete MGT-7 e-form, attach shareholder register lists.',
      'Obtain Digital Signature validation and upload onto MCA portal, paying applicable statutory filing fee.'
    ],
    monthAndDay: { month: 10, day: 28 }, // AGM + 60 days (usually November 28)
    condition: (profile) => profile.userType === 'Startup' || profile.userType === 'Business'
  },
  {
    name: 'Quarterly TDS Return Submission (Form 26Q / 24Q)',
    category: 'TDS Taxes',
    description: 'Quarterly declaration of Tax Deducted at Source on general payments (contractors, professionals, interest, etc.).',
    priority: 'Medium',
    penalty: 'Late fee of ₹200 per day of delay under Section 234E, capped at the amount of TDS deducted.',
    risks: 'Client/vendor cannot claim TDS credit, causing invoices to remain unpaid, and interest charges.',
    guidanceSteps: [
      'Gather monthly bills, invoices, and payment challans showing TDS deducted for the quarter.',
      'Run verification using NSDL NVT program to check PAN authenticity.',
      'Prepare FVU return file using e-TDS return compilation tools.',
      'Upload file online via Income Tax Portal or hand over file in physical format to authorized TIN-FC service centers.'
    ],
    monthAndDay: { month: 6, day: 31 }, // July 31, Oct 31, Jan 31 etc. Let's make one in July recurring
    condition: (profile) => profile.userType === 'Startup' || profile.userType === 'Business'
  }
];

export function generateCompliancesForUser(profile: UserProfile): ComplianceTask[] {
  const tasks: ComplianceTask[] = [];
  const today = new Date();
  const currentYear = today.getFullYear();
  const regDateString = profile.businessInfo?.registrationDate || new Date().toISOString().split('T')[0];
  const regDate = new Date(regDateString);

  COMPLIANCE_TEMPLATES.forEach((temp, index) => {
    // Check if the compliance matches user profile criteria
    if (temp.condition && !temp.condition(profile)) {
      return;
    }

    let dueDate = new Date();

    // Determine due date based on strategy
    if (temp.monthlyDay) {
      // Monthly recurrence
      // Calculate closest future/past month to show dynamic deadlines
      dueDate = new Date(currentYear, today.getMonth(), temp.monthlyDay);
      if (dueDate < today) {
        // If passed this month's, let's create a "Pending/Overdue" task for this month, 
        // and let the state manager set overdue, or schedule for next month.
        // For the visual experience, we can keep it as current month's, which might be "Pending" or "Overdue"
      }
    } else if (temp.monthAndDay) {
      // Annual fixed recurrence
      dueDate = new Date(currentYear, temp.monthAndDay.month, temp.monthAndDay.day);
      // If it passed by more than 3 months, make it next year, otherwise keep it in this year to let user see "Overdue" / "Completed" tasks
      if (today.getTime() - dueDate.getTime() > 1000 * 60 * 60 * 24 * 90) {
        dueDate.setFullYear(currentYear + 1);
      }
    } else if (temp.daysOffsetFromOnboarding) {
      // Relative offset from onboarding registration
      dueDate = new Date(regDate.getTime() + temp.daysOffsetFromOnboarding * 24 * 60 * 60 * 1000);
    }

    // Determine Status
    let status: ComplianceStatus = 'Pending';
    if (dueDate < today) {
      status = 'Overdue';
    }

    // Format fields
    const formattedTask: ComplianceTask = {
      id: `task_${index + 1}_${dueDate.toISOString().split('T')[0]}`,
      name: temp.name,
      category: temp.category,
      description: temp.description,
      dueDate: dueDate.toISOString().split('T')[0],
      status,
      priority: temp.priority,
      penalty: temp.penalty,
      risks: temp.risks,
      guidanceSteps: temp.guidanceSteps
    };

    tasks.push(formattedTask);
  });

  // Sort tasks: Overdue first, then by closest due date
  return tasks.sort((a, b) => {
    if (a.status === 'Overdue' && b.status !== 'Overdue') return -1;
    if (a.status !== 'Overdue' && b.status === 'Overdue') return 1;
    return a.dueDate.localeCompare(b.dueDate);
  });
}
