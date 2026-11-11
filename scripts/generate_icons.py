import zlib
import struct
import math
import os

def create_png(width, height, get_pixel_color):
    """
    Generate an uncompressed RGBA PNG using standard library zlib and struct.
    get_pixel_color is a function (x, y) -> (r, g, b, a)
    """
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # Filter type 0 (None)
        for x in range(width):
            r, g, b, a = get_pixel_color(x, y)
            raw_data.extend([int(r), int(g), int(b), int(a)])

    # PNG Signature
    png = b'\x89PNG\r\n\x1a\n'

    # IHDR Chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)

    # IDAT Chunk
    compressed_data = zlib.compress(bytes(raw_data), level=9)
    idat_crc = zlib.crc32(b'IDAT' + compressed_data)
    png += struct.pack('>I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('>I', idat_crc)

    # IEND Chunk
    iend_crc = zlib.crc32(b'IEND')
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)

    return png

def make_icon(size):
    # Forest Green: #244B3C (36, 75, 60)
    # Champagne Gold: #C7A878 (199, 168, 120)
    # Warm Ivory: #F7F5EF (247, 245, 239)
    # Soft Sage: #A6B49A (166, 180, 154)

    bg_r, bg_g, bg_b = 36, 75, 60
    gold_r, gold_g, gold_b = 199, 168, 120
    light_r, light_g, light_b = 247, 245, 239

    center = size / 2.0
    radius = size * 0.46
    corner_radius = size * 0.22

    # Draw rounded squircle background + luxury "V"
    def pixel(x, y):
        # Distance from center for squircle: (|x/R|^4 + |y/R|^4)^(1/4)
        nx = abs(x - center) / (size * 0.44)
        ny = abs(y - center) / (size * 0.44)
        super_dist = (nx**4 + ny**4) ** 0.25

        if super_dist > 1.05:
            return (0, 0, 0, 0) # transparent outer edge
        
        # Anti-aliasing border
        alpha = 255
        if super_dist > 0.98:
            alpha = max(0, min(255, int((1.05 - super_dist) / 0.07 * 255)))

        # Background base
        r, g, b = bg_r, bg_g, bg_b

        # Draw inner gold accent border ring
        if 0.90 <= super_dist <= 0.96:
            ring_factor = 1.0 - abs(super_dist - 0.93) / 0.03
            r = int(r * (1 - ring_factor) + gold_r * ring_factor)
            g = int(g * (1 - ring_factor) + gold_g * ring_factor)
            b = int(b * (1 - ring_factor) + gold_b * ring_factor)

        # Draw clean geometric luxury "V" in center
        # V vertices: top-left (center - 0.24*size, center - 0.22*size),
        #             top-right (center + 0.24*size, center - 0.22*size),
        #             bottom tip (center, center + 0.24*size)
        px = (x - center) / size
        py = (y - center) / size

        # Check distance to left diagonal stroke: (-0.24, -0.22) to (0.0, 0.24)
        # Check distance to right diagonal stroke: (0.0, 0.24) to (0.24, -0.22)
        # Line segment distance
        def dist_to_segment(x0, y0, x1, y1, x2, y2):
            dx = x2 - x1
            dy = y2 - y1
            l2 = dx*dx + dy*dy
            if l2 == 0:
                return math.hypot(x0 - x1, y0 - y1)
            t = max(0, min(1, ((x0 - x1)*dx + (y0 - y1)*dy) / l2))
            proj_x = x1 + t * dx
            proj_y = y1 + t * dy
            return math.hypot(x0 - proj_x, y0 - proj_y)

        d1 = dist_to_segment(px, py, -0.21, -0.20, 0.0, 0.22)
        d2 = dist_to_segment(px, py, 0.0, 0.22, 0.21, -0.20)
        min_d = min(d1, d2)

        stroke_width = 0.045 # stroke width relative to size
        if min_d < stroke_width:
            factor = 1.0
            if min_d > stroke_width - 0.008:
                factor = (stroke_width - min_d) / 0.008
            r = int(r * (1 - factor) + gold_r * factor)
            g = int(g * (1 - factor) + gold_g * factor)
            b = int(b * (1 - factor) + gold_b * factor)

        # Subtle top-left serif bar
        if py < -0.19 and py > -0.22 and abs(px - (-0.21)) < 0.035:
            r, g, b = gold_r, gold_g, gold_b
        if py < -0.19 and py > -0.22 and abs(px - 0.21) < 0.035:
            r, g, b = gold_r, gold_g, gold_b

        return (r, g, b, alpha)

    return create_png(size, size, pixel)

os.makedirs('assets', exist_ok=True)

with open('assets/icon-192.png', 'wb') as f:
    f.write(make_icon(192))
print("Generated assets/icon-192.png")

with open('assets/icon-512.png', 'wb') as f:
    f.write(make_icon(512))
print("Generated assets/icon-512.png")

with open('assets/apple-touch-icon.png', 'wb') as f:
    f.write(make_icon(180))
print("Generated assets/apple-touch-icon.png")
