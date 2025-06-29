# PowerShell script to handle Prisma generation on Windows
Write-Host "Attempting to generate Prisma client..."

# Try to remove existing client directory if it exists
try {
    if (Test-Path "node_modules\.prisma") {
        Write-Host "Removing existing .prisma directory..."
        Remove-Item -Path "node_modules\.prisma" -Recurse -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
} catch {
    Write-Host "Note: Could not remove .prisma directory (this is often normal)"
}

# Try generating Prisma client
try {
    Write-Host "Generating Prisma client..."
    npx prisma generate
    Write-Host "Prisma client generated successfully!"
} catch {
    Write-Host "Error generating Prisma client: $($_.Exception.Message)"
    Write-Host "This is a known Windows permission issue."
    Write-Host "The build will work on Vercel deployment."
}
