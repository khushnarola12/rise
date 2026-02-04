-- =====================================================
-- GYM MANAGEMENT SYSTEM - DATABASE SCHEMA
-- =====================================================
-- This schema implements strict role-based access control
-- with Row Level Security (RLS) policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('superuser', 'admin', 'trainer', 'user');
CREATE TYPE meal_type AS ENUM ('breakfast', 'lunch', 'snacks', 'dinner');
CREATE TYPE diet_preference AS ENUM ('veg', 'non_veg', 'custom');
CREATE TYPE difficulty_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE day_of_week AS ENUM ('monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday');

-- =====================================================
-- TABLES
-- =====================================================

-- Gyms Table
CREATE TABLE gyms (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    logo_url TEXT,
    description TEXT,
    subscription_expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users Table (synced with Clerk)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    role user_role NOT NULL DEFAULT 'user',
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT valid_role CHECK (role IN ('superuser', 'admin', 'trainer', 'user'))
);

-- User Profile & Health Data
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(20),
    height_cm DECIMAL(5,2),
    current_weight_kg DECIMAL(5,2),
    target_weight_kg DECIMAL(5,2),
    bmi DECIMAL(5,2),
    fitness_goal TEXT,
    medical_conditions TEXT,
    emergency_contact VARCHAR(20),
    salary DECIMAL(10,2), -- Monthly salary for trainers/staff
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trainer-User Assignment
CREATE TABLE trainer_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trainer_id UUID REFERENCES users(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(trainer_id, user_id)
);

-- Diet Plans
CREATE TABLE diet_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    diet_preference diet_preference DEFAULT 'custom',
    total_calories INT,
    is_template BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Diet Plan Meals
CREATE TABLE diet_plan_meals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    diet_plan_id UUID REFERENCES diet_plans(id) ON DELETE CASCADE,
    meal_type meal_type NOT NULL,
    meal_name VARCHAR(255) NOT NULL,
    description TEXT,
    calories INT,
    protein_g DECIMAL(5,2),
    carbs_g DECIMAL(5,2),
    fats_g DECIMAL(5,2),
    meal_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Diet Assignments
CREATE TABLE user_diet_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    diet_plan_id UUID REFERENCES diet_plans(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT
);

-- Workout Plans
CREATE TABLE workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users(id),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    difficulty difficulty_level DEFAULT 'beginner',
    duration_weeks INT,
    is_template BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout Plan Exercises
CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
    day day_of_week NOT NULL,
    exercise_name VARCHAR(255) NOT NULL,
    description TEXT,
    sets INT,
    reps INT,
    rest_seconds INT,
    exercise_order INT DEFAULT 0,
    video_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Workout Assignments
CREATE TABLE user_workout_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    workout_plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES users(id),
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    notes TEXT
);

-- Attendance
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    check_in_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    check_out_time TIMESTAMP WITH TIME ZONE,
    marked_by UUID REFERENCES users(id),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Progress Tracking
