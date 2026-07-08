for ($i=1; $i -le 6; $i++) {
  Write-Output "Attempt $i..."
  $res = Invoke-WebRequest 'https://www.foodpronto.com.br/marketing' -UseBasicParsing -Headers @{ 'User-Agent' = 'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)' }
  if ($res.Content -match 'property="og:image"' -or $res.Content -match 'name="twitter:image"') {
    Write-Output "FOUND on attempt $i"
    $res.Content | Out-File -Encoding utf8 prod_marketing_found.html
    break
  } else {
    Write-Output "Not found on attempt $i"
    Start-Sleep -Seconds 10
  }
}
