#!/usr/bin/env python3
"""
AI Agent Tools - Additional AI-powered utilities for Riddle Rush

This module provides additional AI tools and utilities that can be used
by agents or directly in the workflow.
"""

import subprocess
import json
import os
from pathlib import Path
from typing import Dict, List, Optional, Union

# Project root directory
PROJECT_ROOT = Path(__file__).parent.parent.parent


def run_command(cmd: str, cwd: Optional[str] = None, timeout: int = 60) -> Dict[str, Union[str, int]]:
    """
    Run a shell command and return the results.
    
    Args:
        cmd: Command to run
        cwd: Working directory (default: PROJECT_ROOT)
        timeout: Timeout in seconds
    
    Returns:
        Dictionary with stdout, stderr, and returncode
    """
    try:
        result = subprocess.run(
            cmd if isinstance(cmd, list) else ["bash", "-c", cmd],
            capture_output=True,
            text=True,
            timeout=timeout,
            cwd=cwd or str(PROJECT_ROOT)
        )
        
        return {
            "stdout": result.stdout,
            "stderr": result.stderr,
            "returncode": result.returncode
        }
    except subprocess.TimeoutExpired:
        return {
            "stdout": "",
            "stderr": f"Command timed out after {timeout} seconds",
            "returncode": -1
        }
    except Exception as e:
        return {
            "stdout": "",
            "stderr": str(e),
            "returncode": -2
        }


def get_ai_agent_status() -> Dict[str, Union[str, bool, List[str]]]:
    """
    Get the current status of AI agents and tools.
    
    Returns:
        Dictionary with AI agent status information
    """
    status = {
        "agents_available": [],
        "tools_installed": [],
        "ai_features_enabled": [],
        "recommendations": []
    }

    # Check for FastMCP
    fastmcp_check = run_command(["python", "-c", "import fastmcp; print('fastmcp_ok')"])
    if fastmcp_check["returncode"] == 0:
        status["tools_installed"].append("fastmcp")
        status["agents_available"].append("FastMCP Server")

    # Check for LangChain
    langchain_check = run_command(["python", "-c", "import langchain; print('langchain_ok')"])
    if langchain_check["returncode"] == 0:
        status["tools_installed"].append("langchain")
        status["agents_available"].append("LangChain Tools")

    # Check for Trunk
    trunk_path = PROJECT_ROOT / ".trunk-cache" / "cli"
    if trunk_path.exists():
        status["tools_installed"].append("trunk")
        status["agents_available"].append("Trunk Integration")
        status["ai_features_enabled"].append("Automated Code Quality")

    # Check for Python linting tools
    pyproject_path = PROJECT_ROOT / "pyproject.toml"
    if pyproject_path.exists():
        status["ai_features_enabled"].append("Python Linting")
        status["agents_available"].append("Python Code Analysis")

    # Add recommendations based on current setup
    if "fastmcp" in status["tools_installed"]:
        status["recommendations"].append("Start FastMCP server for multi-agent coordination")

    if "langchain" in status["tools_installed"]:
        status["recommendations"].append("Use LangChain for AI-powered workflow automation")

    if "trunk" in status["tools_installed"]:
        status["recommendations"].append("Run 'pnpm run workspace:check' for comprehensive quality checks")

    return status


def analyze_workspace_health() -> Dict[str, Union[str, int, List[Dict[str, str]]]]:
    """
    Analyze the overall health of the workspace.
    
    Returns:
        Dictionary with workspace health analysis
    """
    health_report = {
        "overall_score": 0,
        "health_indicators": [],
        "issues_found": [],
        "recommendations": []
    }

    # Check git status
    git_status = run_command(["git", "status", "--short"])
    if git_status["returncode"] == 0 and git_status["stdout"].strip():
        health_report["issues_found"].append({
            "type": "git",
            "severity": "medium",
            "message": "Uncommitted changes detected",
            "details": git_status["stdout"].strip()
        })

    # Check for node_modules
    node_modules_exists = (PROJECT_ROOT / "node_modules").exists()
    if not node_modules_exists:
        health_report["issues_found"].append({
            "type": "dependencies",
            "severity": "high",
            "message": "node_modules not found - dependencies not installed",
            "details": "Run 'pnpm install' to install dependencies"
        })
    else:
        health_report["health_indicators"].append({
            "type": "dependencies",
            "status": "ok",
            "message": "Dependencies installed"
        })

    # Check for build artifacts
    build_exists = (PROJECT_ROOT / "dist").exists() or \
                   (PROJECT_ROOT / "apps" / "game" / ".output").exists()
    if build_exists:
        health_report["health_indicators"].append({
            "type": "build",
            "status": "ok",
            "message": "Build artifacts found"
        })
    else:
        health_report["issues_found"].append({
            "type": "build",
            "severity": "low",
            "message": "No build artifacts found",
            "details": "Run 'pnpm run build' to create production build"
        })

    # Calculate overall score
    if not health_report["issues_found"]:
        health_report["overall_score"] = 100
        health_report["recommendations"].append("Workspace is in excellent health!")
    elif len(health_report["issues_found"]) == 1:
        health_report["overall_score"] = 80
        health_report["recommendations"].append("Address minor issues to improve workspace health")
    else:
        health_report["overall_score"] = 60
        health_report["recommendations"].append("Multiple issues detected - review and fix for optimal performance")

    return health_report


