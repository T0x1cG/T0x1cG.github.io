
> Source image was not included in the archive.

> Source image was not included in the archive.

```
curl (Client URL)

 -d, --data <data> HTTP POST data 
 
 -h, --help <category> Get help for commands 
 
 -H, To set request headers, Content-Type
 
 -i, --include Include protocol response headers in the output 
 
 -I, show only the header protocol (GET Request)
 
 -o, --output <file> Same as -O but it save to specific file
 
 -O, Download the source page 
 
 -s, --silent Silent mode 
 
 -u, --user <user:password> Server user and password 
 
 -A, --user-agent <name> Send User-Agent <name> to server 
 
 -v, --verbose To view the full HTTP request and response
 
 -vvv, more verbose output than -v
 
 -k, to skip a certificate check (like website need to has a SSL certificate)
 
 -X POST, for post request and -d, to add value
 
 -b, Use with the cookie
 
 -jq, Use with the format json (What it to look in format json)
```

```
Example of Usages:

1. Use with -O
   
Command: curl -O inlanefreight.com/index.html

Output:
% Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100 464    0 464    0     0  17858      0 --:--:-- --:--:-- --:--:-- 18069
Chanserey@htb[/htb]$ ls
index.html

2. Use with -s

Command: curl -s -O inlanefreight.com/index.html

Output: No Output like above but it save to index.html directly

3. Use with -k
   
Command: curl https://inlanefreight.com

Output:
curl: (60) SSL certificate problem: Invalid certificate chain More details here: https://curl.haxx.se/docs/sslcerts.html ...SNIP...

curl -k https://www.inlanefreight.com

Output:
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN"> <html><head> ...SNIP...
   

4. Use with -v
   
Command: curl inlanefreight.com -v

Output:
* TCP_NODELAY set 
* Connected to inlanefreight.com (SERVER_IP) port 80 (#0) 
> GET / HTTP/1.1 
> Host: inlanefreight.com 
> User-Agent: curl/7.65.3 
> Accept: */* 
> Connection: close
>
* Mark bundle as not supporting multiuse 
< HTTP/1.1 401 Unauthorized
< Date: Tue, 21 Jul 2020 05:20:15 GMT
< Server: Apache/X.Y.ZZ (Ubuntu)
< WWW-Authenticate: Basic realm="Restricted Content"
< Content-Length: 464
< Content-Type: text/html; charset=iso-8859-1
<
<!DOCTYPE HTML PUBLIC "-//IETF//DTD HTML 2.0//EN">
<html><head>


5. Use with -i

Command: curl -i 154.57.164.68:31049

Output:

HTTP/1.1 200 OK

**Date**: Sun, 22 Mar 2026 12:23:24 GMT

**Server**: Apache/2.4.41 (Ubuntu)

**Vary**: Accept-Encoding

**Content-Length**: 348

**Content-Type**: text/html; charset=UTF-8

  

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

6. Use with -I
   
Command:  curl -I 154.57.164.68:31049

Output:

HTTP/1.1 200 OK

**Date**: Sun, 22 Mar 2026 12:22:55 GMT

**Server**: Apache/2.4.41 (Ubuntu)

**Content-Type**: text/html; charset=UTF-8


7. Use with -u

Command: curl -u admin:admin http://<server_ip>:<port>/
Command: curl http://admin:admin@<server_ip>:<port>/ (basic HTTP auth credentials)

8. Use with -H
   
Command: curl -H 'Authorization: Basic YWRtaW46YWRtaW4=' http://<server_ip>:<port>/

8. POST Request
   
Command: curl -X POST -d 'username=admin&password=admin' http://<SERVER_IP>:<PORT>/

Command: curl -X POST -d '{"search":"london"}' -b 'PHPSESSID=c1nsa6op7vtk7kdis7bcnbadf1' -H 'Content-Type: application/json' http://<SERVER_IP>:<PORT>/search.php (JSON Format: {"search":"ls"})

9. Use with -b

Command: curl -b 'PHPSESSID=c1nsa6op7vtk7kdis7bcnbadf1' http://<SERVER_IP>:<PORT>/
> HTB Academy exercise flag removed from the public notes.


**Request Methods**

> Source image was not included in the archive.

```
**Note:** Most modern web applications mainly rely on the `GET` and `POST` methods. However, any web application that utilizes REST APIs also rely on `PUT` and `DELETE`, which are used to update and delete data on the API endpoint, respectively. Refer to the [Introduction to Web Applications](https://academy.hackthebox.com/app/module/75) module for more details.
```

**Status Codes**

> Source image was not included in the archive.

> Source image was not included in the archive.


**Basic HTTP auth Interface**

> Source image was not included in the archive.

```
As we are using `basic HTTP auth`, we see that our HTTP request sets the `Authorization` header to `Basic YWRtaW46YWRtaW4=`, which is the base64 encoded value of `admin:admin`. If we were using a modern method of authentication (e.g. `JWT`), the `Authorization` would be of type `Bearer` and would contain a longer encrypted token.



> Source image was not included in the archive.

```
Read:

Command: curl http://<SERVER_IP>:<PORT>/api.php/city/london

Create:

Command: curl -X POST http://<SERVER_IP>:<PORT>/api.php/city/ -d '{"city_name":"HTB_City", "country_name":"HTB"}' -H 'Content-Type: application/json'

Update:

Command: curl -X PUT http://<SERVER_IP>:<PORT>/api.php/city/london -d '{"city_name":"New_HTB_City", "country_name":"HTB"}' -H 'Content-Type: application/json'

Delete:

Command: curl -X DELETE http://<SERVER_IP>:<PORT>/api.php/city/New_HTB_City
```
