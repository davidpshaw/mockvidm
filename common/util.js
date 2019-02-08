function hostWithProxy (req) {
  // request.hostname is broken in Express 4 so we have to deal with the X-Forwarded- headers ourselves
  const forwardedHost = req.headers['x-forwarded-host']
  const forwardedPort = req.headers['x-forwarded-port']
  if (forwardedHost && forwardedPort) {
    return forwardedHost + ':' + forwardedPort
  } else {
    return req.headers.host
  }
}

exports.hostWithProxy = hostWithProxy
