# Photo Ransomware Memory Investigation

> Cyber Arena · Misc · Public writeup

## Scenario

The challenge combined a password-protected evidence package, a memory capture, suspicious ransomware behavior, and an encrypted photo archive. The objective was to reconstruct the execution chain and recover the protected evidence.

## Evidence handling

Work from copies and preserve hashes before extracting or mounting supplied evidence.

```bash
sha256sum evidence-package.zip memory.raw suspicious.bin
file memory.raw suspicious.bin
```

## Memory analysis

1. Identify the operating-system profile and active processes.
2. Review parent/child process relationships around the suspected execution time.
3. Inspect command lines, handles, network artifacts, and injected memory regions.
4. Extract the suspicious process or relevant memory segment for offline review.
5. Correlate timestamps with modified or encrypted files.

## Ransomware analysis

Static inspection of the extracted binary showed that its key material was assembled at runtime from an embedded value and timestamp-derived data. Memory artifacts retained enough of that state to reconstruct the decryption input.

## Recovery

After validating the recovered parameters against a known file header, the encrypted archive could be restored and checked without executing the ransomware sample.

```text
memory timeline → process state → derived key material → archive validation
```

## Safety note

The public repository does not include the original memory images, executable samples, archive passwords, derived keys, or extracted credentials. Unknown binaries should remain isolated and must not be executed on a normal workstation.

> Cyber Arena flag and all recovered secrets removed from the public writeup.
