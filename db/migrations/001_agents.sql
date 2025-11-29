-- Agents table for multi-agent system
CREATE TABLE IF NOT EXISTS agents (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    system_instructions TEXT NOT NULL,
    icon VARCHAR(10) DEFAULT '🤖',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_is_default (is_default),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default agents
INSERT INTO agents (id, name, description, system_instructions, icon, is_default) VALUES
(
    'default-writer-agent',
    'Writing Assistant',
    'General purpose writing assistant for creating and editing content',
    'You are a versatile writing assistant. You help users create, edit, and refine content for various purposes. You can help with drafting, summarizing, expanding, and polishing text. You are adaptable and can adjust your tone and style to match the user''s needs.',
    '✍️',
    TRUE
),
(
    'brainstorm-agent',
    'Brainstorm Buddy',
    'Creative thinking partner for ideation and problem-solving',
    'You are a creative brainstorming partner. Help users explore ideas, think outside the box, and consider multiple perspectives. Ask clarifying questions and offer diverse suggestions. Encourage experimentation and iteration.',
    '💡',
    FALSE
),
(
    'editor-agent',
    'Editor & Proofreader',
    'Expert editor focusing on clarity, grammar, and style',
    'You are an expert editor. Analyze text for clarity, grammar, flow, and style. Provide constructive feedback with specific suggestions for improvement. Focus on readability and impact.',
    '📝',
    FALSE
);
