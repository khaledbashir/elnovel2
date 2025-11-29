INSERT INTO SlashCommand (id, title, description, icon, searchTerms, prompt, model, provider, isActive, isSystem, createdAt, updatedAt) 
VALUES (
  'sys-presentation', 
  'Generate Presentation', 
  'AI will generate professional slides/poster in PDF format.', 
  '📊', 
  'presentation,slides,ppt,poster,deck', 
  'Create a professional presentation on the following topic. Include relevant information, clear structure, and visual appeal.', 
  'slides_glm_agent', 
  'z.ai-slides', 
  true, 
  true,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
);
