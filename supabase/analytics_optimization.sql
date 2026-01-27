-- =================================================================
-- PERFORMANCE OPTIMIZATION: ANALYTICS ENGINE
-- Run this in Supabase SQL Editor
-- =================================================================

-- 1. Create Indexes for High-Speed Filtering
CREATE INDEX IF NOT EXISTS idx_financial_gym_type ON financial_transactions(gym_id, type);
CREATE INDEX IF NOT EXISTS idx_financial_date ON financial_transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_salary ON user_profiles(salary) WHERE salary IS NOT NULL;

-- 2. Create a Database Function to Calculate Stats Instantly
-- This prevents fetching thousands of rows to the frontend
CREATE OR REPLACE FUNCTION get_gym_analytics(p_gym_id UUID)
RETURNS JSON AS $$
DECLARE
    v_revenue DECIMAL(12,2);
    v_expenses DECIMAL(12,2);
    v_payroll DECIMAL(12,2);
    v_net_profit DECIMAL(12,2);
BEGIN
    -- Calculate Revenue (Fast Sum)
    SELECT COALESCE(SUM(amount), 0) INTO v_revenue
    FROM financial_transactions
    WHERE gym_id = p_gym_id AND type = 'revenue';

    -- Calculate Expenses (Fast Sum)
    SELECT COALESCE(SUM(amount), 0) INTO v_expenses
    FROM financial_transactions
    WHERE gym_id = p_gym_id AND type = 'expense';

    -- Calculate Committed Monthly Payroll (Active Trainers)
    SELECT COALESCE(SUM(p.salary), 0) INTO v_payroll
    FROM user_profiles p
    JOIN users u ON u.id = p.user_id
    WHERE u.gym_id = p_gym_id AND u.is_active = true AND p.salary IS NOT NULL;

    -- Calculate Net Profit (Revenue - (Expenses + Payroll))
    -- Note: Payroll is a monthly liability, simplified here for 'Run Rate'
    v_net_profit := v_revenue - (v_expenses + v_payroll);

    RETURN json_build_object(
        'revenue', v_revenue,
        'expenses', v_expenses,
        'payroll', v_payroll,
        'profit', v_net_profit
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Optimization for Recent Transactions (avoid over-fetching)
-- We don't need a function for this, standard LIMIT 5 is fine if indexed.
