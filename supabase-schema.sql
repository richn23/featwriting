-- ============================================
-- FEAT Writing Test — Supabase Schema
-- Run this in the Supabase SQL Editor
-- ============================================

-- 1. TEST RESULTS
-- Stores one row per completed task diagnosis
create table test_results (
  id            uuid default gen_random_uuid() primary key,
  created_at    timestamptz default now(),
  candidate_name text,
  task          text not null,            -- e.g. 'task1', 'task2'
  diagnosed_level text,                   -- e.g. 'B1', 'A2_PLUS'
  score_10      integer,                  -- 0-10 task-relative score
  functional_report jsonb,                -- full macro verdict output
  form_report   jsonb,                    -- language analysis output
  transcript    text                      -- full conversation text
);

-- 2. PROMPTS
-- Stores editable prompt templates per task
create table prompts (
  id            uuid default gen_random_uuid() primary key,
  task          text not null,            -- e.g. 'task1', 'task2'
  prompt_type   text not null,            -- e.g. 'conversation', 'diagnosis', 'language_analysis'
  content       text not null,            -- the actual prompt text
  updated_at    timestamptz default now()
);

-- 3. DESCRIPTORS
-- Stores macro-level descriptors per task and CEFR level
create table descriptors (
  id            uuid default gen_random_uuid() primary key,
  task          text not null,            -- e.g. 'task1', 'task2'
  level         text not null,            -- e.g. 'A1', 'B1_PLUS'
  macro_id      text not null,            -- e.g. 'W-B1-01'
  macro_text    text not null,            -- the descriptor claim text
  threshold     integer,                  -- number of macros needed to confirm this level
  updated_at    timestamptz default now()
);

-- ============================================
-- Row-Level Security (RLS)
-- Keeps tables open for now via service_role key.
-- You can lock these down later when you add auth.
-- ============================================

alter table test_results  enable row level security;
alter table prompts        enable row level security;
alter table descriptors    enable row level security;

-- Allow full access via the service_role key (used server-side in API routes)
create policy "Service role full access" on test_results  for all using (true) with check (true);
create policy "Service role full access" on prompts        for all using (true) with check (true);
create policy "Service role full access" on descriptors    for all using (true) with check (true);
