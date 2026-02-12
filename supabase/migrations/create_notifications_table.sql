-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(30) DEFAULT 'info', -- 'info', 'warning', 'gym_deactivated', 'gym_activated'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
CREATE INDEX idx_notifications_gym ON notifications(gym_id);

-- RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications"
    ON notifications FOR SELECT
    USING (
        user_id = (SELECT id FROM users WHERE clerk_id = current_setting('request.jwt.claims', true)::json->>'sub')
        OR get_current_user_role() IN ('superuser', 'admin')
    );

CREATE POLICY "Superusers and admins can manage notifications"
    ON notifications FOR ALL
    USING (get_current_user_role() IN ('superuser', 'admin'));
