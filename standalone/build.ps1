# Builds the standalone "lingua-franca" skill (folder + zip) from this repo, so it never drifts from the kit.
# Usage: powershell -File standalone\build.ps1 [-Out <folder>]     (default: dist\)
# Result: <Out>\lingua-franca\{SKILL.md, references\DESIGN.md, references\formats.md} and <Out>\lingua-franca.zip (SKILL.md at the zip root)
param([string]$Out = (Join-Path (Split-Path $PSScriptRoot) "dist"))
$ErrorActionPreference = "Stop"
$repo = Split-Path $PSScriptRoot
$dst = Join-Path $Out "lingua-franca"
if (Test-Path $dst) { Remove-Item -Recurse -Force $dst }
New-Item -ItemType Directory -Force (Join-Path $dst "references") | Out-Null
Copy-Item (Join-Path $PSScriptRoot "SKILL.md") (Join-Path $dst "SKILL.md")
$design = (Get-Content -Raw -Encoding utf8 (Join-Path $repo "DESIGN.md")).Replace("``llms.txt``", "``formats.md``")
[IO.File]::WriteAllText((Join-Path $dst "references\DESIGN.md"), $design, (New-Object Text.UTF8Encoding $false))
Copy-Item (Join-Path $repo "llms.txt") (Join-Path $dst "references\formats.md")
Add-Type -AssemblyName System.IO.Compression, System.IO.Compression.FileSystem
$zip = Join-Path $Out "lingua-franca.zip"
if (Test-Path $zip) { Remove-Item -Force $zip }
$z = [IO.Compression.ZipFile]::Open($zip, "Create")
Get-ChildItem -Recurse -File $dst | ForEach-Object {
  $rel = $_.FullName.Substring($dst.Length + 1).Replace("\", "/")
  [void][IO.Compression.ZipFileExtensions]::CreateEntryFromFile($z, $_.FullName, $rel)
}
$z.Dispose()
"Built $dst and $zip"
