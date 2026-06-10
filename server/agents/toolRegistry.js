/**
 * Tool registry for Node agents.
 *
 * Same shape as the PHP ToolRegistry — a tool is a name + description +
 * JSON-schema parameters + handler (args) => result. VoltAgent's
 * createTool wraps this for the underlying SDK; we keep our own
 * registry so the same registry can be exposed via the cross-runtime
 * tool bus and unit-tested without a live SDK.
 */

class ToolRegistry {
  /**
   * @param {Record<string, {description: string, parameters: any, handler: (args: any) => any}>} [initial]
   */
  constructor(initial = {}) {
    this.tools = {};
    for (const [name, t] of Object.entries(initial)) {
      this.register(name, t.description, t.parameters, t.handler);
    }
  }

  /**
   * @param {string} name
   * @param {string} description
   * @param {any} parameters JSON schema
   * @param {(args: any) => any} handler
   * @returns {ToolRegistry}
   */
  register(name, description, parameters, handler) {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      throw new Error(`Tool name must match /^[a-zA-Z_][a-zA-Z0-9_]*$/: ${name}`);
    }
    this.tools[name] = { description, parameters, handler };
    return this;
  }

  has(name) { return Object.prototype.hasOwnProperty.call(this.tools, name); }
  hasAny() { return Object.keys(this.tools).length > 0; }
  names() { return Object.keys(this.tools); }

  /**
   * @returns {Array<{name: string, description: string, parameters: any}>}
   */
  definitions() {
    return Object.entries(this.tools).map(([name, t]) => ({
      name,
      description: t.description,
      parameters: t.parameters,
    }));
  }

  /**
   * @param {string} name
   * @param {Record<string, any>} args
   */
  execute(name, args) {
    if (!this.has(name)) throw new Error(`Unknown tool: ${name}`);
    return this.tools[name].handler(args);
  }
}

module.exports = { ToolRegistry };
