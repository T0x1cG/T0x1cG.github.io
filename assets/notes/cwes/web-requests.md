# Web Requests and cURL

`cURL` is a command-line HTTP client used to send requests, inspect responses, test authentication, and interact with APIs.

## Common cURL options

| Option | Purpose |
| --- | --- |
| `-d`, `--data` | Send data in the request body. |
| `-h`, `--help` | Display command help. |
| `-H`, `--header` | Add a request header such as `Content-Type`. |
| `-i`, `--include` | Include response headers with the response body. |
| `-I`, `--head` | Request response headers only. |
| `-o`, `--output` | Save the response using a chosen filename. |
| `-O`, `--remote-name` | Save the response using its remote filename. |
| `-s`, `--silent` | Hide progress and error output. |
| `-u`, `--user` | Supply authentication credentials. |
| `-A`, `--user-agent` | Set the `User-Agent` header. |
| `-v`, `--verbose` | Show detailed request and response information. |
| `-k`, `--insecure` | Skip TLS certificate verification in an authorized lab. |
| `-X`, `--request` | Select an HTTP method such as `POST` or `DELETE`. |
| `-b`, `--cookie` | Send cookies with the request. |

## Practical examples

### 1. Download a file with `-O`

```bash
curl -O http://inlanefreight.com/index.html
```

Example output:

```text
% Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                               Dload  Upload   Total   Spent    Left  Speed
100  464   100  464      0     0      17858      0 --:--:-- --:--:-- --:--:-- 18069

$ ls
index.html
```

### 2. Download silently with `-s`

```bash
curl -s -O http://inlanefreight.com/index.html
```

The file is saved without displaying the progress meter.

### 3. Skip certificate verification with `-k`

Without `-k`, an invalid certificate may produce an error:

```bash
curl https://inlanefreight.com
```

```text
curl: (60) SSL certificate problem: Invalid certificate chain
```

For an authorized lab with a known self-signed or invalid certificate:

```bash
curl -k https://inlanefreight.com
```

> Certificate verification should not be disabled for ordinary production traffic.

### 4. Inspect a request with `-v`

```bash
curl -v http://inlanefreight.com
```

Example output:

```http
* Connected to inlanefreight.com (SERVER_IP) port 80
> GET / HTTP/1.1
> Host: inlanefreight.com
> User-Agent: curl/7.65.3
> Accept: */*
> Connection: close
>
< HTTP/1.1 401 Unauthorized
< Date: Tue, 21 Jul 2020 05:20:15 GMT
< Server: Apache/X.Y.ZZ (Ubuntu)
< WWW-Authenticate: Basic realm="Restricted Content"
< Content-Length: 464
< Content-Type: text/html; charset=iso-8859-1
<
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html>
  <head>...</head>
</html>
```

Lines beginning with `>` are request data. Lines beginning with `<` are response data.

### 5. Include response headers with `-i`

```bash
curl -i http://154.57.164.68:31049
```

Example output:

```http
HTTP/1.1 200 OK
Date: Sun, 22 Mar 2026 12:23:24 GMT
Server: Apache/2.4.41 (Ubuntu)
Vary: Accept-Encoding
Content-Length: 348
Content-Type: text/html; charset=UTF-8

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blank Page</title>
  </head>
  <body>
    This page is intentionally left blank.
    <br>
    Using cURL should be enough.
  </body>
</html>
```

### 6. Request headers only with `-I`

```bash
curl -I http://154.57.164.68:31049
```

Example output:

```http
HTTP/1.1 200 OK
Date: Sun, 22 Mar 2026 12:22:55 GMT
Server: Apache/2.4.41 (Ubuntu)
Content-Type: text/html; charset=UTF-8
```

### 7. Send Basic Authentication with `-u`

```bash
curl -u admin:admin http://SERVER_IP:PORT/
```

Credentials can also be included in the URL, although `-u` is clearer:

```bash
curl http://admin:admin@SERVER_IP:PORT/
```

### 8. Add a custom header with `-H`

```bash
curl -H 'Authorization: Basic YWRtaW46YWRtaW4=' http://SERVER_IP:PORT/
```

`YWRtaW46YWRtaW4=` is the Base64 representation of the lab credential `admin:admin`. Base64 is encoding, not encryption.

### 9. Send POST data

Form-encoded data:

```bash
curl -X POST \
  -d 'username=admin&password=admin' \
  http://SERVER_IP:PORT/
```

JSON data with an existing session cookie:

```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -b 'PHPSESSID=SESSION_VALUE' \
  -d '{"search":"london"}' \
  http://SERVER_IP:PORT/search.php
```

### 10. Send a cookie with `-b`

```bash
curl -b 'PHPSESSID=SESSION_VALUE' http://SERVER_IP:PORT/
```

> HTB Academy exercise flags are removed from the public notes.

## HTTP request methods

| Method | Common purpose |
| --- | --- |
| `GET` | Read a resource. |
| `POST` | Create a resource or submit data. |
| `PUT` | Replace or update a resource. |
| `PATCH` | Partially update a resource. |
| `DELETE` | Remove a resource. |

Modern web applications commonly use `GET` and `POST`. REST APIs also frequently use `PUT`, `PATCH`, and `DELETE`.

## Basic HTTP Authentication

With Basic Authentication, the client sends an `Authorization` header:

```http
Authorization: Basic YWRtaW46YWRtaW4=
```

The value contains Base64-encoded `username:password` data. HTTPS is required to protect it while in transit. Token-based authentication commonly uses a different scheme:

```http
Authorization: Bearer TOKEN_VALUE
```

## REST API CRUD examples

### Read

```bash
curl http://SERVER_IP:PORT/api.php/city/london
```

### Create

```bash
curl -X POST \
  -H 'Content-Type: application/json' \
  -d '{"city_name":"HTB_City","country_name":"HTB"}' \
  http://SERVER_IP:PORT/api.php/city/
```

### Update

```bash
curl -X PUT \
  -H 'Content-Type: application/json' \
  -d '{"city_name":"New_HTB_City","country_name":"HTB"}' \
  http://SERVER_IP:PORT/api.php/city/london
```

### Delete

```bash
curl -X DELETE http://SERVER_IP:PORT/api.php/city/New_HTB_City
```
