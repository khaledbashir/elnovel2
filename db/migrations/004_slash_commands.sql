CREATE TABLE IF NOT EXISTS SlashCommand (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  searchTerms TEXT,
  prompt TEXT NOT NULL,
  model VARCHAR(50) DEFAULT 'gpt-4',
  provider VARCHAR(50) DEFAULT 'openai',
  isActive BOOLEAN DEFAULT true,
  isSystem BOOLEAN DEFAULT false,
  userId VARCHAR(36),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES User(id)
);

-- Insert default system commands
INSERT INTO SlashCommand (id, title, description, icon, searchTerms, prompt, isSystem, isActive) VALUES
  ('sys-continue', 'Continue Writing', 'AI will continue from where you left off.', 'StepForward', 'continue,ai,generate', 'Continue writing from where the user left off. Maintain the same tone, style, and context.', true, true),
  ('sys-improve', 'Improve Writing', 'AI will improve the selected text.', 'RefreshCcwDot', 'improve,enhance,better,ai', 'Improve the writing quality of the following text. Make it clearer, more engaging, and more professional while maintaining the original meaning.', true, true),
  ('sys-fix', 'Fix Grammar', 'AI will fix grammar and spelling errors.', 'CheckCheck', 'fix,grammar,spell,correct,ai', 'Fix all grammar and spelling errors in the following text. Do not change the meaning or style.', true, true),
  ('sys-shorter', 'Make Shorter', 'AI will make the text more concise.', 'ArrowDownWideNarrow', 'shorter,concise,summarize,ai', 'Make the following text more concise and to the point while preserving all key information.', true, true),
  ('sys-longer', 'Make Longer', 'AI will expand the text with more details.', 'WrapText', 'longer,expand,elaborate,ai', 'Expand the following text with more details, examples, and explanations while maintaining coherence.', true, true);
