import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

export async function GET() {
  try {
    // Create agents table if it doesn't exist
    await query(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    // Check if we have any agents
    const existingAgents = await query('SELECT COUNT(*) as count FROM agents');
    const count = (existingAgents as any)[0].count;

    // Insert default agents if table is empty
    if (count === 0) {
      await query(`
        INSERT INTO agents (id, name, description, system_instructions, icon, is_default) VALUES
        (
          'default-sow-agent',
          'SOW Expert',
          'Expert at creating Statements of Work with pricing tables',
          'You are an expert at creating professional Statements of Work (SOWs). You help users define project scopes, deliverables, assumptions, and pricing. Always use the rate card provided in context. Format pricing tables clearly with roles, hours, and rates. Include GST calculations and discount options. Be concise but thorough.',
          '📄',
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
          'code-reviewer-agent',
          'Code Reviewer',
          'Expert code reviewer focusing on best practices and optimization',
          'You are an expert code reviewer. Analyze code for bugs, performance issues, security vulnerabilities, and best practices. Provide constructive feedback with specific suggestions for improvement. Focus on readability, maintainability, and efficiency.',
          '👨‍💻',
          FALSE
        )
      `);
    }

    return NextResponse.json({
      success: true,
      message: 'Agents table initialized successfully',
      agentCount: count === 0 ? 3 : count,
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.toString(),
    }, { status: 500 });
  }
}
