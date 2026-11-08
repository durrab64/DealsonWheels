const fs = require('fs');

// Read the file
const content = fs.readFileSync('src/index.css', 'utf8');

// Find the first null character
const nullIndex = content.indexOf('\u0000');

if (nullIndex !== -1) {
    // Keep only content before null characters
    const cleanContent = content.substring(0, nullIndex);
    fs.writeFileSync('src/index.css', cleanContent, 'utf8');
    console.log('Fixed CSS file - removed null characters at position', nullIndex);
} else {
    console.log('No null characters found');
}
