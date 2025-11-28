# Document Management Platform Transformation Roadmap

## Executive Summary
This roadmap outlines the transformation of the current SOW Workbench system into a versatile, multi-tenant document management platform capable of handling various document types and business use cases.

## Current System Analysis

### Existing Database Schema
- `workspaces`: Client folders (single-tenant)
- `documents`: SOW documents only
- `document_content`: TipTap/Novel JSON format only
- `pricing_data`: SOW-specific pricing tables

### Limitations
- Single document type support (SOW only)
- No multi-tenancy support
- Limited metadata and categorization
- No permission system
- SOW-specific data structures

## Phase 1: Foundation Enhancement (Weeks 1-2)

### 1.1 Enhanced Core Tables

#### Users & Authentication
```sql
-- Users table with multi-tenancy support
CREATE TABLE users (
  id VARCHAR(255) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  avatar_url TEXT,
  tenant_id VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'tenant_admin', 'user') DEFAULT 'user',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_tenant_email (tenant_id, email)
);

-- Tenants for multi-tenancy
CREATE TABLE tenants (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  subdomain VARCHAR(100) UNIQUE,
  logo_url TEXT,
  settings JSON,
  subscription_plan ENUM('free', 'professional', 'enterprise') DEFAULT 'free',
  max_users INT DEFAULT 5,
  max_documents INT DEFAULT 100,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Enhanced Workspaces
```sql
-- Transform workspaces to be tenant-aware and more flexible
ALTER TABLE workspaces ADD COLUMN tenant_id VARCHAR(255) NOT NULL;
ALTER TABLE workspaces ADD COLUMN description TEXT;
ALTER TABLE workspaces ADD COLUMN color VARCHAR(7) DEFAULT '#3B82F6';
ALTER TABLE workspaces ADD COLUMN icon VARCHAR(50) DEFAULT 'folder';
ALTER TABLE workspaces ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE workspaces ADD COLUMN created_by VARCHAR(255);
ALTER TABLE workspaces ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE workspaces ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE workspaces ADD INDEX idx_tenant_workspaces (tenant_id);
```

### 1.2 Document Type System

```sql
-- Document types registry
CREATE TABLE document_types (
  id VARCHAR(255) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  editor_type ENUM('tiptap', 'markdown', 'code', 'form') DEFAULT 'tiptap',
  schema JSON, -- JSON schema for document-specific metadata
  is_system BOOLEAN DEFAULT FALSE, -- System-defined vs custom types
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default document types
INSERT INTO document_types (id, name, slug, description, icon, editor_type, is_system) VALUES
('dt_sow', 'Statement of Work', 'sow', 'Legal document outlining project scope and deliverables', 'file-text', 'tiptap', TRUE),
('dt_contract', 'Contract', 'contract', 'Legal contract agreement', 'file-signature', 'tiptap', TRUE),
('dt_proposal', 'Proposal', 'proposal', 'Business proposal document', 'presentation-chart', 'tiptap', TRUE),
('dt_invoice', 'Invoice', 'invoice', 'Billing invoice document', 'currency-dollar', 'form', TRUE),
('dt_report', 'Report', 'report', 'Business or technical report', 'chart-bar', 'tiptap', TRUE),
('dt_meeting', 'Meeting Notes', 'meeting-notes', 'Meeting minutes and notes', 'users', 'tiptap', TRUE),
('dt_custom', 'Custom', 'custom', 'Custom document type', 'document', 'tiptap', FALSE);
```

#### Enhanced Documents Table
```sql
ALTER TABLE documents ADD COLUMN tenant_id VARCHAR(255) NOT NULL;
ALTER TABLE documents ADD COLUMN document_type_id VARCHAR(255) NOT NULL DEFAULT 'dt_sow';
ALTER TABLE documents ADD COLUMN status ENUM('draft', 'review', 'approved', 'archived') DEFAULT 'draft';
ALTER TABLE documents ADD COLUMN tags JSON; -- Array of tags
ALTER TABLE documents ADD COLUMN metadata JSON; -- Document-specific metadata
ALTER TABLE documents ADD COLUMN version INT DEFAULT 1;
ALTER TABLE documents ADD COLUMN parent_document_id VARCHAR(255); -- For versioning
ALTER TABLE documents ADD COLUMN created_by VARCHAR(255) NOT NULL;
ALTER TABLE documents ADD COLUMN updated_by VARCHAR(255);
ALTER TABLE documents ADD COLUMN is_template BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN is_public BOOLEAN DEFAULT FALSE;
ALTER TABLE documents ADD COLUMN view_count INT DEFAULT 0;
ALTER TABLE documents ADD COLUMN last_accessed TIMESTAMP;

-- Add foreign keys
ALTER TABLE documents ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE documents ADD FOREIGN KEY (document_type_id) REFERENCES document_types(id);
ALTER TABLE documents ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE documents ADD FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE documents ADD FOREIGN KEY (parent_document_id) REFERENCES documents(id) ON DELETE SET NULL;

-- Add indexes
ALTER TABLE documents ADD INDEX idx_tenant_docs (tenant_id);
ALTER TABLE documents ADD INDEX idx_type_docs (document_type_id);
ALTER TABLE documents ADD INDEX idx_status_docs (status);
ALTER TABLE documents ADD INDEX idx_created_by (created_by);
```

### 1.3 Enhanced Content Storage

```sql
-- Rename and enhance document_content
ALTER TABLE document_content RENAME TO document_versions;
ALTER TABLE document_versions ADD COLUMN tenant_id VARCHAR(255) NOT NULL;
ALTER TABLE document_versions ADD COLUMN version_number INT NOT NULL DEFAULT 1;
ALTER TABLE document_versions ADD COLUMN created_by VARCHAR(255);
ALTER TABLE document_versions ADD COLUMN change_summary TEXT;
ALTER TABLE document_versions ADD COLUMN is_current BOOLEAN DEFAULT TRUE;
ALTER TABLE document_versions ADD COLUMN content_hash VARCHAR(64); -- SHA-256 hash

-- Add foreign keys and indexes
ALTER TABLE document_versions ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE document_versions ADD FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL;
ALTER TABLE document_versions ADD INDEX idx_document_versions (document_id, version_number);
ALTER TABLE document_versions ADD INDEX idx_tenant_versions (tenant_id);
```

### 1.4 Permission System

```sql
-- Roles and permissions
CREATE TABLE roles (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  permissions JSON NOT NULL, -- Array of permission strings
  is_system_role BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  UNIQUE KEY unique_tenant_role (tenant_id, name)
);

-- User role assignments
CREATE TABLE user_roles (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  role_id VARCHAR(255) NOT NULL,
  workspace_id VARCHAR(255),
  granted_by VARCHAR(255),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
  FOREIGN KEY (workspace_id) REFERENCES workspaces(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_user_role_workspace (user_id, role_id, workspace_id)
);

-- Document-specific permissions
CREATE TABLE document_permissions (
  id VARCHAR(255) PRIMARY KEY,
  document_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  permission ENUM('read', 'write', 'delete', 'share', 'admin') NOT NULL,
  granted_by VARCHAR(255),
  granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_doc_user_permission (document_id, user_id, permission)
);
```

## Phase 2: Advanced Features (Weeks 3-4)

### 2.1 Audit Trail & Logging

```sql
-- Audit trail for all document operations
CREATE TABLE audit_logs (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  entity_type ENUM('document', 'workspace', 'user', 'role') NOT NULL,
  entity_id VARCHAR(255) NOT NULL,
  action ENUM('create', 'update', 'delete', 'view', 'share', 'download') NOT NULL,
  old_values JSON,
  new_values JSON,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_audit_tenant (tenant_id),
  INDEX idx_audit_entity (entity_type, entity_id),
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_created (created_at)
);

-- Document access logs
CREATE TABLE document_access_logs (
  id VARCHAR(255) PRIMARY KEY,
  document_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  access_type ENUM('view', 'edit', 'download', 'share') NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_access_document (document_id),
  INDEX idx_access_user (user_id),
  INDEX idx_access_created (created_at)
);
```

### 2.2 File Management System

```sql
-- File attachments for documents
CREATE TABLE file_attachments (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  document_id VARCHAR(255),
  filename VARCHAR(255) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100),
  file_size BIGINT NOT NULL,
  file_path VARCHAR(500) NOT NULL,
  file_hash VARCHAR(64) NOT NULL,
  uploaded_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE SET NULL,
  FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_file_tenant (tenant_id),
  INDEX idx_file_document (document_id),
  INDEX idx_file_hash (file_hash)
);

-- Document templates
CREATE TABLE document_templates (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255), -- NULL for system templates
  name VARCHAR(255) NOT NULL,
  description TEXT,
  document_type_id VARCHAR(255) NOT NULL,
  content_json JSON,
  thumbnail_url TEXT,
  category VARCHAR(100),
  tags JSON,
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INT DEFAULT 0,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (document_type_id) REFERENCES document_types(id),
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);
```

### 2.3 Collaboration Features

```sql
-- Document comments
CREATE TABLE document_comments (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  document_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  parent_comment_id VARCHAR(255), -- For threaded comments
  content TEXT NOT NULL,
  mentions JSON, -- Array of mentioned user IDs
  is_resolved BOOLEAN DEFAULT FALSE,
  resolved_by VARCHAR(255),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES document_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (resolved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_comment_document (document_id),
  INDEX idx_comment_user (user_id),
  INDEX idx_comment_parent (parent_comment_id)
);

-- Document sharing
CREATE TABLE document_shares (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  document_id VARCHAR(255) NOT NULL,
  shared_by VARCHAR(255) NOT NULL,
  share_type ENUM('public_link', 'user', 'workspace') NOT NULL,
  recipient_id VARCHAR(255), -- User or workspace ID
  permission ENUM('read', 'write', 'comment') NOT NULL,
  share_token VARCHAR(255) UNIQUE, -- For public links
  expires_at TIMESTAMP,
  password_hash VARCHAR(255), -- For protected shares
  download_limit INT,
  download_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (shared_by) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_share_document (document_id),
  INDEX idx_share_token (share_token),
  INDEX idx_share_recipient (recipient_id)
);
```

## Phase 3: Specialized Data Structures (Weeks 5-6)

### 3.1 Flexible Metadata System

```sql
-- Dynamic metadata fields for different document types
CREATE TABLE metadata_fields (
  id VARCHAR(255) PRIMARY KEY,
  document_type_id VARCHAR(255) NOT NULL,
  field_name VARCHAR(100) NOT NULL,
  field_type ENUM('text', 'number', 'date', 'boolean', 'select', 'multiselect', 'json') NOT NULL,
  field_options JSON, -- For select/multiselect types
  is_required BOOLEAN DEFAULT FALSE,
  default_value TEXT,
  validation_rules JSON,
  display_order INT DEFAULT 0,
  FOREIGN KEY (document_type_id) REFERENCES document_types(id) ON DELETE CASCADE,
  UNIQUE KEY unique_type_field (document_type_id, field_name)
);

-- Document metadata values
CREATE TABLE document_metadata_values (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  document_id VARCHAR(255) NOT NULL,
  field_id VARCHAR(255) NOT NULL,
  value_text TEXT,
  value_number DECIMAL(20, 4),
  value_date DATE,
  value_boolean BOOLEAN,
  value_json JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (field_id) REFERENCES metadata_fields(id) ON DELETE CASCADE,
  UNIQUE KEY unique_doc_field_value (document_id, field_id)
);
```

### 3.2 Specialized Document Data

```sql
-- Transform pricing_data to be more generic
ALTER TABLE pricing_data RENAME TO document_data;
ALTER TABLE document_data ADD COLUMN tenant_id VARCHAR(255) NOT NULL;
ALTER TABLE document_data ADD COLUMN data_type VARCHAR(50) NOT NULL DEFAULT 'pricing';
ALTER TABLE document_data ADD COLUMN schema_version VARCHAR(20) DEFAULT '1.0';

-- Add foreign key and index
ALTER TABLE document_data ADD FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE document_data ADD INDEX idx_data_tenant (tenant_id);
ALTER TABLE document_data ADD INDEX idx_data_type (data_type);

-- Create specialized data tables for different document types
CREATE TABLE invoice_data (
  id VARCHAR(255) PRIMARY KEY,
  document_id VARCHAR(255) NOT NULL,
  tenant_id VARCHAR(255) NOT NULL,
  invoice_number VARCHAR(100) UNIQUE NOT NULL,
  issue_date DATE NOT NULL,
  due_date DATE,
  currency VARCHAR(3) DEFAULT 'USD',
  subtotal DECIMAL(15, 2) NOT NULL,
  tax_rate DECIMAL(5, 4) DEFAULT 0,
  tax_amount DECIMAL(15, 2) DEFAULT 0,
  total_amount DECIMAL(15, 2) NOT NULL,
  status ENUM('draft', 'sent', 'paid', 'overdue', 'void') DEFAULT 'draft',
  client_name VARCHAR(255),
  client_email VARCHAR(255),
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_invoice_tenant (tenant_id),
  INDEX idx_invoice_number (invoice_number),
  INDEX idx_invoice_status (status)
);

CREATE TABLE invoice_line_items (
  id VARCHAR(255) PRIMARY KEY,
  invoice_id VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  quantity DECIMAL(10, 2) NOT NULL,
  unit_price DECIMAL(15, 2) NOT NULL,
  total_price DECIMAL(15, 2) NOT NULL,
  sort_order INT DEFAULT 0,
  FOREIGN KEY (invoice_id) REFERENCES invoice_data(id) ON DELETE CASCADE,
  INDEX idx_line_item_invoice (invoice_id)
);
```

## Phase 4: API & Configuration (Weeks 7-8)

### 4.1 API Rate Limiting & Usage Tracking

```sql
-- API usage tracking
CREATE TABLE api_usage (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  endpoint VARCHAR(255) NOT NULL,
  method ENUM('GET', 'POST', 'PUT', 'DELETE', 'PATCH') NOT NULL,
  status_code INT NOT NULL,
  response_time_ms INT,
  request_size BIGINT,
  response_size BIGINT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_usage_tenant (tenant_id),
  INDEX idx_usage_user (user_id),
  INDEX idx_usage_endpoint (endpoint),
  INDEX idx_usage_created (created_at)
);

-- Rate limiting
CREATE TABLE rate_limits (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255),
  window_type ENUM('minute', 'hour', 'day') NOT NULL,
  request_count INT NOT NULL,
  window_start TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_rate_limit (tenant_id, user_id, window_type, window_start),
  INDEX idx_rate_limit_window (window_start)
);
```

### 4.2 Configuration Management

```sql
-- System configuration
CREATE TABLE system_config (
  id VARCHAR(255) PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value TEXT,
  description TEXT,
  data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  is_public BOOLEAN DEFAULT FALSE, -- Whether to expose to frontend
  updated_by VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Tenant-specific configuration
CREATE TABLE tenant_config (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255) NOT NULL,
  config_key VARCHAR(255) NOT NULL,
  config_value TEXT,
  data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
  is_overridden BOOLEAN DEFAULT FALSE, -- Whether tenant can override system default
  updated_by VARCHAR(255),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE KEY unique_tenant_config (tenant_id, config_key)
);
```

## Phase 5: Performance & Scalability (Weeks 9-10)

### 5.1 Caching & Performance Optimization

```sql
-- Document view cache
CREATE TABLE document_view_cache (
  id VARCHAR(255) PRIMARY KEY,
  document_id VARCHAR(255) NOT NULL,
  user_id VARCHAR(255) NOT NULL,
  rendered_html LONGTEXT,
  thumbnail_data LONGBLOB,
  cache_version INT DEFAULT 1,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_doc_user_cache (document_id, user_id),
  INDEX idx_cache_expires (expires_at)
);

