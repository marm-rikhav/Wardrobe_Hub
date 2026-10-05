# Wardrobe Hub - Client E2E Testing & Reporting Guide

This guide contains all execution and HTML reporting commands for the Selenium E2E automated test suites in the `client` directory.

---

## 📋 Prerequisites

Before running the tests, ensure both the backend server and frontend client are actively running:

1. **Backend Server:** `http://localhost:5000`
2. **Frontend Client:** `http://localhost:3000`
3. **Test Account:**
   - **Email:** `test@gmail.com`
   - **Password:** `test@123`

> **Note:** All commands must be executed from the `client/` directory:
> ```powershell
> cd C:\Users\Dell\Desktop\Marm\Wardrobe_Hub\client
> ```

---

## 🚀 1. Standard Test Execution Commands (CLI)

Run any individual test suite in your terminal:

### 1. User Registration & Validation
Validates email typos, dummy sequence blocks, weak passwords, and duplicate account errors.
```powershell
npx mocha "src/test/specs/auth-register.test.js" --timeout 60000
```

### 2. User Login & Validation
Validates invalid login attempts, empty credentials, and successful session redirect.
```powershell
npx mocha "src/test/specs/auth-login.test.js" --timeout 60000
```

### 3. Left Sidebar Filters & Sorting (Authenticated)
Tests category/subcategory chips, size chips, color chips, price range inputs, sorting (low-high / high-low), and filter reset.
```powershell
npx mocha "src/test/specs/products-filters.test.js" --timeout 90000
```

### 4. Product Detail Page & Variant Selection
Tests color and size variant switching, stock availability checks, adding variant to cart, and direct "Buy Now" flow.
```powershell
npx mocha "src/test/specs/product-detail.test.js" --timeout 90000
```

### 5. Profile & Address Book Management
Tests personal profile updates (name/phone), adding a new shipping address, form validation, and address cleanup/deletion.
```powershell
npx mocha "src/test/specs/profile-addresses.test.js" --timeout 90000
```

### 6. Full User Shopping & Checkout Journey
Tests full cycle: Search watch -> Add to cart -> Adjust quantity (3 -> 2) -> Address validation & COD checkout -> Direct Buy Now -> Cancel order -> Clean logout.
```powershell
npx mocha "src/test/specs/user-journey.test.js" --timeout 90000
```

### 7. Product Return / Exchange Flow
Tests opening a delivered watch order, submitting a return request with "Damaged product" reason and detailed description.
```powershell
npx mocha "src/test/specs/return-exchange.test.js" --timeout 60000
```

### 8. Footer Links Navigation (Guest vs. Authenticated)
Tests all footer links (Men, Women, Kids, All Collections, Sign In, Create Account) and protected route interception for Guest and Logged-in states.
```powershell
npx mocha "src/test/specs/footer-links.test.js" --timeout 60000
```

### 9. Run All Test Suites Sequentially
```powershell
npx mocha "src/test/specs/**/*.test.js" --timeout 90000
```

---

## 📊 2. HTML Test Report Commands (Mochawesome)

Generate standalone, visual HTML dashboards with charts, timing benchmarks, and step-by-step results.

### Generate Report for a Specific Test:

#### • Product Filters Report
```powershell
npm run test:report -- "src/test/specs/products-filters.test.js" --reporter-options reportDir=mochawesome-report,reportFilename=filters-report
```

#### • Product Detail & Variants Report
```powershell
npm run test:report -- "src/test/specs/product-detail.test.js" --reporter-options reportDir=mochawesome-report,reportFilename=product-detail-report
```

#### • Profile & Address Book Report
```powershell
npm run test:report -- "src/test/specs/profile-addresses.test.js" --reporter-options reportDir=mochawesome-report,reportFilename=profile-address-report
```

#### • Full User Journey Report
```powershell
npm run test:report -- "src/test/specs/user-journey.test.js" --reporter-options reportDir=mochawesome-report,reportFilename=user-journey-report
```

#### • Return & Exchange Report
```powershell
npm run test:report -- "src/test/specs/return-exchange.test.js" --reporter-options reportDir=mochawesome-report,reportFilename=return-exchange-report
```

#### • Footer Links Report
```powershell
npm run test:report -- "src/test/specs/footer-links.test.js" --reporter-options reportDir=mochawesome-report,reportFilename=footer-links-report
```

#### • Auth (Login & Register) Report
```powershell
npm run test:report -- "src/test/specs/auth-*.test.js" --reporter-options reportDir=mochawesome-report,reportFilename=auth-report
```

---

### Generate Complete Full-Suite Report:
```powershell
npm run test:report -- "src/test/specs/**/*.test.js" --reporter-options reportDir=mochawesome-report,reportFilename=full-test-suite-report
```

---

## 🌐 3. How to Open & View Reports in Browser

Once any report command finishes, open the generated HTML file in Google Chrome or your default browser:

### Windows PowerShell / CMD:
```powershell
start mochawesome-report\test-report.html
```

Or for named reports:
```powershell
start mochawesome-report\filters-report.html
start mochawesome-report\user-journey-report.html
start mochawesome-report\product-detail-report.html
start mochawesome-report\full-test-suite-report.html
```
