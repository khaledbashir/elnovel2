import { query, queryOne } from '@/lib/database';

export interface Agent {
    id: string;
    name: string;
    description?: string;
    system_instructions: string;
    icon: string;
    is_default: boolean;
    created_at: Date;
    updated_at: Date;
}

// Get all agents
export async function getAllAgents(): Promise<Agent[]> {
    return await query<Agent[]>(
        'SELECT * FROM agents ORDER BY is_default DESC, created_at DESC'
    );
}

// Get agent by ID
export async function getAgentById(id: string): Promise<Agent | null> {
    return await queryOne<Agent>(
        'SELECT * FROM agents WHERE id = ?',
        [id]
    );
}

// Get default agent
export async function getDefaultAgent(): Promise<Agent | null> {
    return await queryOne<Agent>(
        'SELECT * FROM agents WHERE is_default = TRUE LIMIT 1'
    );
}

// Create agent
export async function createAgent(
    id: string,
    name: string,
    systemInstructions: string,
    description?: string,
    icon: string = '🤖',
    isDefault: boolean = false
): Promise<Agent> {
    // If this is set as default, unset all others
    if (isDefault) {
        await query('UPDATE agents SET is_default = FALSE');
    }

    await query(
        'INSERT INTO agents (id, name, description, system_instructions, icon, is_default) VALUES (?, ?, ?, ?, ?, ?)',
        [id, name, description || null, systemInstructions, icon, isDefault]
    );

    return (await getAgentById(id))!;
}

// Update agent
export async function updateAgent(
    id: string,
    name?: string,
    systemInstructions?: string,
    description?: string,
    icon?: string,
    isDefault?: boolean
): Promise<Agent> {
    const updates: string[] = [];
    const params: any[] = [];

    if (name !== undefined) {
        updates.push('name = ?');
        params.push(name);
    }
    if (systemInstructions !== undefined) {
        updates.push('system_instructions = ?');
        params.push(systemInstructions);
    }
    if (description !== undefined) {
        updates.push('description = ?');
        params.push(description);
    }
    if (icon !== undefined) {
        updates.push('icon = ?');
        params.push(icon);
    }
    if (isDefault !== undefined) {
        // If setting as default, unset all others first
        if (isDefault) {
            await query('UPDATE agents SET is_default = FALSE');
        }
        updates.push('is_default = ?');
        params.push(isDefault);
    }

    if (updates.length > 0) {
        params.push(id);
        await query(
            `UPDATE agents SET ${updates.join(', ')} WHERE id = ?`,
            params
        );
    }

    return (await getAgentById(id))!;
}

// Delete agent
export async function deleteAgent(id: string): Promise<void> {
    await query('DELETE FROM agents WHERE id = ?', [id]);
}

// Set default agent
export async function setDefaultAgent(id: string): Promise<Agent> {
    // Unset all defaults
    await query('UPDATE agents SET is_default = FALSE');
    
    // Set new default
    await query('UPDATE agents SET is_default = TRUE WHERE id = ?', [id]);
    
    return (await getAgentById(id))!;
}
