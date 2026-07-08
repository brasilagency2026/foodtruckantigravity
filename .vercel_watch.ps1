$sha='46a393e2ed950883c2644d801bcfc32c15e80bbe'
for ($i=1; $i -le 8; $i++) {
  Write-Output "Poll $i..."
  node scripts/list_deployments.js | Out-File -Encoding utf8 vercel_poll.json
  $j = Get-Content vercel_poll.json -Raw | ConvertFrom-Json
  $match = $j.deployments | Where-Object { $_.meta.githubCommitSha -eq $sha }
  if ($match) {
    Write-Output ("Found deployment: uid=" + $match.uid + " state=" + $match.state + " readyState=" + $match.readyState + " aliasAssigned=" + ($match.aliasAssigned -ne $null))
    if ($match.aliasAssigned) {
      Write-Output "Alias assigned; exiting"
      exit 0
    }
  } else {
    Write-Output "Not found yet"
  }
  Start-Sleep -Seconds 15
}
Write-Output "Timeout"
exit 2
