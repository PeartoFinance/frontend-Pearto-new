const fs = require('fs');
const path = require('path');

const dir = './src/app';

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(function (file) {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('page.tsx')) results.push(file);
        }
    });
    return results;
}

const files = walk(dir);
let changedCount = 0;

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');

    // Skip if already has Footer
    if (content.includes('<Footer') || content.includes('Footer />') || content.match(/import\s+(\{?\s*Footer\s*\}?|\w+)\s+from\s+['"].*Footer['"]/)) {
        continue;
    }
    // Also skip layout files if we found them (we only search page.tsx but just in case)
    if (file.includes('layout.tsx')) continue;

    // Check if it has </main>
    if (content.includes('</main>')) {
        content = content.replace('</main>', '  <Footer />\n      </main>');
    }
    // Check if it has </main > (with space)
    else if (content.includes('</main >')) {
        content = content.replace('</main >', '  <Footer />\n      </main>');
    }
    // Fallback: look for </div> at the end of the return statement
    else {
        content = content.replace(/<\/div>([^<]*)$/, '  <Footer />\n    </div>$1');
        // If nothing changed, we might have failed the regex.
    }

    // Add import statement near other local component imports
    const lastImportIndex = content.lastIndexOf('import ');
    if (lastImportIndex > -1) {
        const endOfLine = content.indexOf('\n', lastImportIndex);
        content = content.substring(0, endOfLine + 1) + "import Footer from '@/components/layout/Footer';\n" + content.substring(endOfLine + 1);
    } else {
        content = "import Footer from '@/components/layout/Footer';\n" + content;
    }

    fs.writeFileSync(file, content);
    console.log(`Added Footer to ${file}`);
    changedCount++;
}

console.log(`Total changed: ${changedCount}`);
