-- Add new columns to contract_analyses table for document management
ALTER TABLE contract_analyses 
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS folder TEXT,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Create share_links table for sharing functionality
CREATE TABLE IF NOT EXISTS share_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES contract_analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  share_token TEXT NOT NULL UNIQUE,
  password_hash TEXT,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accessed_at TIMESTAMP WITH TIME ZONE,
  access_count INTEGER DEFAULT 0
);

-- Create index on share_token for faster lookups
CREATE INDEX IF NOT EXISTS idx_share_links_token ON share_links(share_token);

-- Create index on analysis_id for faster queries
CREATE INDEX IF NOT EXISTS idx_share_links_analysis ON share_links(analysis_id);

-- Create comments table for collaboration
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  analysis_id UUID NOT NULL REFERENCES contract_analyses(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  clause_title TEXT,
  comment_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on analysis_id for comments
CREATE INDEX IF NOT EXISTS idx_comments_analysis ON comments(analysis_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL, -- 'renewal', 'expiration', 'share', 'comment'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  analysis_id UUID REFERENCES contract_analyses(id) ON DELETE CASCADE,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);

-- Create index on is_read for notifications
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- Create audit_logs table for compliance
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'view', 'export', 'share', 'delete', 'update'
  analysis_id UUID REFERENCES contract_analyses(id) ON DELETE SET NULL,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);

-- Create index on analysis_id for audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_analysis ON audit_logs(analysis_id);

-- Create webhooks table for integrations
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL, -- ['analysis.complete', 'contract.uploaded', 'risk.high']
  secret TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_triggered_at TIMESTAMP WITH TIME ZONE
);

-- Create index on user_id for webhooks
CREATE INDEX IF NOT EXISTS idx_webhooks_user ON webhooks(user_id);

-- Create contract_templates table
CREATE TABLE IF NOT EXISTS contract_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  template_type TEXT NOT NULL, -- 'nda', 'service_agreement', 'employment'
  content TEXT NOT NULL,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for templates
CREATE INDEX IF NOT EXISTS idx_templates_user ON contract_templates(user_id);

-- Enable Row Level Security
ALTER TABLE share_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_templates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for share_links
CREATE POLICY "Users can view their own share links" ON share_links
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own share links" ON share_links
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete their own share links" ON share_links
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for comments
CREATE POLICY "Users can view comments on their analyses" ON comments
  FOR SELECT USING (
    analysis_id IN (
      SELECT id FROM contract_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments on their analyses" ON comments
  FOR INSERT WITH CHECK (
    analysis_id IN (
      SELECT id FROM contract_analyses WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own comments" ON comments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own comments" ON comments
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid());

-- RLS Policies for audit_logs
CREATE POLICY "Users can view their own audit logs" ON audit_logs
  FOR SELECT USING (user_id = auth.uid());

-- RLS Policies for webhooks
CREATE POLICY "Users can view their own webhooks" ON webhooks
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own webhooks" ON webhooks
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own webhooks" ON webhooks
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own webhooks" ON webhooks
  FOR DELETE USING (user_id = auth.uid());

-- RLS Policies for contract_templates
CREATE POLICY "Users can view their own templates" ON contract_templates
  FOR SELECT USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can create their own templates" ON contract_templates
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own templates" ON contract_templates
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own templates" ON contract_templates
  FOR DELETE USING (user_id = auth.uid());
