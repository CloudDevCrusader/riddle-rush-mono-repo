import { Command } from '@oclif/core';

import { execSync } from 'node:child_process';

export default class AgentMcpHealth extends Command {
  static override description = 'Check MCP server health and status';

  static override examples = ['<%= config.bin %> <%= command.id %>'];

  public async run(): Promise<void> {
    this.log('');
    this.log('╔════════════════════════════════════════════════════════════╗');
    this.log('║          🔌 MCP Server Health Check                        ║');
    this.log('╚════════════════════════════════════════════════════════════╝');
    this.log('');

    const servers = [
      { name: 'Chrome DevTools', cmd: 'npx -y chrome-devtools-mcp@latest --help' },
      { name: 'Git', cmd: 'npx -y @modelcontextprotocol/server-git --help' },
      { name: 'Filesystem', cmd: 'npx -y @modelcontextprotocol/server-filesystem --help' },
      { name: 'Docker', cmd: 'npx -y @docker/mcp-server-docker --help' },
    ];

    let healthy = 0;

    for (const server of servers) {
      this.log(`Checking: ${server.name}`);
      try {
        execSync(server.cmd, {
          stdio: 'pipe',
          timeout: 5000,
          windowsHide: true,
        });
        this.log(`✓ ${server.name} is available\n`);
        healthy++;
      } catch (error) {
        this.log(
          `✗ ${server.name} is not available (${error instanceof Error ? error.message : String(error)})\n`,
        );
      }
    }

    this.log('╔════════════════════════════════════════════════════════════╗');
    if (healthy === servers.length) {
      this.log('║ ✅ All MCP servers are healthy!                           ║');
      this.log('╚════════════════════════════════════════════════════════════╝');
    } else {
      this.log(`║ ⚠️  ${healthy}/${servers.length} MCP servers are healthy.     ║`);
      this.log('╚════════════════════════════════════════════════════════════╝');
      this.log('');
      this.log('To resolve issues:');
      this.log('  • Check if MCP servers are installed');
      this.log('  • Verify network connectivity');
      this.log('  • Update MCP packages if needed');
      this.error('MCP health check failed', { exit: 1 });
    }
  }
}
