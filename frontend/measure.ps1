Add-Type -AssemblyName System.Drawing

$wheelBmp = New-Object System.Drawing.Bitmap("e:\Ai-roadmap-generator\Ai-learning-roadmap\frontend\public\images\comparison\comparison.png")
Write-Output "Wheel Size: $($wheelBmp.Width) x $($wheelBmp.Height)"

# Find the white border ring of the inner circle
# Let's scan horizontally across the middle y = Height / 2
$yMid = [int]($wheelBmp.Height / 2)
$xMid = [int]($wheelBmp.Width / 2)

# Scan from center outwards to find white ring
$whitePixels = @()
for ($y = 0; $y -lt $wheelBmp.Height; $y++) {
    for ($x = 0; $x -lt $wheelBmp.Width; $x++) {
        $p = $wheelBmp.GetPixel($x, $y)
        # Check if white ring (R>240, G>240, B>240)
        if ($p.R -gt 240 -and $p.G -gt 240 -and $p.B -gt 240 -and $p.A -gt 200) {
            # check distance from center
            $dx = $x - $xMid
            $dy = $y - $yMid
            $dist = [Math]::Sqrt($dx*$dx + $dy*$dy)
            if ($dist -gt 100 -and $dist -lt 250) {
                $whitePixels += [PSCustomObject]@{X=$x; Y=$y}
            }
        }
    }
}

if ($whitePixels.Count -gt 0) {
    $minX = ($whitePixels | Measure-Object -Property X -Minimum).Minimum
    $maxX = ($whitePixels | Measure-Object -Property X -Maximum).Maximum
    $minY = ($whitePixels | Measure-Object -Property Y -Minimum).Minimum
    $maxY = ($whitePixels | Measure-Object -Property Y -Maximum).Maximum
    $centerX = ($minX + $maxX) / 2.0
    $centerY = ($minY + $maxY) / 2.0
    $diameterX = $maxX - $minX
    $diameterY = $maxY - $minY
    Write-Output "Inner Circle Bounds: X: [$minX, $maxX], Y: [$minY, $maxY]"
    Write-Output "Inner Circle Center: ($centerX, $centerY) in image of ($($wheelBmp.Width), $($wheelBmp.Height))"
    Write-Output "Center as % of image: X=$([Math]::Round($centerX / $wheelBmp.Width * 100, 2))%, Y=$([Math]::Round($centerY / $wheelBmp.Height * 100, 2))%"
    Write-Output "Inner Circle Diameter: $diameterX x $diameterY (approx $([Math]::Round($diameterX / $wheelBmp.Width * 100, 2))% of wheel)"
}

$wheelBmp.Dispose()

# Now inspect logo-p-black.png
$logoBmp = New-Object System.Drawing.Bitmap("e:\Ai-roadmap-generator\Ai-learning-roadmap\frontend\public\brand\logo-p-black.png")
Write-Output "Logo Size: $($logoBmp.Width) x $($logoBmp.Height)"
# find non-transparent bounding box
$minLX = $logoBmp.Width; $maxLX = 0; $minLY = $logoBmp.Height; $maxLY = 0
for ($y = 0; $y -lt $logoBmp.Height; $y++) {
    for ($x = 0; $x -lt $logoBmp.Width; $x++) {
        if ($logoBmp.GetPixel($x, $y).A -gt 20) {
            if ($x -lt $minLX) { $minLX = $x }
            if ($x -gt $maxLX) { $maxLX = $x }
            if ($y -lt $minLY) { $minLY = $y }
            if ($y -gt $maxLY) { $maxLY = $y }
        }
    }
}
Write-Output "Logo Visible Bounds: X: [$minLX, $maxLX], Y: [$minLY, $maxLY]"
Write-Output "Logo Visible Size: $($maxLX - $minLX + 1) x $($maxLY - $minLY + 1)"
Write-Output "Logo Center Offset: X=$([Math]::Round((($minLX + $maxLX)/2 - $logoBmp.Width/2), 2)), Y=$([Math]::Round((($minLY + $maxLY)/2 - $logoBmp.Height/2), 2))"
$logoBmp.Dispose()
