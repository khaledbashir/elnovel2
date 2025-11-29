-- Create initial tables for the Workbench
-- Migration: 001_create_initial_tables.sql

-- Workspaces (folders)
CREATE TABLE IF NOT EXISTS workspaces (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Documents
CREATE TABLE IF NOT EXISTS documents (
  id VARCHAR(255) PRIMARY KEY,
  workspace_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  tambo_thread_id VARCHAR(255), -- Links to Tambo thread
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Document Content (Novel editor content)
CREATE TABLE IF NOT EXISTS document_content (
  document_id VARCHAR(255) PRIMARY KEY,
  content_json JSON NOT NULL, -- TipTap/Novel JSON format
  content_markdown TEXT, -- Optional: markdown backup
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);