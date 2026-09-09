import unittest
from pathlib import Path
import xml.etree.ElementTree as ET

from sanitize_rank_svg import sanitize_svg


class RankSvgSecurityTests(unittest.TestCase):
    def svg(self, inner="", attributes=""):
        return f'<svg xmlns="http://www.w3.org/2000/svg" {attributes}>{inner}</svg>'.encode()

    def test_current_artwork_remains_valid(self):
        artwork = Path(__file__).resolve().parents[1] / "data/htb-rank.svg"
        clean = sanitize_svg(artwork.read_bytes())
        self.assertIn(b"<path", clean)
        self.assertEqual(sanitize_svg(clean), clean)

    def test_local_gradient_references_are_allowed(self):
        clean = sanitize_svg(self.svg('<defs><linearGradient id="g"><stop stop-color="#fff"/></linearGradient></defs><path fill="url(#g)" d="M0 0"/>'))
        self.assertIn(b"url(#g)", clean)

    def test_active_content_is_rejected(self):
        fixtures = [
            self.svg('<script>alert(1)</script>'),
            self.svg(attributes='onload="alert(1)"'),
            self.svg('<foreignObject><div xmlns="http://www.w3.org/1999/xhtml">HTML</div></foreignObject>'),
            self.svg('<animate attributeName="href" values="javascript:alert(1)"/>'),
            self.svg('<use href="https://example.invalid/image.svg#x"/>'),
            self.svg('<path style="fill:red"/>'),
            self.svg('<style>@import "https://example.invalid/";</style>'),
            self.svg('<path fill="url(https://example.invalid/image)"/>'),
            self.svg('<path fill="u\\72l(https://example.invalid/image)"/>'),
            self.svg('<path xmlns="http://www.w3.org/1999/xhtml"/>'),
            self.svg('<path xmlns:x="http://www.w3.org/1999/xlink" x:href="#x"/>'),
            self.svg('<path clip-path="url(https://example.invalid/)"/>'),
            self.svg('<path><svg onload="alert(1)"/></path>'),
            b'<!DOCTYPE svg [<!ENTITY x "test">]>' + self.svg('&x;'),
            b'<?xml-stylesheet href="https://example.invalid/style"?>' + self.svg(),
            b'<svg xmlns="http://www.w3.org/2000/svg"><path>',
            self.svg().decode().encode("utf-16"),
        ]
        for fixture in fixtures:
            with self.subTest(fixture=fixture):
                with self.assertRaises((ValueError, UnicodeError, ET.ParseError)):
                    sanitize_svg(fixture)

    def test_size_and_complexity_limits(self):
        for fixture in [b"", b"x" * 1_048_577, self.svg("<g>" * 34 + "</g>" * 34), self.svg("<path/>" * 5001)]:
            with self.subTest(size=len(fixture)):
                with self.assertRaises(ValueError):
                    sanitize_svg(fixture)


if __name__ == "__main__":
    unittest.main()
