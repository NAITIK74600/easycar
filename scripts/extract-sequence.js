import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const destDir = path.resolve('public/sequences/audi-hero');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

console.log('Extracting frames from landing_video_sequence.zip to public/sequences/audi-hero...');

const script = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zip = [System.IO.Compression.ZipFile]::OpenRead('landing_video_sequence.zip')
$targetDir = Resolve-Path 'public/sequences/audi-hero'

Write-Host "Extracting $($zip.Entries.Count) items..."
foreach ($entry in $zip.Entries) {
    if ([string]::IsNullOrEmpty($entry.Name)) { continue } # skip folders
    $destFile = Join-Path $targetDir $entry.Name
    if (-not (Test-Path $destFile)) {
        [System.IO.Compression.ZipFileExtensions]::ExtractToFile($entry, $destFile, $true)
    }
}
$zip.Dispose()
Write-Host "Extraction complete!"
`;

fs.writeFileSync('temp_extract.ps1', script, 'utf-8');
const out = execSync('powershell -ExecutionPolicy Bypass -File temp_extract.ps1', { maxBuffer: 1024 * 1024 * 50 }).toString();
console.log(out);
fs.unlinkSync('temp_extract.ps1');

// Count files in public/sequences/audi-hero
const files = fs.readdirSync(destDir).filter(f => f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.png'));
console.log(`Extracted ${files.length} frames.`);
files.sort((a, b) => {
  const numA = parseInt(a.replace(/\D/g, ''), 10);
  const numB = parseInt(b.replace(/\D/g, ''), 10);
  return numA - numB;
});
console.log('First frame:', files[0]);
console.log('Last frame:', files[files.length - 1]);