CREATE TABLE progress_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    weight_kg DECIMAL(5,2),
    bmi DECIMAL(5,2),
    body_fat_percentage DECIMAL(5,2),
    muscle_mass_kg DECIMAL(5,2),
    notes TEXT,
    logged_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    logged_by UUID REFERENCES users(id)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_users_clerk_id ON users(clerk_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_gym_id ON users(gym_id);
CREATE INDEX idx_trainer_assignments_trainer ON trainer_assignments(trainer_id);
CREATE INDEX idx_trainer_assignments_user ON trainer_assignments(user_id);
CREATE INDEX idx_attendance_user_date ON attendance(user_id, date);
CREATE INDEX idx_attendance_gym_date ON attendance(gym_id, date);
CREATE INDEX idx_progress_logs_user ON progress_logs(user_id);

-- =====================================================
-- BUSINESS & FINANCE (NEW)
-- =====================================================

-- Membership Tiers (e.g., Gold, Silver, monthly/yearly)
CREATE TABLE membership_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    duration_days INT NOT NULL, -- 30 for monthly, 365 for yearly
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Active User Memberships
CREATE TABLE user_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID REFERENCES membership_plans(id),
    start_date DATE DEFAULT CURRENT_DATE,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'active', -- active, expired, cancelled
    amount_paid DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Financial Ledger (Revenue & Expenses)
CREATE TABLE financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL, -- 'revenue' (income) or 'expense' (salary/bills)
    category VARCHAR(50) NOT NULL, -- 'membership', 'trainer_salary', 'equipment', 'maintenance'
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    related_user_id UUID REFERENCES users(id), -- Member paying or Trainer getting paid
    transaction_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Announcements (Gym-wide notifications)
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info', -- 'info', 'warning', 'success', 'important'
    created_by UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    starts_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ends_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for announcements
CREATE INDEX idx_announcements_gym_active ON announcements(gym_id, is_active, starts_at);

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE diet_plan_meals ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_diet_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user's role
CREATE OR REPLACE FUNCTION get_current_user_role()
RETURNS user_role AS $$
DECLARE
    user_role_val user_role;
BEGIN
    SELECT role INTO user_role_val
    FROM users
    WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub';
    RETURN user_role_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's gym_id
CREATE OR REPLACE FUNCTION get_current_user_gym_id()
RETURNS UUID AS $$
DECLARE
    gym_id_val UUID;
BEGIN
    SELECT gym_id INTO gym_id_val
    FROM users
    WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub';
    RETURN gym_id_val;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- GYMS POLICIES
CREATE POLICY "Superusers can do everything on gyms"
    ON gyms FOR ALL
    USING (get_current_user_role() = 'superuser');

CREATE POLICY "Admins can view their gym"
    ON gyms FOR SELECT
    USING (get_current_user_role() IN ('admin', 'trainer', 'user') AND id = get_current_user_gym_id());

-- USERS POLICIES
CREATE POLICY "Superusers can do everything on users"
    ON users FOR ALL
    USING (get_current_user_role() = 'superuser');

CREATE POLICY "Admins can manage users in their gym"
    ON users FOR ALL
    USING (
        get_current_user_role() = 'admin' 
        AND gym_id = get_current_user_gym_id()
        AND role != 'superuser'
    );

CREATE POLICY "Trainers can view assigned users"
    ON users FOR SELECT
    USING (
        get_current_user_role() = 'trainer'
        AND (
            id IN (
                SELECT user_id FROM trainer_assignments 
                WHERE trainer_id = (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub')
            )
            OR id = (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub')
        )
    );

CREATE POLICY "Users can view their own profile"
    ON users FOR SELECT
    USING (clerk_id = current_setting('request.jwt.claims', true)::json->>'sub');

-- ATTENDANCE POLICIES
CREATE POLICY "Superusers and admins can manage attendance"
    ON attendance FOR ALL
    USING (get_current_user_role() IN ('superuser', 'admin'));

CREATE POLICY "Trainers can mark attendance for assigned users"
    ON attendance FOR INSERT
    WITH CHECK (
        get_current_user_role() = 'trainer'
        AND user_id IN (
            SELECT user_id FROM trainer_assignments 
            WHERE trainer_id = (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub')
        )
    );

CREATE POLICY "Users can view their own attendance"
    ON attendance FOR SELECT
    USING (
        user_id = (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub')
    );

-- DIET PLANS POLICIES
CREATE POLICY "Superusers and admins can manage diet plans"
    ON diet_plans FOR ALL
    USING (get_current_user_role() IN ('superuser', 'admin'));

CREATE POLICY "Trainers can create and view diet plans"
    ON diet_plans FOR ALL
    USING (get_current_user_role() = 'trainer' AND gym_id = get_current_user_gym_id());

-- WORKOUT PLANS POLICIES
CREATE POLICY "Superusers and admins can manage workout plans"
    ON workout_plans FOR ALL
    USING (get_current_user_role() IN ('superuser', 'admin'));

CREATE POLICY "Trainers can create and view workout plans"
    ON workout_plans FOR ALL
    USING (get_current_user_role() = 'trainer' AND gym_id = get_current_user_gym_id());

-- MEMBERSHIP & FINANCE POLICIES
ALTER TABLE membership_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage membership plans"
    ON membership_plans FOR ALL
    USING (get_current_user_role() IN ('superuser', 'admin'));

CREATE POLICY "Everyone can view membership plans"
    ON membership_plans FOR SELECT
    USING (true);

CREATE POLICY "Admins manage memberships"
    ON user_memberships FOR ALL
    USING (get_current_user_role() IN ('superuser', 'admin'));

CREATE POLICY "Users view logic for memberships"
    ON user_memberships FOR SELECT
    USING (
        user_id = (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub')
        OR get_current_user_role() IN ('superuser', 'admin', 'trainer')
    );

CREATE POLICY "Admins manage finances"
    ON financial_transactions FOR ALL
    USING (get_current_user_role() IN ('superuser', 'admin'));

-- ANNOUNCEMENTS POLICIES
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage announcements"
    ON announcements FOR ALL
    USING (get_current_user_role() IN ('superuser', 'admin'));

CREATE POLICY "Everyone in gym can view active announcements"
    ON announcements FOR SELECT
    USING (gym_id = get_current_user_gym_id() AND is_active = true);

-- =====================================================
-- FUNCTIONS & TRIGGERS
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to relevant tables
CREATE TRIGGER update_gyms_updated_at BEFORE UPDATE ON gyms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_diet_plans_updated_at BEFORE UPDATE ON diet_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workout_plans_updated_at BEFORE UPDATE ON workout_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Create default gym (will be updated by superuser)
INSERT INTO gyms (name, description) VALUES 
('Rise Fitness', 'Premium Gym Management System');

-- Note: Superuser will be created via Clerk sync on first login
