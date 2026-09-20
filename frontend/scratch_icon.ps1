Add-Type -AssemblyName System.Drawing

$srcPath = "e:\Ai-roadmap-generator\Ai-learning-roadmap\frontend\public\brand\uploaded-p-icon.png"
$bmp = New-Object System.Drawing.Bitmap($srcPath)
Write-Output "Size: $($bmp.Width) x $($bmp.Height)"
Write-Output "Pixel 0,0: $($bmp.GetPixel(0,0))"

# Create a clean black version with transparent background
# If the original has white P on black background, white pixels become black (0,0,0,255) and black pixels become transparent (0,0,0,0)
$outBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $pixel = $bmp.GetPixel($x, $y)
        # Check brightness/whiteness
        $brightness = ($pixel.R + $pixel.G + $pixel.B) / 3.0
        $alpha = $pixel.A
        
        # If the input has black background and white P
        if ($pixel.A -gt 200 -and $brightness -gt 150) {
            # White pixel -> make it solid black (or with antialiasing)
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(255, 0, 0, 0))
        } elseif ($pixel.A -gt 50 -and $brightness -gt 50) {
            # Antialiased edge -> black with alpha proportional to brightness
            $a = [int]($brightness)
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($a, 0, 0, 0))
        } else {
            # Background / dark -> transparent
            $outBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, 0, 0, 0))
        }
    }
}

$outPath = "e:\Ai-roadmap-generator\Ai-learning-roadmap\frontend\public\brand\logo-p-black.png"
$outBmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
$outBmp.Dispose()
Write-Output "Saved to $outPath successfully"
