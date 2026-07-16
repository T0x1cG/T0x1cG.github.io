
To Run Javascript code

```
https://jsconsole.com
```

To Obfuscate the code

```
http://beautifytools.com/javascript-obfuscator.php
https://jsfuck.com
```

To Deobfuscate the code

```
https://thanhle.io.vn/de4js/ (Github)
https://matthewfl.com/unPacker.html (Unpacker)
https://prettier.io/playground/ (Prettier)
https://beautifier.io/ (Beautify Code)
```


Encode to base64

```
echo https://www.hackthebox.eu/ | base64
```

Decode to base64

```
echo aHR0cHM6Ly93d3cuaGFja3RoZWJveC5ldS8K | base64 -d
```

Hex Encode

```
echo https://www.hackthebox.eu/ | xxd -p
```

Hex Decode

```
echo 68747470733a2f2f7777772e6861636b746865626f782e65752f0a | xxd -p -r
```

ROT13 Encode

```
echo https://www.hackthebox.eu/ | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```

ROT13 Decode

```
echo uggcf://jjj.unpxgurobk.rh/ | tr 'A-Za-z' 'N-ZA-Mn-za-m'
```



Skill Assements

```
Target: 154.57.164.68:31888
```

```
View Page Source and found this endpoint: app.min.js

And inside app.min.js it contain the javascript code that has been obfuscation:
```

```
eval(function (p, a, c, k, e, d) { e = function (c) { return c.toString(36) }; if (!''.replace(/^/, String)) { while (c--) { d[c.toString(a)] = k[c] || c.toString(a) } k = [function (e) { return d[e] }]; e = function () { return '\\w+' }; c = 1 }; while (c--) { if (k[c]) { p = p.replace(new RegExp('\\b' + e(c) + '\\b', 'g'), k[c]) } } return p }('t 5(){6 7=\'1{n\'+\'8\'+\'9\'+\'a\'+\'b\'+\'c!\'+\'}\',0=d e(),2=\'/4\'+\'.g\';0[\'f\'](\'i\',2,!![]),0[\'k\'](l)}m[\'o\'](\'1{j\'+\'p\'+\'q\'+\'r\'+\'s\'+\'h\'+\'3}\');', 30, 30, 'xhr|HTB|_0x437f8b|k3y|keys|apiKeys|var|flag|3v3r_|run_0|bfu5c|473d_|c0d3|new|XMLHttpRequest|open|php|n_15_|POST||send|null|console||log|4v45c|r1p7_|3num3|r4710|function'.split('|'), 0, {}))
```

```
So I use this website to deobfuscation: https://thanhle.io.vn/de4js/

And here is the output:

function apiKeys() {
    var flag = '[HTB exercise flag removed]',
        xhr = new XMLHttpRequest(),
        _0x437f8b = '/keys' + '.php';
    xhr['open']('POST', _0x437f8b, !![]), xhr['send'](null)
}
console['log']('[HTB exercise flag removed]');
```

```
After reading the code I need to send the POST to /keys.php

Command: curl 154.57.164.68:31888/keys.php -X POST

Output: 4150495f70336e5f37333537316e365f31355f66756e

Next, try to decode the hex

Command: echo "4150495f70336e5f37333537316e365f31355f66756e" | xxd -p -r

Output: API_p3n_73571n6_15_fun

Last, I need to send POST with the key value

Command: curl 154.57.164.68:31888/keys.php -X POST -d "key=API_p3n_73571n6_15_fun"

Output: [HTB exercise flag removed]
```
