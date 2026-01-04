process.on('warning', () => {
  // Silence noisy test environment warnings (e.g., localstorage-file).
})

// Prevent libraries from emitting runtime warnings during unit tests.
process.emitWarning = () => {}
