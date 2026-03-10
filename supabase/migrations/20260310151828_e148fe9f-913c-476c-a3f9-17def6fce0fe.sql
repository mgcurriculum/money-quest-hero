
-- Delete all existing question data
DELETE FROM questions;

-- Drop old columns
ALTER TABLE questions 
  DROP COLUMN IF EXISTS level,
  DROP COLUMN IF EXISTS options,
  DROP COLUMN IF EXISTS age_groups,
  DROP COLUMN IF EXISTS sort_order,
  DROP COLUMN IF EXISTS difficulty,
  DROP COLUMN IF EXISTS branch_high,
  DROP COLUMN IF EXISTS branch_mid,
  DROP COLUMN IF EXISTS branch_low;

-- Add new columns for profile-based questions
ALTER TABLE questions
  ADD COLUMN profile_code text NOT NULL DEFAULT '',
  ADD COLUMN question_no integer NOT NULL DEFAULT 1,
  ADD COLUMN option_1 text NOT NULL DEFAULT '',
  ADD COLUMN option_2 text NOT NULL DEFAULT '',
  ADD COLUMN option_3 text NOT NULL DEFAULT '',
  ADD COLUMN option_4 text NOT NULL DEFAULT '',
  ADD COLUMN option_5 text NOT NULL DEFAULT '',
  ADD COLUMN score_1 integer NOT NULL DEFAULT 10,
  ADD COLUMN score_2 integer NOT NULL DEFAULT 20,
  ADD COLUMN score_3 integer NOT NULL DEFAULT 30,
  ADD COLUMN score_4 integer NOT NULL DEFAULT 40,
  ADD COLUMN score_5 integer NOT NULL DEFAULT 50;

-- Add profile_code to game_sessions
ALTER TABLE game_sessions
  ADD COLUMN IF NOT EXISTS profile_code text;
