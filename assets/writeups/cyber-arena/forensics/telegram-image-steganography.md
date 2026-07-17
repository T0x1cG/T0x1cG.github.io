# Telegram Image Steganography

> Cyber Arena · Forensics · Public writeup

## Challenge

The supplied image appeared normal when opened, but file inspection showed additional data after the expected image structure.

## Initial analysis

Start with metadata and format-aware inspection before using broad carving tools.

```bash
file evidence.png
exiftool evidence.png
pngcheck -v evidence.png
```

The chunk listing revealed non-standard payload chunks. Their order and lengths suggested that the hidden content had been split across the image rather than appended as a single archive.

## Extract hidden chunks

1. Parse the PNG signature and each chunk header.
2. Record the chunk type, length, payload, and CRC.
3. Select the challenge-specific chunk types.
4. Reassemble their payloads in file order.
5. Identify the resulting bytes before attempting decryption.

```python
length = int.from_bytes(stream.read(4), "big")
chunk_type = stream.read(4)
chunk_data = stream.read(length)
crc = stream.read(4)
```

## Decryption

The reconstructed payload contained the parameters needed for a final symmetric decryption step. After deriving the challenge key and validating the output format, the plaintext could be recovered.

## Conclusion

Format-aware parsing was more reliable than treating the image as an opaque byte stream. Small structural anomalies often provide the shortest route through a steganography challenge.

> Cyber Arena flag and recovered secret removed from the public writeup.
