
Add Subdomain point to IP

```
echo "IP inlanefreight.htb" | sudo tee -a /etc/hosts
```

Directory Fuzzing

```
ffuf -w /usr/shares/seclists/Discovery/Web-Content/directory-list-2.3-small.txt -u http://SERVER_IP:PORT/FUZZ
```

DNS Fuzzing

```
gobuster dns --do inlanefreight.com -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-5000.txt --wildcard
```

Sub Domain Fuzzing

```
ffuf -u http://10.10.10.5 -H "Host: FUZZ.domain" -w vhosts.txt
```

Extension Fuzzing

```
ffuf -w /usr/shares/seclists/Discovery/Web-Content/web-extensions.txt -u http://SERVER_IP:PORT/indexFUZZ
```


Page Fuzzing

```
ffuf -w /usr/shares/seclists/Discovery/Web-Content/directory-list-2.3-small.txt -u http://SERVER_IP:PORT/FUZZ.php
```


GET Parameter

```
ffuf -u "http://154.57.164.68:30875/get.php?x=FUZZ" -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc all -fc 404
```

```
curl http://IP/get.php?x=OPEN
```


POST Parameter

```
ffuf -u http://154.57.164.68:30875/post.php -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "FUZZ=FUZZ" -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200 -v
```

```
ffuf -u http://154.57.164.68:30875/post.php -X POST -H "Content-Type: application/x-www-form-urlencoded" -d "FOUND=FUZZ" -w /usr/share/seclists/Discovery/Web-Content/common.txt -mc 200 -v
```

```
curl http://154.57.164.68:30875/post.php -d "y=SUNWmc"
```

API Fuzzing

```
git clone https://github.com/PandaSt0rm/webfuzz_api.git 
cd webfuzz_api 
pip3 install -r requirements.
python3 api_fuzzer.py http://IP:PORT
```

Wordlists:

```
/usr/shares/seclists/Discovery/Web-Content/burp-parameter-names.txt
/usr/share/seclists/Discovery/Web-Content/common.txt
/usr/share/seclists/Usernames/Names/names.txt
/usr/shares/seclist/Discovery/Web-Content/directory-list-2.3-small.txt
/usr/share/seclists/Discovery/Web-Content/web-extensions.txt
```

