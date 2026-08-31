-- GermanMaster Pro: expansion from the initial 18 tables to the full 42-table platform schema.
-- Run once after src/lib/supabase/schema.sql.

create table cultural_notes(
  id bigserial primary key,
  level text not null check(level in('A1','A2','B1','B2')),
  title text not null,
  body_ar text not null,
  body_de text,
  topic text,
  source_url text,
  created_at timestamptz not null default now()
);

create table idioms(
  id bigserial primary key,
  level text not null check(level in('A1','A2','B1','B2')),
  expression text not null,
  literal_ar text,
  meaning_ar text not null,
  example_de text not null,
  example_ar text not null,
  usage_note_ar text,
  unique(expression)
);

create table collocations(
  id bigserial primary key,
  level text not null,
  phrase_de text not null,
  meaning_ar text not null,
  example_de text not null,
  example_ar text not null,
  topic text,
  unique(phrase_de)
);

create table false_friends(
  id bigserial primary key,
  german_word text not null,
  confused_with text not null,
  correct_meaning_ar text not null,
  warning_ar text not null,
  example_de text,
  example_ar text
);

create table fsrs_parameters(
  user_id uuid primary key references profiles(id) on delete cascade,
  desired_retention double precision not null default .9 check(desired_retention between .7 and .99),
  maximum_interval int not null default 36500,
  weights jsonb not null default '[]'::jsonb,
  optimized_at timestamptz,
  updated_at timestamptz not null default now()
);

