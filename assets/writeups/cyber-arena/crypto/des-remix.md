# DES Remix

> Cyber Arena · Crypto · Public writeup

## Challenge

The service exposed a custom construction built from repeated DES operations. The task was to recover the hidden message by analyzing how the individual blocks were transformed.

## Vulnerability

The design mixed encryption and decryption operations without adding real entropy. Because DES has a small effective key size and the construction exposed comparable intermediate values, it could be reduced with a meet-in-the-middle strategy.

```text
forward table:  E_k1(known_plaintext)  → k1
backward step:  D_k2(known_ciphertext) → lookup
```

Instead of testing every key pair directly, the attack stores one side of the computation and searches it from the other side.

## Attack

1. Parse a known plaintext/ciphertext pair from the challenge.
2. Compute the forward DES result for each candidate first key.
3. Store each intermediate value in a lookup table.
4. Walk the second-key space in reverse.
5. Verify collisions against another block to eliminate false positives.
6. Use the recovered pair to decrypt the protected result.

```python
forward = {}
for key_one in candidate_keys:
    forward[des_encrypt(key_one, known_plaintext)] = key_one

for key_two in candidate_keys:
    middle = des_decrypt(key_two, known_ciphertext)
    if middle in forward:
        verify(forward[middle], key_two)
```

## Result

The original remote challenge endpoint was unavailable during final verification, so this public note documents the cryptanalytic path without presenting an unverified flag.

## Lesson

Composing an outdated block cipher does not automatically multiply its security. Construction details and exposed intermediate relationships matter.
