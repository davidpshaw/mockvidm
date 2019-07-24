/*
 * Copyright © 2018 VMware, Inc. All Rights Reserved.
 * SPDX-License-Identifier: BSD-2-Clause
 */
'use strict'

const jwt = require('jsonwebtoken')
const fs = require('fs')
const uuidv4 = require('uuid/v4')

const stats = require('./stats')
const hostWithProxy = require('./util').hostWithProxy

const privateKey = fs.readFileSync(privateKeyPath())

function verifyAuth (authorization) {
  return getPublicKey().then(function (pubKeyContents) {
    return new Promise(function (resolve, reject) {
      // https://github.com/auth0/node-jsonwebtoken
      const jwtOptions = {
        /*
                 * Don't allow 'none' OR HMAC.
                 *
                 * We have decided that a RSA/ECDSA public key will be used and
                 * which key has been set out-of-band.  We cannot allow the
                 * caller to specify non-RSA/ECDSA algorithms or else they can
                 * either specify none or specify HMAC that uses a shared
                 * secret.
                 * Since jwt.verify has the same parameter for shared secret or
                 * public key, this would allow an attacker to specify HMAC alg
                 * signed with a shared secret of the public key contents --
                 * which are not meant to be hidden -- and appear to be valid.
                 *
                 * (It doesn't look like node-jsonwebtoken fixed this security
                 * issue from 2015 yet, but they probably did and the fix just
                 * isn't as obvious as using a different function name or
                 * having a forced algorithm passed in, so I'm going to assume
                 * that the burden is on us to make sure we don't mix pub key
                 * and shared secret algorithms in the algorithms option.)
                 */
        algorithms: [
          'RS256',
          'RS384',
          'RS512',
          'ES256',
          'ES384',
          'ES512'
        ],
        // audience: 'TODO',
        // issuer: 'TODO',
        // subject: 'TODO',
        clockTolerance: 60,
        clockTimestamp: Date.now() / 1000
      }

      const auth = authorization.replace('Bearer ', '').trim()

      jwt.verify(auth, pubKeyContents, jwtOptions, function (err, data) {
        if (err) {
          reject(new Error('Failed JWT validation! ' + err.message))
        } else {
          resolve(data)
        }
      })
    })
  })
}

function getPublicKey () {
  return new Promise(function (resolve, reject) {
    fs.readFile(publicKeyPath(), 'utf8', function (err, data) {
      if (err !== undefined) {
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

function publicKeyPath () {
  return './static/public.pem'
}

function privateKeyPath () {
  return './static/private.pem'
}

const clientId = 'HeroCard_Template1@be384045-9ea9-4dac-90d4-bd92367f99ab'
const clientSecret = 'yaioJWzOTbKGfyXj5ZeHsQiytN85nRnIHrHFsQNg0QsFWCU6'
/**
 * Perform device registration against vIDM
 * @param  {} '/SAAS/auth/device/register'
 * @param  {} function(req
 * @param  {} res
 */
function deviceRegistration (req, res) {
  // const redirect_uri = req.query.redirect_uri
  // const scope = req.query.scope
  // const device_name = req.query.device_name
  const state = req.query.state
  // const response_type = req.query.response_type
  // const app_product_id = req.query.app_product_id
  // const type = req.query.type
  // const user_device = req.query.user_device

  const scheme = 'com.airwatch.herocard'
  const code = 'xO1MqR4XBw5z1GbZTnyG4olFjLBVal8j'
  const activationCode = 'eyJvdGEiOiIzMzkzMzY6eGZ0N1RtZ1FPSTZQZGhZNGlhd3hZVjVvMHZtU2YzRmoiLCJ1cmwiOiJodHRwczovL2V1Yy52aWRtcHJldmlldy5jb20vIiwidGlkIjoiZXVjIn0'
  const userstore = 'Userstore_6cbd9d69-a38b-441d-854e-12ea6c4215f9'

  res.redirect(`${scheme}://success?code=${code}&activation_code=${activationCode}=&state=${state}&userstore=${userstore}`)
}
/**
 * Device activation in vIDM
 * @param  {} req
 * @param  {} res
 */
function deviceActivation (req, res) {
  // /SAAS/API/1.0/REST/oauth2/activate
  // expect {
  res.status(200).json({ client_id: clientId, client_secret: clientSecret })
}

/**
 * Retrieve a JWT for use with this mock vIDM
 *
 * @param  {} '/SAAS/auth/oauthtoken'
 * @param  {} function(req,res)
 */
function userAuthToken (req, res) {
  const user = req.body.user || 'genericuser'
  const tenant = req.body.tenant || 'vmware'
  const domain = req.body.domain || 'VMWARE'
  const protocol = req.body.protocol || req.protocol
  const hostname = hostWithProxy(req)
  const host = `${protocol}://${hostname}`
  const issuer = `${host}/SAAS/auth`
  const email = req.body.email || `${user}@${domain}`
  const audience = `${host}/auth/oauthtoken`
  const expires = req.body.expires || '7d'

  const payload = {
    jti: uuidv4(),
    prn: `${user}@${tenant}`,
    domain: domain,
    eml: email,
    iss: issuer
  }
  const jwtOptions = {
    algorithm: 'RS256',
    expiresIn: expires,
    'audience': audience,
    subject: user
  }

  const token = jwt.sign(payload, privateKey, jwtOptions)
  stats.addStat(stats.NotificationTypes.token_request, 200)
  res.status(200).json({
    'token': token
  })
}

exports.verifyAuth = verifyAuth
exports.publicKeyPath = publicKeyPath
exports.privateKeyPath = privateKeyPath
exports.deviceRegistration = deviceRegistration
exports.deviceActivation = deviceActivation
exports.userAuthToken = userAuthToken
