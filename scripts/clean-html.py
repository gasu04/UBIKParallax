#!/usr/bin/env python3
"""Clean dev-only scripts from the built index.html for production deployment."""
import re
import sys
import os

build_dir = sys.argv[1] if len(sys.argv) > 1 else "dist/public"
index_path = os.path.join(build_dir, index_file := "index.html")

if not os.path.exists(index_path):
    print(f"No {index_path} found, skipping cleanup.")
    sys.exit(0)

with open(index_path) as f:
    html = f.read()

original_size = len(html)

# Remove all inline <script>...</script> blocks containing 'manus'
parts = []
i = 0
while i < len(html):
    script_start = html.find('<script', i)
    if script_start == -1:
        parts.append(html[i:])
        break
    parts.append(html[i:script_start])
    close_bracket = html.find('>', script_start)
    if close_bracket == -1:
        parts.append(html[script_start:])
        break
    tag_header = html[script_start:close_bracket+1]
    end_script = html.find('</script>', close_bracket)
    if end_script == -1:
        # No closing tag — check if manus is in the tag header
        if 'manus' in tag_header.lower():
            break  # drop everything from here
        parts.append(html[script_start:])
        break
    full_script = html[script_start:end_script + len('</script>')]
    if 'manus' in full_script.lower():
        i = end_script + len('</script>')
        continue
    parts.append(full_script)
    i = end_script + len('</script>')

html = ''.join(parts)

# Remove analytics scripts
html = re.sub(r'<script[^>]*umami[^>]*></script>\s*', '', html)

# Clean up excessive whitespace
html = re.sub(r'\n\s*\n\s*\n', '\n\n', html)

with open(index_path, 'w') as f:
    f.write(html)

print(f"Cleaned {index_path}: {original_size:,} -> {len(html):,} bytes")
print(f"Remaining 'manus' references: {html.lower().count('manus')}")
