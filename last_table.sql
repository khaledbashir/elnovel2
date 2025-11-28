-- Pricing Data (structured pricing table data)
CREATE TABLE pricing_data (
  document_id VARCHAR(255) PRIMARY KEY,
  pricing_json JSON NOT NULL, -- { rows: [...], discount: 0, totals: {...} }
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE
);