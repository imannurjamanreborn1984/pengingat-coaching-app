const fs = require('fs');
const path = require('path');

const seedData = require('../lib/data/seed_14_akar.json');

function updateRootsFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log('File not found:', filePath);
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');

  seedData.forEach(item => {
    const rootId = `root-${item.id}`;
    // Build the new sainsEpigenetika entry object
    const newSainsEntry = `    sainsEpigenetika: [
      {
        id: 's-${item.id}-1',
        title: ${JSON.stringify(item.judul_temuan)},
        field: ${JSON.stringify(item.kategori)},
        summary: ${JSON.stringify(item.deskripsi_singkat)},
        mechanism: ${JSON.stringify(item.jalur_mekanisme_biologis)},
        sourceCitation: ${JSON.stringify(item.sumber_jurnal)},
        tags: [${JSON.stringify(item.kategori)}, ${JSON.stringify(item.kode)}],
      },
    ],`;

    // Regex to match sainsEpigenetika: [ ... ], inside the respective root block
    // We find the block starting from id: 'root-X' up to kitakKearifan:
    const regex = new RegExp(`(id:\\s*['"]${rootId}['"][\\s\\S]*?)(sainsEpigenetika:\\s*\\[[\\s\\S]*?\\],)(\\s*kitabKearifan:)`, 'm');

    if (regex.test(content)) {
      content = content.replace(regex, `$1${newSainsEntry}$3`);
      console.log(`✅ Updated sainsEpigenetika for ${rootId} in ${path.basename(filePath)}`);
    } else {
      console.warn(`⚠️ Could not match pattern for ${rootId} in ${path.basename(filePath)}`);
    }
  });

  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Saved updated file:', filePath);
}

// Update both projects
updateRootsFile(path.join(__dirname, '..', 'lib', 'data', 'rootsData.js'));
updateRootsFile(path.join('d:', 'project', 'buku-saku-akar-spiritual', 'src', 'data', 'rootsData.ts'));
