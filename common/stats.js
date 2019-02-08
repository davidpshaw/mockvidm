/*
 * Copyright © 2018 VMware, Inc. All Rights Reserved.
 * SPDX-License-Identifier: BSD-2-Clause
 */
'use strict'
const NotificationTypes = { 'public_key': 1, 'token_request': 2, 'notification': 3, 'logging': 4 }

// this in-memory structure hold stats for all users
let stats = {}
initStats()

function initStats () {
  stats = {
    lastReset: new Date().toISOString(),
    total: {
    }
  }
}

/**
 * Reset all the stats.  Call this before beginning a test
 *
 * @param  {} req, res
 */
function resetStats (req, res) {
  initStats()
  res.status(200).json(stats)
}

/**
 * Return the stats in a JSON structure
 *
 * @param  {} req, res
 */
function statsReturn (req, res) {
  res.status(200).json(stats)
}

/**
 * @param  {} NotificationType enum from NotificationTypes in this file
 * @param  {} status HTTP status code
 */
function addNotificationStat (NotificationType, status) {
  switch (NotificationType) {
    case NotificationTypes.public_key:
      stats.total[`public_key_${status}`] = (stats.total[`public_key_${status}`] !== undefined) ? stats.total[`public_key_${status}`] += 1 : 1
      break

    case NotificationTypes.token_request:
      stats.total[`token_request_${status}`] = (stats.total[`token_request_${status}`] !== undefined) ? stats.total[`token_request_${status}`] += 1 : 1
      break

    case NotificationTypes.notification:
      stats.total['notification_total_requests'] = (stats.total['notification_total_requests'] !== undefined) ? stats.total['notification_total_requests'] += 1 : 1
      stats.total[`notification_${status}`] = (stats.total[`notification_${status}`] !== undefined) ? stats.total[`notification_${status}`] += 1 : 1
      if (status > 299) {
        stats.total['notification_error'] = (stats.total['notification_error'] !== undefined) ? stats.total['notification_error'] += 1 : 1
      }
      break

    default:
      console.log(`Invalid NotificationType ${NotificationType}`)
  }
}

exports.NotificationTypes = NotificationTypes
exports.stats = statsReturn
exports.resetStats = resetStats
exports.addStat = addNotificationStat
