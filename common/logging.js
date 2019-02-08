/*
 * Copyright © 2018 VMware, Inc. All Rights Reserved.
 * SPDX-License-Identifier: BSD-2-Clause
 */
'use strict'

const winston = require('winston')

const logger = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: {},
  transports: [
    new winston.transports.File({
      filename: 'logs/vidm_error',
      timestamp: true,
      maxFiles: 10,
      maxsize: (1 * 1024 * 1024) // bytes
    })
  ]
})

function logError (endpoint, message, status, object) {
  logger.error(message, {
    'endpoint': endpoint,
    'status': status,
    'object': JSON.stringify(object)
  })
}

function currentFileName () {
  return logger.transports[0].filename
}

logError('', 'Logging initialized', 100, {})

exports.logError = logError
exports.currentLogfile = currentFileName
