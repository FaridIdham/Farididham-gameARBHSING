-- =========================================================================
-- DATABASE SCHEMA: ENGLISH TENSE CATCHER (SUPABASE / POSTGRESQL)
-- Provides persistent cloud storage and Row Level Security (RLS) for schools
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Table: student_profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nis VARCHAR(50) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    subject VARCHAR(100) DEFAULT 'Bahasa Inggris',
    semester VARCHAR(20) CHECK (semester IN ('Ganjil', 'Genap')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Table: game_evaluations
CREATE TABLE IF NOT EXISTS game_evaluations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES student_profiles(id) ON DELETE CASCADE,
    nis VARCHAR(50) NOT NULL,
    student_name VARCHAR(255) NOT NULL,
    class_name VARCHAR(50) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    mode VARCHAR(10) CHECK (mode IN ('2D', 'AR')),
    duration_seconds INT NOT NULL,
    total_answered INT NOT NULL,
    correct_count INT NOT NULL,
    incorrect_count INT NOT NULL,
    score_percentage NUMERIC(5,2) NOT NULL,
    passed BOOLEAN NOT NULL,
    is_minimum_met BOOLEAN NOT NULL,
    attempt_number INT DEFAULT 1,
    answers_json JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Table: custom_questions
CREATE TABLE IF NOT EXISTS custom_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    word VARCHAR(100) NOT NULL,
    category VARCHAR(20) CHECK (category IN ('PRESENT', 'PAST', 'FUTURE')),
    base_form VARCHAR(100) NOT NULL,
    past_form VARCHAR(100),
    future_phrase VARCHAR(100),
    example_sentence TEXT NOT NULL,
    explanation TEXT NOT NULL,
    difficulty VARCHAR(20) DEFAULT 'MEDIUM',
    created_by VARCHAR(255) DEFAULT 'teacher',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indices for rapid querying by teachers
CREATE INDEX IF NOT EXISTS idx_game_evaluations_nis ON game_evaluations(nis);
CREATE INDEX IF NOT EXISTS idx_game_evaluations_class ON game_evaluations(class_name);
CREATE INDEX IF NOT EXISTS idx_game_evaluations_passed ON game_evaluations(passed);

-- Enable Row Level Security (RLS)
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_questions ENABLE ROW LEVEL SECURITY;

-- Anonymous public submission policy for classroom sessions
CREATE POLICY "Allow public insert to student_profiles" 
ON student_profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select of own profile" 
ON student_profiles FOR SELECT USING (true);

CREATE POLICY "Allow public insert to game_evaluations" 
ON game_evaluations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select of game_evaluations" 
ON game_evaluations FOR SELECT USING (true);

CREATE POLICY "Allow read custom questions" 
ON custom_questions FOR SELECT USING (true);