def get_ai_optimization_suggestions() -> Dict[str, List[Dict[str, str]]]:
    """
    Get AI-powered optimization suggestions for the project.
    
    Returns:
        Dictionary with optimization suggestions categorized by area
    """
    return {
        "performance": [
            {
                "area": "build",
                "suggestion": "Enable Turbo caching for faster builds",
                "impact": "20-30% build time reduction"
            },
            {
                "area": "assets",
                "suggestion": "Optimize image assets with modern formats (WebP, AVIF)",
                "impact": "40-60% smaller asset sizes"
            },
            {
                "area": "bundling",
                "suggestion": "Review and optimize bundle splitting strategy",
                "impact": "15-25% smaller initial load"
            }
        ],
        "code_quality": [
            {
                "area": "linting",
                "suggestion": "Run 'pnpm run workspace:check' regularly",
                "impact": "Consistent code quality across the project"
            },
            {
                "area": "testing",
                "suggestion": "Add more unit tests for critical components",
                "impact": "Improved code reliability and maintainability"
            },
            {
                "area": "documentation",
                "suggestion": "Generate API documentation for composables and stores",
                "impact": "Better developer onboarding and maintenance"
            }
        ],
        "workflow": [
            {
                "area": "ci/cd",
                "suggestion": "Implement parallel job execution in CI pipelines",
                "impact": "30-50% faster CI pipeline execution"
            },
            {
                "area": "automation",
                "suggestion": "Add more AI agents for repetitive tasks",
                "impact": "Reduced manual work and improved consistency"
            },
            {
                "area": "monitoring",
                "suggestion": "Implement performance monitoring for critical workflows",
                "impact": "Better visibility and proactive optimization"
            }
        ]
    }


def list_available_ai_tools() -> Dict[str, List[Dict[str, str]]]:
    """
    List all available AI tools and their capabilities.
    
    Returns:
        Dictionary with categorized AI tools
    """
    return {
        "code_analysis": [
            {
                "name": "Trunk Check",
                "description": "Comprehensive code quality analysis",
                "command": "pnpm run workspace:check"
            },
            {
                "name": "ESLint",
                "description": "JavaScript/TypeScript linting",
                "command": "./trunk check --filter=eslint"
            },
            {
                "name": "Prettier",
                "description": "Code formatting",
                "command": "./trunk check --filter=prettier"
            },
            {
                "name": "Ruff",
                "description": "Python linting",
                "command": "pnpm run python:lint"
            }
        ],
        "automation": [
            {
                "name": "FastMCP Server",
                "description": "Multi-agent coordination platform",
                "command": "cd tools/python && python main.py"
            },
            {
                "name": "Trunk Format",
                "description": "Auto-fix formatting issues",
                "command": "./trunk fmt --all"
            },
            {
                "name": "Agent Auto-fix",
                "description": "Automated issue resolution",
                "command": "pnpm run agent:fix"
            }
        ],
        "testing": [
            {
                "name": "Unit Tests",
                "description": "Run all unit tests",
                "command": "pnpm run test:unit"
            },
            {
                "name": "E2E Tests",
                "description": "Run end-to-end tests",
                "command": "pnpm run test:e2e"
            },
            {
                "name": "Coverage Analysis",
                "description": "Generate test coverage reports",
                "command": "pnpm run test:unit:coverage"
            }
        ],
        "deployment": [
            {
                "name": "AWS Deployment",
                "description": "Deploy to AWS production",
                "command": "./scripts/deploy-prod.sh"
            },
            {
                "name": "Terraform",
                "description": "Infrastructure as code",
                "command": "pnpm run terraform:plan"
            },
            {
                "name": "CI Pipeline",
                "description": "Run full CI pipeline",
                "command": "pnpm run workspace:check && pnpm run test:unit"
            }
        ]
    }


if __name__ == "__main__":
    # Example usage when run directly
    print("AI Agent Tools - Riddle Rush Monorepo")
    print("=" * 50)
    
    # Get and display AI agent status
    status = get_ai_agent_status()
    print(f"AI Agents Available: {len(status['agents_available'])}")
    print(f"Tools Installed: {len(status['tools_installed'])}")
    print(f"AI Features Enabled: {len(status['ai_features_enabled'])}")
    
    if status['recommendations']:
        print("\nRecommendations:")
        for rec in status['recommendations']:
            print(f"  - {rec}")
    
    print("\nUse these tools in your FastMCP agents or workflows!")
