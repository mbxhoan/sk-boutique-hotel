-- Add guest_language and chat_intent columns to chat_conversations
-- guest_language: language the guest selected at the start of chat ('vi' | 'en')
-- chat_intent: the first topic the guest selected ('booking' | 'pricing' | 'checkin_checkout' | 'other')

ALTER TABLE chat_conversations
  ADD COLUMN IF NOT EXISTS guest_language TEXT DEFAULT 'vi' CHECK (guest_language IN ('vi', 'en')),
  ADD COLUMN IF NOT EXISTS chat_intent TEXT CHECK (chat_intent IN ('booking', 'pricing', 'checkin_checkout', 'other'));
