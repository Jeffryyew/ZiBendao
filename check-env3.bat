@echo off
cd /d C:\Users\Dell\Desktop\zibendao
powershell -Command "$out = ''; try { $r = Invoke-WebRequest -Uri 'https://zibendao.vercel.app/api/env-check' -UseBasicParsing -MaximumRedirection 0 -ErrorAction Stop; $out = 'STATUS=' + $r.StatusCode + \"`nBODY=\" + $r.Content } catch { $err = $_.Exception.Response; if ($err) { $out = 'REDIRECT_STATUS=' + [int]$err.StatusCode + \"`nLOCATION=\" + $err.Headers['Location'] } else { $out = 'ERROR=' + $_.Exception.Message } }; $out | Out-File -FilePath 'C:\Users\Dell\Desktop\env3-result.txt' -Encoding utf8; Write-Host $out"
echo.
echo Done - check C:\Users\Dell\Desktop\env3-result.txt for details
pause
