import codecs

# Read the file and remove null characters
with open('src/index.css', 'rb') as f:
    content = f.read()

# Find the first null byte
null_index = content.find(b'\x00')
if null_index != -1:
    # Keep only content before null bytes
    content = content[:null_index]

# Write back as UTF-8
with open('src/index.css', 'wb') as f:
    f.write(content)

print("Fixed CSS file - removed null characters")
