

## Plan: Age-Appropriate Profile Options + Admin Management

### Problem
The "Current Stage" and "Income Source" options on the Profile Screen are hardcoded and identical for all ages. A 60-year-old shouldn't see "In school (Class 11/12)" and a teenager shouldn't see "Running a business."

### Solution

#### 1. New Database Table: `profile_options`

Create a table to store admin-manageable, age-specific profile options:

```sql
CREATE TABLE public.profile_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,           -- 'status' or 'income'
  label text NOT NULL,          -- display text with emoji
  value text NOT NULL,          -- internal value
  age_groups text[] NOT NULL DEFAULT ARRAY['18-25','26-39','40-59','60+'],
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
```

RLS: Anyone can read, admins can insert/update/delete (same pattern as `questions`).

#### 2. Seed Age-Appropriate Options

**Status options by age group:**
- **18-25**: In school, In college, Doing a course, Working part-time, Freelancing/gig work
- **26-39**: Salaried professional, Self-employed/freelancer, Running a business, Between jobs, Homemaker
- **40-59**: Senior professional/manager, Business owner, Self-employed, Retired early, Homemaker
- **60+**: Retired with pension, Retired without pension, Still working part-time, Running a small business, Homemaker

**Income options by age group:**
- **18-25**: Fully dependent on parents, Pocket money, Freelance/gig income, Part-time salary, Scholarship/stipend
- **26-39**: Single salary, Dual income household, Business income, Freelance income, Mixed sources
- **40-59**: Salary + investments, Business profits, Rental + salary, Retirement savings drawdown, Single income
- **60+**: Pension income, Family support, Rental/interest income, Part-time work income, Savings/FD interest

#### 3. Update `ProfileScreen.tsx`
- Fetch options from `profile_options` table filtered by player's age group
- Fall back to current hardcoded options if DB fetch fails
- Pass age from step 0 to filter options in steps 1 and 2

#### 4. Add Admin Section in `Questions.tsx`
- Add a new section (or separate tab group) at the top/bottom of the Questions page titled "Profile Options"
- Two sub-sections: "Status Options" and "Income Options"
- Same age-group tab pattern as questions
- CRUD operations: add, edit, toggle active, delete, reorder

### Files Modified
- **Database**: Create `profile_options` table + RLS + seed 40 options (20 status + 20 income, 5 per age group each)
- `src/components/game/ProfileScreen.tsx` — fetch options from DB, filter by age
- `src/pages/admin/Questions.tsx` — add "Profile Options" management section with same tab-based UI