-- Search index for full-text search
CREATE TABLE document_search_index (
  id VARCHAR(255) PRIMARY KEY,
  document_id VARCHAR(255) NOT NULL,
  content_text LONGTEXT,
  title VARCHAR(500),
  tags TEXT,
  metadata_text TEXT,
  tenant_id VARCHAR(255) NOT NULL,
  indexed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  FULLTEXT KEY idx_search_content (content_text, title, tags, metadata_text),
  INDEX idx_search_tenant (tenant_id),
  INDEX idx_search_indexed (indexed_at)
);
```

### 5.2 Background Jobs & Processing

```sql
-- Background job queue
CREATE TABLE background_jobs (
  id VARCHAR(255) PRIMARY KEY,
  tenant_id VARCHAR(255),
  job_type VARCHAR(100) NOT NULL,
  job_data JSON,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  priority INT DEFAULT 0,
  attempts INT DEFAULT 0,
  max_attempts INT DEFAULT 3,
  error_message TEXT,
  scheduled_at TIMESTAMP,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
  INDEX idx_job_status (status),
  INDEX idx_job_type (job_type),
  INDEX idx_job_scheduled (scheduled_at),
  INDEX idx_job_priority (priority DESC, created_at)
);

-- Document processing status
CREATE TABLE document_processing (
  id VARCHAR(255) PRIMARY KEY,
  document_id VARCHAR(255) NOT NULL,
  processing_type ENUM('thumbnail', 'pdf_export', 'indexing', 'ocr') NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  progress INT DEFAULT 0,
  result_data JSON,
  error_message TEXT,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
  UNIQUE KEY unique_doc_processing (document_id, processing_type),
  INDEX idx_processing_status (status)
);
```

## Environment Variable Updates

### New Environment Variables
```bash
# Multi-tenancy
MULTI_TENANT_ENABLED=true
DEFAULT_TENANT_ID=default
TENANT_SUBDOMAIN_ENABLED=true

