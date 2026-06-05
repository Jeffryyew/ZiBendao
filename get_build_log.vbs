Dim http, url, token, resp, fso, f
token = "REDACTED_TOKEN"
url = "https://api.vercel.com/v2/deployments/dpl_CLyNtHxNyrvGNeQX1cHHqJYwbuGs/events?limit=200&types=command,stdout,stderr,exit"

Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.Open "GET", url, False
http.setRequestHeader "Authorization", "Bearer " & token
http.setRequestHeader "Content-Type", "application/json"
http.Send

Set fso = CreateObject("Scripting.FileSystemObject")
Set f = fso.CreateTextFile("C:\Users\Dell\Desktop\zibendao\build_log.txt", True, True)
f.WriteLine "Status: " & http.Status

Dim body
body = http.responseText

Dim i, chunk
Dim chunkSize
chunkSize = 3000
For i = 1 To Len(body) Step chunkSize
    chunk = Mid(body, i, chunkSize)
    f.Write chunk
Next
f.Close

MsgBox "Done! Status: " & http.Status & ", Bytes: " & Len(body)
