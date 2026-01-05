/* eslint-disable */
// CloudFront Function to rewrite requests for SPA routing
function handler(event) {
  const request = event.request
  const uri = request.uri

  // Check if the request is for a file that doesn't exist
  // If it's not a file request, rewrite to index.html for SPA routing
  if (!uri.includes('.') && !uri.endsWith('/')) {
    request.uri = '/index.html'
  } else if (uri.endsWith('/')) {
    // If it ends with / but doesn't have a file extension, also rewrite to index.html
    request.uri = uri + 'index.html'
  }

  return request
}
