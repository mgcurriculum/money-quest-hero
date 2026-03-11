

### Task: Insert 18 Questions for Profile A4_SELF

This is a data insertion task — no schema or code changes needed. I'll use the database insert tool to add all 18 questions to the `questions` table with `profile_code = 'A4_SELF'`, scores 10-50 for options 1-5, and the dimensions/categories as provided.

**Data to insert** (all rows: `is_active = true`, scores = 10/20/30/40/50):

| Q# | Dimension | Category | Question (truncated) |
|----|-----------|----------|---------------------|
| 1-3 | Earning | Work Continuity, Experience Sharing, Flexible Income |
| 4-6 | Spending | Lifestyle Adjustment, Family Support, Medical Costs |
| 7-9 | Saving | Accumulated Savings, Financial Awareness, Emergency Preparedness |
| 10-12 | Borrowing | Late-Life Borrowing, Helping Others Borrow, Instant Loan Offers |
| 13-15 | Investing | Retirement Investments, Stock Market Advice, Income Diversification |
| 16-18 | Protecting | Fraud Awareness, Insurance Planning, Digital Financial Safety |

**Approach:** Single SQL INSERT with 18 rows into `questions` table. No migration needed — this is data, not schema.

