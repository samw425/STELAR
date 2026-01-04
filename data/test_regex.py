import re

with open('billboard_dump.html', 'r', encoding='utf-8') as f:
    html = f.read()

print(f"Loaded HTML: {len(html)} bytes")

# Test Split
soup_blocks = re.split(r'<div class="o-chart-results-list-row-container">', html)
print(f"Found {len(soup_blocks) - 1} blocks")

if len(soup_blocks) > 1:
    block = soup_blocks[1]
    print(f"--- BLOCK 1 PREVIEW ---\n{block[:500]}...\n-----------------------")

    # Test Rank
    # Fix: Allow optional attributes/spaces after class
    rank_match = re.search(r'<span class="c-label[^"]*"[^>]*>\s*(\d+)\s*</span>', block)
    if rank_match:
        print(f"MATCH RANK: {rank_match.group(1)}")
    else:
        print("FAIL RANK")

    # Test Name
    name_match = re.search(r'<h3[^>]*id="title-of-a-story"[^>]*>(.*?)</h3>', block, re.DOTALL)
    if name_match:
        raw = name_match.group(1)
        clean = re.sub(r'<[^>]+>', '', raw).strip()
        clean = re.sub(r'\s+', ' ', clean).strip()
        print(f"MATCH NAME: '{clean}'")
    else:
        print("FAIL NAME")
