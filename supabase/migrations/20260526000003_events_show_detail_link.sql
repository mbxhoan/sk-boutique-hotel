ALTER TABLE events
  ADD COLUMN IF NOT EXISTS show_detail_link boolean NOT NULL DEFAULT true;
