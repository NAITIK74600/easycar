import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Rename or copy to .zip for easy extraction
const src = path.resolve('landing video in sequence');
const dest = path.resolve('landing_video_sequence.zip');

if (!fs.existsSync(dest)) {
  fs.copyFileSync(src, dest);
  console.log('Copied to landing_video_sequence.zip');
}

// Check with PowerShell ZipFile
const script = `
Add-Type -AssemblyName System.IO.Compression.FileSystem
$z = [System.IO.Compression.ZipFile]::OpenRead('${dest.replace(/\\/g, '\\\\')}')
Write-Host "Total entries in sequence zip: $($z.Entries.Count)"
$first = $z.Entries | Select-Object -First 25
foreach ($item in $first) {
  Write-Host "$($item.FullName) - $($item.Length) bytes"
}
$z.Dispose()
`;

fs.writeFileSync('temp_inspect.ps1', script, 'utf-8');
const out = execSync('powershell -ExecutionPolicy Bypass -File temp_inspect.ps1').toString();
console.log(out);
fs.unlinkSync('temp_inspect.ps1');
