$targetDirs = @("d:\scheduler-mycelium\scheduler-mycelium-fe\app", "d:\scheduler-mycelium\scheduler-mycelium-fe\components")

foreach ($dir in $targetDirs) {
    Get-ChildItem -Path $dir -Recurse -Include *.tsx,*.ts,*.css | ForEach-Object {
        $content = [System.IO.File]::ReadAllText($_.FullName)
        
        $newContent = $content -replace "blue-50", "gray-50" `
                               -replace "blue-100", "gray-100" `
                               -replace "blue-200", "gray-200" `
                               -replace "blue-300", "gray-300" `
                               -replace "blue-400", "gray-400" `
                               -replace "blue-500", "gray-700" `
                               -replace "blue-600", "gray-900" `
                               -replace "blue-700", "black" `
                               -replace "blue-800", "black" `
                               -replace "blue-900", "black" `
                               -replace "blue-950", "black"
        
        if ($content -ne $newContent) {
            [System.IO.File]::WriteAllText($_.FullName, $newContent)
            Write-Host "Updated $($_.FullName)"
        }
    }
}
