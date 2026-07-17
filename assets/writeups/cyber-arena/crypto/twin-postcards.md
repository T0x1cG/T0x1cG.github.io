# Digital Angkor Wat Postcard

> Cyber Arena · Crypto · Public writeup

## Challenge

The challenge combined an RSA-protected AES key, an AES-CTR encrypted image, and several RSA ciphertexts containing the same final message.

## Vulnerability summary

Two independent RSA weaknesses were present:

- One RSA prime disclosed most of its high bits, leaving a small unknown suffix.
- The same message was encrypted three or more times with exponent `e = 3` under different coprime moduli and without randomized padding.

## Recover the RSA prime

The partial prime can be modeled as:

```text
p = known_high_bits × 2^unknown_bits + x
```

Because `x` is small, Coppersmith's small-root method can recover it from the polynomial relationship modulo `n`. Once `p` is known, factor `n`, compute the private exponent, and decrypt the AES key.

## Rebuild the postcard

Decrypt the payload with AES-CTR using the recovered key and challenge nonce. Split the raw RGB bytes from the appended ciphertext records, then reconstruct the image using the supplied dimensions.

```python
cipher = AES.new(key, AES.MODE_CTR, nonce=nonce)
payload = cipher.decrypt(encrypted_payload)
image_bytes = payload[:width * height * 3]
```

## Recover the repeated message

For the low-exponent broadcasts, combine the ciphertexts with the Chinese Remainder Theorem. The combined value is the exact integer cube of the message when no modular wrap remains.

```text
M = CRT(c1, c2, c3, ...)
m = integer_cube_root(M)
```

## Why the challenge breaks

Partial RSA prime disclosure can be enough for factorization, and textbook RSA must never encrypt the same small message across moduli without randomized padding.

> Cyber Arena flag, private key material, and solver-specific constants removed from the public writeup.
