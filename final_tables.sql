-- Document Content (Novel editor content)
CREATE TABLE document_content (
  document_id VARCHAR(255) PRIMARY KEY,
  content_json JSON NOT NULL, -- TipTap/Novel JSON format
  content_markdown TEXT, -- Optional: markdown backup
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);

-- Pricing Data (structured pricing table data)
CREATE TABLE pricing_data (
  document_id VARCHAR(255) PRIMARY KEY,
  pricing_json JSON NOT NULL, -- { rows: [...], discount: 0, totals: {...} }
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);