# Performance & Caching
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
ENABLE_DOCUMENT_CACHE=true

# Search & Indexing
ELASTICSEARCH_URL=http://localhost:9200
ENABLE_FULLTEXT_SEARCH=true
SEARCH_INDEX_NAME=documents

# File Storage
STORAGE_TYPE=local # local, s3, gcs
STORAGE_PATH=/app/uploads
AWS_S3_BUCKET=
AWS_S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Security & Rate Limiting
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REQUESTS_PER_MINUTE=60
RATE_LIMIT_REQUESTS_PER_HOUR=1000
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Email & Notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@yourapp.com

# Background Processing
QUEUE_DRIVER=database # database, redis, sqs
MAX_CONCURRENT_JOBS=10
JOB_RETRY_DELAY=30

# Analytics & Monitoring
ENABLE_ANALYTICS=true
ANALYTICS_RETENTION_DAYS=90
PERFORMANCE_MONITORING_ENABLED=true
```

## Implementation Sequence

### Week 1-2: Foundation
1. Set up multi-tenancy infrastructure
2. Implement user authentication and authorization
3. Migrate existing data to new schema
4. Update API endpoints for tenant isolation
5. Implement basic permission system

### Week 3-4: Core Features
1. Implement audit logging system
2. Add file attachment capabilities
3. Create document templates system
4. Implement collaboration features (comments, sharing)
5. Add document versioning

### Week 5-6: Document Types
1. Implement flexible metadata system
2. Create specialized document handlers
3. Add document type management UI
4. Implement custom document types
5. Create document templates for each type

### Week 7-8: API & Configuration
1. Implement rate limiting
2. Add API usage tracking
3. Create configuration management system
4. Implement tenant-specific settings
5. Add API documentation

### Week 9-10: Performance
1. Implement caching layer
2. Add full-text search capabilities
3. Optimize database queries
4. Implement background job processing
5. Add performance monitoring

## Migration Strategy

### Data Migration Steps
1. **Create default tenant** for existing data
2. **Migrate workspaces** with tenant association
3. **Create admin user** for existing system
4. **Migrate documents** with new type system
5. **Migrate content** to versioning system
6. **Migrate pricing data** to generic document data
7. **Set up permissions** for migrated users
8. **Validate data integrity**

### Rollback Plan
1. **Database backups** before each phase
2. **Feature flags** for gradual rollout
3. **Migration scripts** with rollback capability
4. **Monitoring** for data consistency
5. **User communication** plan for changes

## API Design Considerations

### RESTful API Structure
```
/api/v1/tenants/{tenant_id}/workspaces
/api/v1/tenants/{tenant_id}/documents
/api/v1/tenants/{tenant_id}/documents/{id}/versions
/api/v1/tenants/{tenant_id}/documents/{id}/comments
/api/v1/tenants/{tenant_id}/templates
/api/v1/tenants/{tenant_id}/users
/api/v1/tenants/{tenant_id}/roles
```

### Authentication & Authorization
- JWT-based authentication
- Tenant-scoped tokens
- Role-based access control (RBAC)
- Resource-level permissions

### Response Format Standardization
```json
{
  "success": true,
  "data": {},
  "meta": {
    "pagination": {},
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0"
  }
}
```

## Security Considerations

### Multi-Tenant Security
- Row-level security for all queries
- Tenant isolation in all API endpoints
- Secure tenant identification
- Prevent cross-tenant data access

### Data Protection
- Encryption at rest and in transit
- PII detection and handling
- GDPR compliance features
- Data retention policies

### Access Control
- Principle of least privilege
- Regular permission audits
- Session management
- API key rotation

This roadmap provides a comprehensive transformation from a SOW-specific system to a versatile, scalable document management platform while maintaining data integrity and ensuring smooth migration.