create table conversation_messages(
  id bigserial primary key,
  conversation_id uuid not null references conversations(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  role text not null check(role in('system','assistant','user')),
  content text not null,
  correction jsonb,
  latency_ms int,
  created_at timestamptz not null default now()
);

create table pronunciation_scores(
  id bigserial primary key,
  attempt_id uuid not null references pronunciation_attempts(id) on delete cascade,
  user_id uuid not null references profiles(id) on delete cascade,
  phoneme text not null,
  target_ipa text,
  observed_ipa text,
  score double precision not null check(score between 0 and 100),
  feedback_ar text,
  created_at timestamptz not null default now()
);

create table exam_questions(
  id bigserial primary key,
  exam_id int not null references exams(id) on delete cascade,
  section text not null check(section in('Lesen','Hören','Schreiben','Sprechen')),
  level text not null,
  question_type text not null,
  prompt jsonb not null,
  answer_key jsonb,
  rubric jsonb,
  order_num int not null default 0
);

create table achievements(
  id bigserial primary key,
  code text not null unique,
  title_ar text not null,
  title_de text not null,
  description_ar text not null,
  icon text,
  xp_reward int not null default 0,
  criteria jsonb not null default '{}'::jsonb
);

create table user_achievements(
  id bigserial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  achievement_id bigint not null references achievements(id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  unique(user_id,achievement_id)
);

create table streaks(
  user_id uuid primary key references profiles(id) on delete cascade,
  current_count int not null default 0,
  longest_count int not null default 0,
  last_active_date date,
  freeze_tokens int not null default 0,
  updated_at timestamptz not null default now()
);

create table xp_transactions(
  id bigserial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  amount int not null,
  source text not null,
  source_id text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table notifications(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type text not null,
  title_ar text not null,
  body_ar text not null,
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table user_preferences(
  user_id uuid primary key references profiles(id) on delete cascade,
  theme text not null default 'system' check(theme in('light','dark','system')),
  audio_speed double precision not null default 1 check(audio_speed between .5 and 2),
  auto_play_audio boolean not null default true,
  show_arabic_translation boolean not null default true,
  email_notifications boolean not null default true,
  push_notifications boolean not null default false,
  leaderboard_opt_in boolean not null default false,
  accessibility jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table audio_recordings(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  purpose text not null,
  storage_path text not null,
  mime_type text,
  duration_ms int,
  transcript text,
  created_at timestamptz not null default now()
);

create table video_progress(
  id bigserial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  video_id text not null,
  watched_seconds int not null default 0,
  completed boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(user_id,video_id)
);

create table reading_progress(
  id bigserial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  reading_id int not null references reading_texts(id) on delete cascade,
  progress_percent int not null default 0 check(progress_percent between 0 and 100),
  comprehension_score int check(comprehension_score between 0 and 100),
  known_words int not null default 0,
  unknown_words int not null default 0,
  updated_at timestamptz not null default now(),
  unique(user_id,reading_id)
);

create table listening_progress(
  id bigserial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  track_id int not null references listening_tracks(id) on delete cascade,
  listens int not null default 0,
  best_score int check(best_score between 0 and 100),
  playback_speed double precision not null default 1,
  updated_at timestamptz not null default now(),
  unique(user_id,track_id)
);

create table grammar_progress(
  id bigserial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  concept_id int not null references grammar_concepts(id) on delete cascade,
  mastery_percent int not null default 0 check(mastery_percent between 0 and 100),
  correct_streak int not null default 0,
  attempts int not null default 0,
  updated_at timestamptz not null default now(),
  unique(user_id,concept_id)
);

create table vocabulary_progress(
  id bigserial primary key,
  user_id uuid not null references profiles(id) on delete cascade,
  vocabulary_id int not null references vocabulary_items(id) on delete cascade,
  known boolean not null default false,
  successful_reviews int not null default 0,
  last_seen_at timestamptz,
  updated_at timestamptz not null default now(),
  unique(user_id,vocabulary_id)
);

create table subscription_plans(
  id bigserial primary key,
  code text not null unique,
  name_ar text not null,
  price_monthly numeric(10,2) not null default 0,
  currency text not null default 'USD',
  features jsonb not null default '[]'::jsonb,
  active boolean not null default true
);

create table user_subscriptions(
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  plan_id bigint not null references subscription_plans(id),
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  status text not null default 'active',
  started_at timestamptz not null default now(),
  current_period_end timestamptz,
  cancelled_at timestamptz
);

create table admin_logs(
  id bigserial primary key,
  actor_user_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id text,
  payload jsonb not null default '{}'::jsonb,
  ip_hash text,
  created_at timestamptz not null default now()
);

create table ai_usage_logs(
  id bigserial primary key,
  user_id uuid references profiles(id) on delete cascade,
  provider text not null,
  capability text not null,
  model text,
  input_tokens int,
  output_tokens int,
  latency_ms int,
  estimated_cost_usd numeric(12,6),
  success boolean not null default true,
  error_code text,
  created_at timestamptz not null default now()
);

-- User-owned tables.
do $$ declare t text; begin
  foreach t in array array[
    'fsrs_parameters','conversation_messages','pronunciation_scores','user_achievements',
    'streaks','xp_transactions','notifications','user_preferences','audio_recordings',
    'video_progress','reading_progress','listening_progress','grammar_progress',
    'vocabulary_progress','user_subscriptions','ai_usage_logs'
  ] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy %I on %I for select to authenticated using (auth.uid() = user_id)', t||'_own_select', t);
    execute format('create policy %I on %I for insert to authenticated with check (auth.uid() = user_id)', t||'_own_insert', t);
    execute format('create policy %I on %I for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id)', t||'_own_update', t);
    execute format('create policy %I on %I for delete to authenticated using (auth.uid() = user_id)', t||'_own_delete', t);
  end loop;
end $$;

-- Read-only catalog tables.
do $$ declare t text; begin
  foreach t in array array['cultural_notes','idioms','collocations','false_friends','exam_questions','achievements','subscription_plans'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy %I on %I for select to authenticated using (true)', t||'_authenticated_read', t);
  end loop;
end $$;

alter table admin_logs enable row level security;
-- Admin logs intentionally have no client policy. Only the service-role/admin backend can access them.

create index idx_conversation_messages_conversation on conversation_messages(conversation_id,created_at);
create index idx_pronunciation_scores_attempt on pronunciation_scores(attempt_id);
create index idx_exam_questions_exam_section on exam_questions(exam_id,section,order_num);
create index idx_xp_transactions_user_time on xp_transactions(user_id,created_at desc);
create index idx_notifications_unread on notifications(user_id,read_at,created_at desc);
create index idx_audio_recordings_user_time on audio_recordings(user_id,created_at desc);
create index idx_reading_progress_user on reading_progress(user_id,updated_at desc);
create index idx_listening_progress_user on listening_progress(user_id,updated_at desc);
create index idx_grammar_progress_user on grammar_progress(user_id,mastery_percent);
create index idx_vocabulary_progress_user on vocabulary_progress(user_id,known,updated_at desc);
create index idx_ai_usage_user_time on ai_usage_logs(user_id,created_at desc);
create index idx_admin_logs_entity on admin_logs(entity_type,entity_id,created_at desc);

insert into subscription_plans(code,name_ar,price_monthly,currency,features)
values
  ('free','مجاني',0,'USD','["core_lessons","mock_ai","fsrs"]'),
  ('pro','احترافي',9.99,'USD','["voice_ai","advanced_analytics","unlimited_reviews"]')
on conflict(code) do nothing;
