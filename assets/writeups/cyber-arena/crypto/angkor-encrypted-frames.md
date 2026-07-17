# Angkor Encrypted Frames

> Cyber Arena · Crypto · Public writeup

## Challenge

The challenge supplied multiple encrypted image frames. The encryption looked different for each file, but the construction reused stream-cipher material across more than one frame.

## Vulnerability

For a stream cipher, encryption can be written as:

```text
ciphertext = plaintext XOR keystream
```

If two messages reuse the same keystream, XORing their ciphertexts cancels it:

```text
C1 XOR C2 = P1 XOR P2
```

Image formats contain predictable headers and repeated structure, so a likely plaintext segment can reveal the corresponding keystream bytes.

## Recovery process

1. Group ciphertexts by size and compare pairs for signs of keystream reuse.
2. XOR candidate pairs and look for structured output rather than random noise.
3. Use known image-header bytes as a crib.
4. Recover the reused keystream segment.
5. XOR that segment against the target ciphertext and validate the reconstructed image.

```python
def xor_bytes(left, right):
    return bytes(a ^ b for a, b in zip(left, right))

keystream = xor_bytes(ciphertext_fragment, known_plaintext)
recovered = xor_bytes(target_ciphertext, keystream)
```

## Lesson

Never reuse a nonce or keystream with a stream cipher. A strong primitive cannot protect a construction that repeats its encryption state.

> Cyber Arena flag removed from the public writeup.
