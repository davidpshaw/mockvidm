## Mock vIDM Connector for WS1 Hub Performance Testing

In order to test Mobile Flows Approvals and the performance of their interactions with WS1 Intelligent Hub Notificatons, we need a mock vIDM instance that supports the following Capabilites:

### JWT retrieval Endpoint
**Endpoint:** `POST` on `/SAAS/auth/oauthtoken` for getting a JWT that can be used to post notifications

```
curl -X POST \
  http://localhost:8080/SAAS/auth/oauthtoken \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
	"user":"shawd",
	"tenant":"VMWARE",
	"domain":"vmware.com",
	"protocol":"https",
	"email":"shawd@vmware.com"
}'
```

Note that `user` and `domain` are required.  The fields `tenant`, `domain`, `protocol` and `email` exist if you wish to overrided their values.  If `email` is not specified, then the `eml` claim becomes `user@domain`.

### Public Key Retrieval Endpoint
**Endpoint:** `GET` on `/SAAS/API/1.0/REST/auth/token` for retrieving the public key used to sign JWTs, if needed by a third-party system

```
curl -X GET \
  http://localhost:8080/SAAS/API/1.0/REST/auth/token \
  -H 'Cache-Control: no-cache'
```

### Notifications Endpoint
**Endpoint:** `POST` on `/ws1notifications/api/v1/notifications` for posting WS1 Hub notifications (cards) 

```
curl -X POST \
  http://localhost:8080/ws1notifications/api/v1/notifications \
  -H 'Authorization: Bearer fakeVidmJWTtokenHere' \
  -H 'Cache-Control: no-cache' \
  -H 'Content-Type: application/json' \
  -d '{
    "id": "97649f99-8a1f-48bd-9f91-af7ba4f3ca5a",
    "creation_date": "2019-02-06T18:56:20Z",
    "header": {
        "title": "Sample Notification",
        "subtitle": []
    },
    "body": {},
    "actions": []
}'
```

### List Error Logfiles
**Endpoint:** `GET` on `/logs` for retrieving the list of available logfiles

```
curl -X GET \
  http://localhost:8080/logs \
  -H 'Cache-Control: no-cache'
```

### Retrieve Error Logfile
**Endpoint:** `GET` on `/logs/:logFileName` for retrieving a specific logfile

```
curl -X GET \
  http://localhost:8080/logs/current \
  -H 'Cache-Control: no-cache'
```

Note: You can use `current` to get the current logfile, or specify a filename retrieved via the **List Error Logfiles** endpoint above.  Log files are rotated when they exceed 1MB in file size.  A **maximum of 10 logfiles** will be kept.

Note: we only log errors now.  Successful responses are only tracked in the Statistics Retrieval (below)


### Statistics Retrieval
**Endpoint:** `GET` on `/stats` for retrieving statistics on interactions with the server

```
curl -X GET \
  http://localhost:8080/stats \
  -H 'Cache-Control: no-cache'
```

Example response:

```
{
    "lastReset": "2019-02-07T16:30:31.687Z",
    "total": {
        "public_key_200": 7,
        "token_request_400": 1,
        "token_request_200": 21,
        "notification_total_requests": 4,
        "notification_201": 2,
        "notification_401": 1,
        "notification_error": 2,
        "notification_400": 1
    }
}
```

### Statistics Reset
**Endpoint:** `DELETE` on `/stats` for resetting statistics on interactions with the server

```
curl -X DELETE \
  http://localhost:8080/stats \
  -H 'Cache-Control: no-cache'
```

Note using the `DELETE` verb will remove all stats.