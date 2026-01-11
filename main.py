"""
Riddle Rush Monorepo - FastMCP Subagents Server

This FastMCP server provides specialized subagents for:
- AWS deployment and infrastructure
- Terraform management
- CI/CD workflows
- Testing automation
- Code quality and linting
- Documentation generation
"""

from fastmcp import FastMCP
import subprocess
import json
import os
from pathlib import Path

# Initialize FastMCP server
mcp = FastMCP("riddle-rush-agents")

# Project root directory
PROJECT_ROOT = Path(__file__).parent


# ============================================================================
# AWS DEPLOYMENT SUBAGENT
# ============================================================================

@mcp.tool()
def aws_deploy_check(environment: str = "development") -> str:
    """
    Check AWS deployment status and prerequisites for a given environment.
    
    Args:
        environment: The deployment environment (development, staging, production)
    
    Returns:
        Status report including credentials, bucket info, and deployment readiness
    """
    try:
        result = subprocess.run(
            ["bash", "-c", f"cd {PROJECT_ROOT} && ./scripts/terraform-plan.sh {environment}"],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        return f"AWS Deployment Check for {environment}:\n\n{result.stdout}\n\nErrors (if any):\n{result.stderr}"
    except subprocess.TimeoutExpired:
        return f"❌ Terraform plan timed out for {environment}"
    except Exception as e:
        return f"❌ Error checking AWS deployment: {str(e)}"


@mcp.tool()
def aws_get_outputs(environment: str = "production") -> dict:
    """
    Get Terraform outputs for AWS infrastructure (bucket names, CloudFront IDs, etc.)
    
    Args:
        environment: The environment to get outputs for (development, staging, production)
    
    Returns:
        Dictionary of Terraform outputs including S3 bucket, CloudFront distribution, etc.
    """
    try:
        # Source the get-terraform-outputs script
        cmd = f"cd {PROJECT_ROOT}/infrastructure/environments/{environment} && terraform output -json"
        result = subprocess.run(
            ["bash", "-c", cmd],
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            outputs = json.loads(result.stdout)
            return {k: v.get("value") for k, v in outputs.items()}
        else:
            return {"error": result.stderr}
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def aws_deploy(environment: str, skip_tests: bool = False) -> str:
    """
    Deploy the application to AWS (S3 + CloudFront) for the specified environment.
    
    Args:
        environment: Target environment (development, production)
        skip_tests: Skip pre-deployment tests (default: False)
    
    Returns:
        Deployment status and URLs
    """
    try:
        script_map = {
            "production": "deploy-prod.sh",
            "development": "deploy-dev.sh"
        }
        
        script = script_map.get(environment)
        if not script:
            return f"❌ Invalid environment: {environment}. Use 'development' or 'production'."
        
        cmd = f"cd {PROJECT_ROOT} && ./scripts/{script}"
        if skip_tests:
            cmd += " --skip-tests"
        
        result = subprocess.run(
            ["bash", "-c", cmd],
            capture_output=True,
            text=True,
            timeout=600  # 10 minutes
        )
        
        return f"AWS Deployment to {environment}:\n\n{result.stdout}\n\nErrors (if any):\n{result.stderr}"
    except subprocess.TimeoutExpired:
        return f"❌ Deployment timed out for {environment}"
    except Exception as e:
        return f"❌ Error deploying to AWS: {str(e)}"


# ============================================================================
# TERRAFORM MANAGEMENT SUBAGENT
# ============================================================================

@mcp.tool()
def terraform_plan(environment: str = "development") -> str:
    """
    Run Terraform plan to preview infrastructure changes.
    
    Args:
        environment: Target environment (development, staging, production)
    
    Returns:
        Terraform plan output showing proposed changes
    """
    try:
        result = subprocess.run(
            ["pnpm", "run", "terraform:plan", environment],
            capture_output=True,
            text=True,
            timeout=120,
            cwd=PROJECT_ROOT
        )
        
        return f"Terraform Plan for {environment}:\n\n{result.stdout}\n\nErrors (if any):\n{result.stderr}"
    except Exception as e:
        return f"❌ Error running terraform plan: {str(e)}"


@mcp.tool()
def terraform_apply(environment: str = "development", auto_approve: bool = False) -> str:
    """
    Apply Terraform changes to create/update infrastructure.
    
    Args:
        environment: Target environment (development, staging, production)
        auto_approve: Skip confirmation prompt (use with caution!)
    
    Returns:
        Terraform apply output
    """
    try:
        cmd = f"cd {PROJECT_ROOT} && ./scripts/terraform-apply.sh {environment}"
        if auto_approve:
            cmd += " --auto-approve"
        
        result = subprocess.run(
            ["bash", "-c", cmd],
            capture_output=True,
            text=True,
            timeout=300
        )
        
        return f"Terraform Apply for {environment}:\n\n{result.stdout}\n\nErrors (if any):\n{result.stderr}"
    except Exception as e:
        return f"❌ Error applying terraform: {str(e)}"


@mcp.tool()
def terraform_status() -> dict:
    """
    Get current Terraform state and infrastructure status across all environments.
    
    Returns:
        Dictionary with status for each environment
    """
    environments = ["development", "staging", "production"]
    status = {}
    
    for env in environments:
        try:
            cmd = f"cd {PROJECT_ROOT}/infrastructure/environments/{env} && terraform state list"
            result = subprocess.run(
                ["bash", "-c", cmd],
                capture_output=True,
                text=True,
                timeout=30
            )
            
            status[env] = {
                "initialized": result.returncode == 0,
                "resources": result.stdout.strip().split("\n") if result.stdout else []
            }
        except Exception as e:
            status[env] = {"error": str(e)}
    
    return status


# ============================================================================
# CI/CD WORKFLOW SUBAGENT
# ============================================================================

@mcp.tool()
def cicd_check() -> dict:
    """
    Check CI/CD pipeline health and recent pipeline status.
    
    Returns:
        Pipeline configuration and status information
    """
    try:
        # Check if gitlab-ci.yml exists and is valid
        gitlab_ci = PROJECT_ROOT / ".gitlab-ci.yml"
        
        result = {
            "gitlab_ci_exists": gitlab_ci.exists(),
            "hooks_configured": (PROJECT_ROOT / ".husky").exists(),
            "scripts_available": []
        }
        
        # List available deployment scripts
        scripts_dir = PROJECT_ROOT / "scripts"
        if scripts_dir.exists():
            result["scripts_available"] = [
                f.name for f in scripts_dir.glob("*.sh")
                if f.name.startswith("deploy-") or f.name.startswith("terraform-")
            ]
        
        return result
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def run_quality_checks(fix: bool = False) -> str:
    """
    Run all code quality checks (typecheck, lint, format).
    
    Args:
        fix: Automatically fix issues where possible (default: False)
    
    Returns:
        Quality check results
    """
    try:
        if fix:
            cmd = "pnpm run agent:fix"
        else:
            cmd = "pnpm run workspace:check"
        
        result = subprocess.run(
            ["bash", "-c", f"cd {PROJECT_ROOT} && {cmd}"],
            capture_output=True,
            text=True,
            timeout=180
        )
        
        return f"Quality Checks:\n\n{result.stdout}\n\nErrors (if any):\n{result.stderr}"
    except Exception as e:
        return f"❌ Error running quality checks: {str(e)}"


# ============================================================================
# TESTING AUTOMATION SUBAGENT
# ============================================================================

@mcp.tool()
def run_tests(test_type: str = "unit", coverage: bool = False) -> str:
    """
    Run tests (unit or e2e).
    
    Args:
        test_type: Type of tests to run (unit, e2e, e2e:ui, e2e:headed)
        coverage: Generate coverage report for unit tests (default: False)
    
    Returns:
        Test results
    """
    try:
        cmd_map = {
            "unit": "pnpm run test:unit:coverage" if coverage else "pnpm run test:unit",
            "e2e": "pnpm run test:e2e",
            "e2e:ui": "pnpm run test:e2e:ui",
            "e2e:headed": "pnpm run test:e2e:headed"
        }
        
        cmd = cmd_map.get(test_type, "pnpm run test:unit")
        
        result = subprocess.run(
            ["bash", "-c", f"cd {PROJECT_ROOT} && {cmd}"],
            capture_output=True,
            text=True,
            timeout=300
        )
        
        return f"Test Results ({test_type}):\n\n{result.stdout}\n\nErrors (if any):\n{result.stderr}"
    except subprocess.TimeoutExpired:
        return f"❌ Tests timed out ({test_type})"
    except Exception as e:
        return f"❌ Error running tests: {str(e)}"


@mcp.tool()
def test_deployed_site(environment: str = "production") -> str:
    """
    Run E2E tests against a deployed site.
    
    Args:
        environment: Environment to test (production, staging, dev)
    
    Returns:
        E2E test results
    """
    try:
        cmd = f"pnpm run test:e2e:{environment}"
        
        result = subprocess.run(
            ["bash", "-c", f"cd {PROJECT_ROOT} && {cmd}"],
            capture_output=True,
            text=True,
            timeout=600
        )
        
        return f"E2E Tests ({environment}):\n\n{result.stdout}\n\nErrors (if any):\n{result.stderr}"
    except Exception as e:
        return f"❌ Error testing deployed site: {str(e)}"


# ============================================================================
# PROJECT MANAGEMENT SUBAGENT
# ============================================================================

@mcp.tool()
def get_project_status() -> dict:
    """
    Get comprehensive project status including git, dependencies, and build state.
    
    Returns:
        Dictionary with project status information
    """
    try:
        status = {}
        
        # Git status
        git_result = subprocess.run(
            ["git", "status", "--short"],
            capture_output=True,
            text=True,
            timeout=10,
            cwd=PROJECT_ROOT
        )
        status["git_status"] = git_result.stdout.strip()
        
        # Current branch
        branch_result = subprocess.run(
            ["git", "branch", "--show-current"],
            capture_output=True,
            text=True,
            timeout=10,
            cwd=PROJECT_ROOT
        )
        status["current_branch"] = branch_result.stdout.strip()
        
        # Check for uncommitted changes
        status["has_changes"] = len(git_result.stdout.strip()) > 0
        
        # Check node_modules
        status["dependencies_installed"] = (PROJECT_ROOT / "node_modules").exists()
        
        # Check if build exists
        status["build_exists"] = (PROJECT_ROOT / "dist").exists()
        
        return status
    except Exception as e:
        return {"error": str(e)}


@mcp.tool()
def run_build(app: str = "game") -> str:
    """
    Build the specified app (game or docs).
    
    Args:
        app: The app to build (game, docs, or all)
    
    Returns:
        Build output
    """
    try:
        if app == "all":
            cmd = "pnpm run build"
        else:
            cmd = f"pnpm --filter @riddle-rush/{app} run build"
        
        result = subprocess.run(
            ["bash", "-c", f"cd {PROJECT_ROOT} && {cmd}"],
            capture_output=True,
            text=True,
            timeout=300
        )
        
        return f"Build Output ({app}):\n\n{result.stdout}\n\nErrors (if any):\n{result.stderr}"
    except Exception as e:
        return f"❌ Error building: {str(e)}"


# ============================================================================
# DOCUMENTATION SUBAGENT
# ============================================================================

@mcp.tool()
def list_documentation() -> list:
    """
    List all available documentation files.
    
    Returns:
        List of documentation files with descriptions
    """
    try:
        docs_dir = PROJECT_ROOT / "docs"
        doc_files = []
        
        for md_file in docs_dir.rglob("*.md"):
            relative_path = md_file.relative_to(PROJECT_ROOT)
            doc_files.append(str(relative_path))
        
        return sorted(doc_files)
    except Exception as e:
        return [f"Error listing docs: {str(e)}"]


@mcp.tool()
def get_quick_reference() -> dict:
    """
    Get quick reference information about the project structure and commands.
    
    Returns:
        Dictionary with project information and useful commands
    """
    return {
        "project": "Riddle Rush Monorepo - Nuxt 4 PWA",
        "key_commands": {
            "dev": "pnpm run dev",
            "build": "pnpm run build",
            "test": "pnpm run test:unit",
            "e2e": "pnpm run test:e2e",
            "quality": "pnpm run workspace:check",
            "deploy:prod": "./scripts/deploy-prod.sh",
            "deploy:dev": "./scripts/deploy-dev.sh"
        },
        "important_docs": [
            "AGENTS.md - Agent workflow guide",
            "CLAUDE.md - Claude Code instructions",
            "docs/AWS-DEPLOYMENT.md - AWS deployment guide",
            "docs/TERRAFORM-SETUP.md - Terraform guide",
            "docs/TESTING.md - Testing documentation"
        ],
        "apps": ["game", "docs"],
        "packages": ["config", "shared", "types"]
    }


# ============================================================================
# WORKSPACE MANAGEMENT SUBAGENT
# ============================================================================

@mcp.tool()
def workspace_info() -> dict:
    """
    Get information about the monorepo workspace structure.
    
    Returns:
        Dictionary with workspace packages and their status
    """
    try:
        # Get workspace packages
        result = subprocess.run(
            ["pnpm", "list", "-r", "--depth", "0", "--json"],
            capture_output=True,
            text=True,
            timeout=30,
            cwd=PROJECT_ROOT
        )
        
        if result.returncode == 0:
            packages = json.loads(result.stdout)
            return {
                "packages": [
                    {
                        "name": pkg.get("name"),
                        "version": pkg.get("version"),
                        "path": pkg.get("path", "").replace(str(PROJECT_ROOT), "")
                    }
                    for pkg in packages
                ]
            }
        else:
            return {"error": result.stderr}
    except Exception as e:
        return {"error": str(e)}


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    # Run the FastMCP server
    mcp.run()
