"""Accept only inert SVG geometry before publishing third-party rank artwork."""

import re
import sys
from pathlib import Path
import xml.etree.ElementTree as ET

SVG_NS = "http://www.w3.org/2000/svg"
TAGS = {
    "svg", "g", "path", "rect", "circle", "ellipse", "line", "polyline",
    "polygon", "defs", "linearGradient", "radialGradient", "stop", "clipPath",
}
ATTRIBUTES = {
    "id", "viewBox", "width", "height", "x", "y", "x1", "x2", "y1", "y2",
    "cx", "cy", "r", "rx", "ry", "fx", "fy", "d", "points", "transform",
    "fill", "fill-rule", "fill-opacity", "stroke", "stroke-width",
    "stroke-linecap", "stroke-linejoin", "stroke-miterlimit", "stroke-opacity",
    "stroke-dasharray", "stroke-dashoffset", "opacity", "clip-path", "clip-rule",
    "gradientUnits", "gradientTransform", "spreadMethod", "offset", "stop-color",
    "stop-opacity", "preserveAspectRatio", "version", "clipPathUnits",
}
PAINT = re.compile(r"(?:#[0-9a-fA-F]{3,8}|[a-zA-Z]+|url\(#[A-Za-z_][\w.-]*\))\Z")
FRAGMENT = re.compile(r"(?:none|url\(#[A-Za-z_][\w.-]*\))\Z")


def sanitize_svg(source: bytes) -> bytes:
    if not source or len(source) > 1_048_576:
        raise ValueError("SVG must be nonempty and no larger than 1 MiB")
    text = source.decode("utf-8-sig")
    # Exclude entities, DTDs, comments, and processing instructions before parsing.
    text = re.sub(r"^\s*<\?xml\s+[^?]*\?>", "", text, count=1)
    if "<!" in text or "<?" in text or "\x00" in text:
        raise ValueError("SVG declarations and processing instructions are not allowed")
    root = ET.fromstring(text)
    if root.tag != f"{{{SVG_NS}}}svg":
        raise ValueError("Expected an SVG root element")
    pending = [(root, 0)]
    count = 0
    while pending:
        element, depth = pending.pop()
        count += 1
        if depth > 32 or count > 5000:
            raise ValueError("SVG complexity limit exceeded")
        if element.tag not in {f"{{{SVG_NS}}}{tag}" for tag in TAGS}:
            raise ValueError("SVG contains an unsupported element")
        if (element.text or "").strip() or (element.tail or "").strip():
            raise ValueError("Only SVG geometry is allowed")
        for name, value in element.attrib.items():
            if name not in ATTRIBUTES:
                raise ValueError("SVG contains an unsupported attribute")
            if name in {"fill", "stroke", "stop-color"} and not PAINT.fullmatch(value):
                raise ValueError("SVG paint must be a color or local fragment")
            if name == "clip-path" and not FRAGMENT.fullmatch(value):
                raise ValueError("SVG clipping must use a local fragment")
        pending.extend((child, depth + 1) for child in element)
    ET.register_namespace("", SVG_NS)
    return ET.tostring(root, encoding="utf-8") + b"\n"


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit("Usage: sanitize_rank_svg.py INPUT OUTPUT")
    try:
        clean = sanitize_svg(Path(sys.argv[1]).read_bytes())
    except (ValueError, UnicodeError, ET.ParseError) as error:
        sys.exit(f"Rejected rank artwork: {error}")
    Path(sys.argv[2]).write_bytes(clean)
