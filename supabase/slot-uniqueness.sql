-- Prevent two active appointments on the same time slot.
-- Run once in the Supabase SQL Editor (safe to re-run — uses IF NOT EXISTS).

CREATE UNIQUE INDEX IF NOT EXISTS idx_appointments_active_slot
  ON appointments (slot_id)
  WHERE status NOT IN ('cancelled');
