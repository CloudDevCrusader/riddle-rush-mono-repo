#!/usr/bin/env node
/**
 * Export MCP configurations for OpenCode platform
 * Converts repository MCP configs to OpenCode-compatible format
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read all MCP configurations
const mcpConfig = JSON.parse(fs.readFileSync('.mcp.json', 'utf8'));
const fastmcpConfig = JSON.parse(fs.readFileSync('fastmcp.json', 'utf8'));
const cursorMcpConfig = JSON.parse(fs.readFileSync('.cursor/mcp.json', 'utf8'));

// Convert to OpenCode format
const opencodeConfig = {
  version: '1.0',
  platform: 'opencode',
  mcpServers: {},
};

// Merge all servers with OpenCode-specific formatting
Object.assign(
  opencodeConfig.mcpServers,
  convertToOpenCodeFormat(mcpConfig.mcpServers, 'primary'),
  convertToOpenCodeFormat(fastmcpConfig.mcpServers, 'fastmcp'),
  convertToOpenCodeFormat(cursorMcpConfig.mcpServers, 'cursor')
);

function convertToOpenCodeFormat(servers, source) {
  const result = {};

  for (const [name, config] of Object.entries(servers)) {
    result[`${source}-${name}`] = {
      type: 'opencode-mcp',
      source: config.source || config.command || 'npx',
      args: config.args || [],
      env: config.env || {},
      description: config.description || `MCP server from ${source}: ${name}`,
      tags: [source, 'riddle-rush'],
      opencode: {
        priority: source === 'primary' ? 'high' : 'medium',
        category: getCategory(name),
        documentation: `https://riddle-rush.com/docs/mcp/${name}`,
      },
    };
  }

  return result;
}

function getCategory(name) {
  if (name.includes('nuxt') || name.includes('ui')) return 'frontend';
  if (name.includes('playwright') || name.includes('browser')) return 'testing';
  if (name.includes('git') || name.includes('gitlab')) return 'devops';
  if (name.includes('aws') || name.includes('docker')) return 'cloud';
  return 'general';
}

// Write OpenCode configuration
const outputPath = path.join(path.dirname(__dirname), 'opencode-mcp-config.json');
fs.writeFileSync(outputPath, JSON.stringify(opencodeConfig, null, 2));

console.log(`✅ OpenCode MCP configuration exported to: ${outputPath}`);
console.log(`Total servers: ${Object.keys(opencodeConfig.mcpServers).length}`);

// Generate summary
const summary = {
  sources: ['.mcp.json', 'fastmcp.json', '.cursor/mcp.json'],
  totalServers: Object.keys(opencodeConfig.mcpServers).length,
  categories: {},
  outputFile: outputPath,
};

for (const server of Object.values(opencodeConfig.mcpServers)) {
  const category = server.opencode.category;
  summary.categories[category] = (summary.categories[category] || 0) + 1;
}

console.log('\n📊 Summary:');
console.log(JSON.stringify(summary, null, 2));
