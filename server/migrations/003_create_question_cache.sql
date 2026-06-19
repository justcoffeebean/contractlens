-- Create question cache table to avoid repeated LLM calls
CREATE TABLE IF NOT EXISTS question_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_id UUID NOT NULL REFERENCES contract_analyses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(contract_id, question)
);

-- Create index on contract_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_question_cache_contract_id ON question_cache(contract_id);

-- Create index on created_at for cache cleanup
CREATE INDEX IF NOT EXISTS idx_question_cache_created_at ON question_cache(created_at);
