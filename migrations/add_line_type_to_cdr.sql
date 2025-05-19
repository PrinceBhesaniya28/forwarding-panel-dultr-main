-- Add line type related columns to CDR table
ALTER TABLE cdr 
ADD COLUMN IF NOT EXISTS line_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS is_voip BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS fraud_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS recent_abuse BOOLEAN DEFAULT FALSE;

-- Create index for faster VOIP lookups
CREATE INDEX IF NOT EXISTS idx_cdr_is_voip ON cdr(is_voip); 