# Space Temu AES

> Cyber Arena · Crypto · Public writeup

## Challenge

The challenge advertised AES-like protection, but its encryption routine was a home-built substitution-and-XOR design. Known plaintext/ciphertext samples were available alongside an encrypted flag.

## Analysis

The routine applied deterministic transformations with a repeating key schedule. There was no secure mode of operation, no random nonce, and no authentication tag. That made the output predictable under known plaintext.

```text
known plaintext XOR known ciphertext → repeated transformation material
```

## Attack

1. Recreate the challenge's byte substitution exactly.
2. Feed the known sample through the inverse transform.
3. Recover the repeating key material from corresponding byte positions.
4. Confirm the recovered period against every known sample.
5. Apply the inverse routine to the encrypted target.

```python
def recover_repeating_material(plain, cipher):
    return bytes(p ^ c for p, c in zip(plain, cipher))

def repeat_to_length(value, length):
    return (value * ((length // len(value)) + 1))[:length]
```

## Vulnerability

The algorithm borrowed AES terminology but did not preserve AES security properties. Predictable reversible layers and repeated key material turned a known-plaintext sample into a practical decryption oracle.

## Lesson

Use reviewed primitives through established libraries. A custom cipher can look complex while still leaking exactly the relationship an attacker needs.

> Cyber Arena flag and recovered challenge key removed from the public writeup.
