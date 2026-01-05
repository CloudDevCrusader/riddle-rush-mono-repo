/* eslint-disable */
// Lambda@Edge function for enhanced caching control

const CACHE_CONTROL_HEADER =
  process.env.CACHE_CONTROL_HEADER || 'public, max-age=31536000, immutable'

const ASSET_EXTENSIONS = [
  '.js',
  '.css',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.svg',
  '.woff',
  '.woff2',
  '.ttf',
  '.eot',
  '.ico',
  '.json',
]

exports.handler = async (event, context) => {
  const request = event.Records[0].cf.request
  const response = event.Records[0].cf.response

  // Skip if this is not a successful response
  if (response.status !== '200' && response.status !== '201') {
    return response
  }

  // Determine cache behavior based on file type
  const uri = request.uri.toLowerCase()
  let cacheControl = CACHE_CONTROL_HEADER

  // Short cache for HTML files and service workers
  if (uri.endsWith('.html') || uri.includes('sw.js') || uri.includes('workbox-')) {
    cacheControl = 'public, max-age=300, must-revalidate'
  } else if (ASSET_EXTENSIONS.some((ext) => uri.endsWith(ext))) {
    // Long cache for static assets
    cacheControl = 'public, max-age=31536000, immutable'
  } else if (uri.startsWith('/data/')) {
    // Medium cache for data files
    cacheControl = 'public, max-age=3600, must-revalidate'
  }

  // Add Cache-Control header
  response.headers['cache-control'] = [{ key: 'Cache-Control', value: cacheControl }]

  // Add security headers
  response.headers['strict-transport-security'] = [
    { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubdomains; preload' },
  ]
  response.headers['x-content-type-options'] = [{ key: 'X-Content-Type-Options', value: 'nosniff' }]
  response.headers['x-frame-options'] = [{ key: 'X-Frame-Options', value: 'DENY' }]
  response.headers['x-xss-protection'] = [{ key: 'X-XSS-Protection', value: '1; mode=block' }]
  response.headers['referrer-policy'] = [
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  ]

  return response
}
