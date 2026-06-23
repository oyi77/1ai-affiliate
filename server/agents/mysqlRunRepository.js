/**
 * MysqlRunRepository — persists AI agent run history to the database.
 * Falls back to in-memory if the table doesn't exist yet.
 */
const pool = require('../db/mysql');

class MysqlRunRepository {
  constructor() {
    this.memoryFallback = {};
    this.tableReady = null;
  }

  async ensureTable() {
    if (this.tableReady !== null) return this.tableReady;
    try {
      await pool.query(`CREATE TABLE IF NOT EXISTS 1ai_agent_runs (
        run_id VARCHAR(64) PRIMARY KEY,
        agent_name VARCHAR(100) NOT NULL,
        input JSON,
        output JSON,
        error TEXT,
        prompt_tokens INT DEFAULT 0,
        completion_tokens INT DEFAULT 0,
        duration_ms INT DEFAULT 0,
        status VARCHAR(20) DEFAULT 'running',
        started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        finished_at TIMESTAMP NULL,
        INDEX idx_agent (agent_name),
        INDEX idx_started (started_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);
      this.tableReady = true;
    } catch (err) {
      console.warn('[MysqlRunRepository] table creation failed, using memory fallback:', err.message);
      this.tableReady = false;
    }
    return this.tableReady;
  }

  async start(agentName, runId, input) {
    const record = {
      agentName, runId, input,
      output: null, error: null,
      promptTokens: 0, completionTokens: 0, durationMs: 0,
      status: 'running',
      startedAt: new Date().toISOString(),
      finishedAt: null,
    };
    this.memoryFallback[runId] = record;
    if (await this.ensureTable()) {
      try {
        await pool.query(
          'INSERT INTO 1ai_agent_runs (run_id, agent_name, input, status) VALUES (?, ?, ?, ?)',
          [runId, agentName, JSON.stringify(input), 'running']
        );
      } catch (err) {
        console.error('[MysqlRunRepository] start error:', err.message);
      }
    }
  }

  async finish(runId, output, error, promptTokens, completionTokens, durationMs, status) {
    const existing = this.memoryFallback[runId];
    if (existing) {
      this.memoryFallback[runId] = {
        ...existing, output, error,
        promptTokens, completionTokens, durationMs, status,
        finishedAt: new Date().toISOString(),
      };
    }
    if (await this.ensureTable()) {
      try {
        await pool.query(
          `UPDATE 1ai_agent_runs SET output=?, error=?, prompt_tokens=?, completion_tokens=?,
           duration_ms=?, status=?, finished_at=NOW() WHERE run_id=?`,
          [JSON.stringify(output), error, promptTokens, completionTokens, durationMs, status, runId]
        );
      } catch (err) {
        console.error('[MysqlRunRepository] finish error:', err.message);
      }
    }
  }

  async recent(limit = 50, agentName = null) {
    if (await this.ensureTable()) {
      try {
        let sql = 'SELECT * FROM 1ai_agent_runs';
        const params = [];
        if (agentName) {
          sql += ' WHERE agent_name = ?';
          params.push(agentName);
        }
        sql += ' ORDER BY started_at DESC LIMIT ?';
        params.push(limit);
        const [rows] = await pool.query(sql, params);
        return rows.map(r => ({
          agentName: r.agent_name, runId: r.run_id,
          input: typeof r.input === 'string' ? JSON.parse(r.input) : r.input,
          output: typeof r.output === 'string' ? JSON.parse(r.output) : r.output,
          error: r.error,
          promptTokens: r.prompt_tokens, completionTokens: r.completion_tokens,
          durationMs: r.duration_ms, status: r.status,
          startedAt: r.started_at, finishedAt: r.finished_at,
        }));
      } catch (err) {
        console.error('[MysqlRunRepository] recent error:', err.message);
      }
    }
    // Fallback to memory
    return Object.values(this.memoryFallback)
      .filter(r => !agentName || r.agentName === agentName)
      .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
      .slice(0, limit);
  }

  async findByRunId(runId) {
    if (await this.ensureTable()) {
      try {
        const [[row]] = await pool.query('SELECT * FROM 1ai_agent_runs WHERE run_id = ?', [runId]);
        if (row) {
          return {
            agentName: row.agent_name, runId: row.run_id,
            input: typeof row.input === 'string' ? JSON.parse(row.input) : row.input,
            output: typeof row.output === 'string' ? JSON.parse(row.output) : row.output,
            error: row.error,
            promptTokens: row.prompt_tokens, completionTokens: row.completion_tokens,
            durationMs: row.duration_ms, status: row.status,
            startedAt: row.started_at, finishedAt: row.finished_at,
          };
        }
      } catch (err) {
        console.error('[MysqlRunRepository] findByRunId error:', err.message);
      }
    }
    return this.memoryFallback[runId] || null;
  }
}

module.exports = { MysqlRunRepository };
