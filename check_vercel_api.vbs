Dim http
Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.Open "GET", "https://api.vercel.com/v6/deployments?limit=5", False
http.setRequestHeader "Authorization", "Bearer REDACTED_TOKEN"
http.Send

Dim resp
resp = http.ResponseText

Dim fso, f
Set fso = CreateObject("Scripting.FileSystemObject")
Set f = fso.CreateTextFile("C:\Users\Dell\Desktop\zibendao\vercel_status.txt", True)
f.WriteLine "Status: " & http.Status
' Write response in chunks of 5000 chars
Dim i, chunk
For i = 1 To Len(resp) Step 5000
    chunk = Mid(resp, i, 5000)
    f.Write chunk
Next
f.Close

MsgBox "Done! Status=" & http.Status & " Len=" & Len(resp), 64, "Vercel API"
