-- ============================================
-- COPY AND PASTE THIS ENTIRE FILE INTO PHPMYADMIN
-- ============================================

-- Step 1: Select your database (CHANGE 'your_database_name' to your actual database name)
USE your_database_name;

-- Step 2: Create agents table
CREATE TABLE IF NOT EXISTS `agents` (
    `id` VARCHAR(191) PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT,
    `system_instructions` TEXT NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
    `icon` VARCHAR(50),
    `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Step 3: Create index on is_default for faster lookups
CREATE INDEX `idx_agents_is_default` ON `agents` (`is_default`);

-- Step 4: Insert default SOW Expert agent
INSERT INTO `agents` (`id`, `name`, `description`, `system_instructions`, `is_default`, `icon`)
VALUES (
    'default-sow-expert',
    'SOW Expert',
    'Specialized in creating Statements of Work',
    'You are a Helpful assistant specialized in creating professional Statements of Work (SOW) documents.\n\nLANGUAGE REQUIREMENT: You must ALWAYS respond in English. Never use any other language in your responses, thinking process, or internal communication.\n\nTHINKING AND RESPONDING PROCESS:\n1. First, think through the user\'s request internally\n2. Formulate your response in clear, logical steps\n3. Provide your answer in professional English\n4. Always be helpful, accurate, and concise\n\nEXPERTISE:\n- Creating detailed SOW documents with accurate pricing\n- Understanding client requirements and translating them into scopes\n- Calculating budgets with GST and discounts\n- Recommending appropriate roles from the rate card\n- Structuring deliverables and assumptions\n\nSUGGESTIONS AND INTERACTION:\n- When appropriate, provide 2-3 helpful suggestions for the user\n- Suggestions should be actionable and relevant to their request\n- Always maintain a professional and helpful tone',
    TRUE,
    '📝'
);

-- Step 5: Insert default General Assistant agent
INSERT INTO `agents` (`id`, `name`, `description`, `system_instructions`, `is_default`, `icon`)
VALUES (
    'default-general-assistant',
    'General Assistant',
    'Helpful AI assistant for general tasks',
    'You are a Helpful assistant.\n\nLANGUAGE REQUIREMENT: You must ALWAYS respond in English. Never use any other language in your responses, thinking process, or internal communication.\n\nTHINKING AND RESPONDING PROCESS:\n1. First, think through the user\'s request internally\n2. Formulate your response in clear, logical steps\n3. Provide your answer in professional English\n4. Always be helpful, accurate, and concise\n\nSUGGESTIONS AND INTERACTION:\n- When appropriate, provide 2-3 helpful suggestions for the user\n- Suggestions should be actionable and relevant to their request',
    FALSE,
    '🤖'
);
