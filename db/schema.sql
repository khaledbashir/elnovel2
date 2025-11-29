-- SOW Workbench Database Schema

-- Workspaces (Client Folders)
CREATE TABLE IF NOT EXISTS workspaces (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Documents (SOWs)
CREATE TABLE IF NOT EXISTS documents (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    workspace_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    content JSON, -- Novel editor content (JSON structure)
    tambo_thread_id VARCHAR(255), -- Linked Tambo chat thread ID
    status ENUM('draft', 'review', 'approved', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE
);

-- Pricing Data (Linked to Documents)
CREATE TABLE IF NOT EXISTS pricing_items (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    document_id VARCHAR(36) NOT NULL,
    role VARCHAR(255) NOT NULL,
    rate DECIMAL(10, 2) NOT NULL,
    hours DECIMAL(10, 2) NOT NULL,
    description TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Deliverables (Linked to Documents)
CREATE TABLE IF NOT EXISTS deliverables (
    id VARCHAR(36) PRIMARY KEY, -- UUID
    document_id VARCHAR(36) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date DATE,
    status ENUM('pending', 'completed') DEFAULT 'pending',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_documents_workspace ON documents(workspace_id);
CREATE INDEX idx_documents_thread ON documents(tambo_thread_id);
CREATE INDEX idx_pricing_document ON pricing_items(document_id);
CREATE INDEX idx_deliverables_document ON deliverables(document_id);
