/**
 * Terraform Integration Configuration
 *
 * This file can be used to read Terraform outputs and configure Nuxt
 * based on the infrastructure state.
 *
 * Usage:
 * 1. Run: source ./scripts/get-terraform-outputs.sh prod
 * 2. This will export environment variables that can be used in nuxt.config.ts
 *
 * Or use the terraform outputs directly in your deployment pipeline.
 */

import { readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { execSync } from 'node:child_process'

interface TerraformOutputs {
  bucket_name?: string
  cloudfront_distribution_id?: string
  cloudfront_domain_name?: string
  website_url?: string
  aws_region?: string
}

/**
 * Read Terraform outputs from a JSON file
 * This assumes you've run: terraform output -json > terraform-outputs.json
 */
export function getTerraformOutputs(environment: string = 'prod'): TerraformOutputs {
  try {
    const outputFile = join(
      process.cwd(),
      `infrastructure/environments/${environment}/terraform-outputs.json`
    )
    const outputs = JSON.parse(readFileSync(outputFile, 'utf-8'))

    return {
      bucket_name: outputs.bucket_name?.value,
      cloudfront_distribution_id: outputs.cloudfront_distribution_id?.value,
      cloudfront_domain_name: outputs.cloudfront_domain_name?.value,
      website_url: outputs.website_url?.value,
      aws_region: outputs.aws_region?.value || 'eu-central-1',
    }
  } catch {
    // If file doesn't exist, return empty object
    // This allows the app to work without Terraform outputs
    return {}
  }
}

/**
 * Get Terraform outputs from environment variables
 * These are set by get-terraform-outputs.sh script
 */
export function getTerraformOutputsFromEnv(): TerraformOutputs {
  return {
    bucket_name: process.env.AWS_S3_BUCKET,
    cloudfront_distribution_id: process.env.AWS_CLOUDFRONT_ID,
    cloudfront_domain_name: process.env.CLOUDFRONT_DOMAIN,
    website_url: process.env.WEBSITE_URL,
    aws_region: process.env.AWS_REGION || 'eu-central-1',
  }
}

/**
 * Export Terraform outputs to a JSON file
 * Run this after terraform apply to update outputs
 */
export function exportTerraformOutputs(environment: string = 'prod'): void {
  try {
    const outputDir = join(process.cwd(), `infrastructure/environments/${environment}`)
    const outputs = execSync(`cd ${outputDir} && terraform output -json`, { encoding: 'utf-8' })
    const outputFile = join(outputDir, 'terraform-outputs.json')

    writeFileSync(outputFile, outputs)
    // eslint-disable-next-line no-console
    console.log(`✅ Terraform outputs exported to ${outputFile}`)
  } catch (error) {
    console.error('❌ Failed to export Terraform outputs:', error)
  }
}
