-- Track when a nudge email was last sent for a conversation.
-- Nudge = auto-email sent when admin hasn't read a guest message after N minutes.
ALTER TABLE public.chat_conversations
  ADD COLUMN IF NOT EXISTS nudge_sent_at timestamptz;

-- Helper: return conversations that need a nudge email.
-- A conversation qualifies when:
--   1. It is not closed.
--   2. At least one guest message is unread AND older than threshold_minutes.
--   3. That message is newer than the last nudge (prevents re-nudging the same messages).
CREATE OR REPLACE FUNCTION public.get_conversations_needing_nudge(threshold_minutes integer DEFAULT 5)
RETURNS TABLE (
  id              uuid,
  guest_name      text,
  guest_email     text,
  guest_phone     text,
  source_url      text,
  oldest_unread_at timestamptz,
  unread_count    bigint,
  first_unread_message text
) LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT
    c.id,
    c.guest_name,
    c.guest_email,
    c.guest_phone,
    c.source_url,
    MIN(m.created_at)                                AS oldest_unread_at,
    COUNT(m.id)                                      AS unread_count,
    (
      SELECT m2.message
      FROM   chat_messages m2
      WHERE  m2.conversation_id = c.id
        AND  m2.sender_type = 'guest'
        AND  m2.read_at     IS NULL
        AND  (c.nudge_sent_at IS NULL OR m2.created_at > c.nudge_sent_at)
      ORDER  BY m2.created_at ASC
      LIMIT  1
    )                                                AS first_unread_message
  FROM  chat_conversations c
  JOIN  chat_messages m
    ON  m.conversation_id = c.id
    AND m.sender_type     = 'guest'
    AND m.read_at         IS NULL
    AND m.created_at      < NOW() - make_interval(mins => threshold_minutes)
    AND (c.nudge_sent_at IS NULL OR m.created_at > c.nudge_sent_at)
  WHERE c.status != 'closed'
  GROUP BY c.id, c.guest_name, c.guest_email, c.guest_phone, c.source_url, c.nudge_sent_at
  HAVING COUNT(m.id) > 0;
$$;

-- ─── Supabase pg_cron setup (run once in Supabase SQL Editor) ──────────────
--
-- 1. Set your production site URL and a random secret (once per project):
--      ALTER DATABASE postgres SET app.site_url   = 'https://your-domain.com';
--      ALTER DATABASE postgres SET app.cron_secret = 'replace-with-a-random-secret';
--    Then add the same CRON_SECRET to your .env / Vercel environment variables.
--
-- 2. Enable the required extensions (already on Supabase):
--      CREATE EXTENSION IF NOT EXISTS pg_cron;
--      CREATE EXTENSION IF NOT EXISTS pg_net;
--
-- 3. Schedule the cron job (every 2 minutes):
--    SELECT cron.schedule(
--      'chat-nudge',
--      '*/2 * * * *',
--      $$
--        SELECT net.http_post(
--          url     := current_setting('app.site_url', true) || '/api/internal/chat-nudge',
--          headers := jsonb_build_object(
--            'Content-Type',  'application/json',
--            'Authorization', 'Bearer ' || current_setting('app.cron_secret', true)
--          ),
--          body    := '{}'::jsonb
--        );
--      $$
--    );
--
-- 4. To remove the job later:
--    SELECT cron.unschedule('chat-nudge');
-- ────────────────────────────────────────────────────────────────────────────
