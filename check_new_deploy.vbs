Dim http, token, fso, f, body

token = "REDACTED_TOKEN"

Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.Open "GET", "https://api.vercel.com/v13/deployments/dpl_4oy5hgTJU59HL3jdY3aGLCRSqWNb?teamId=team_ei2oEAanKpGuN9I4T5JJXYrP", False
http.setRequestHeader "Authorization", "Bearer " & token
http.Send

Set fso = CreateObject("Scripting.FileSystemObject")
Set f = fso.CreateTextFile("C:\Users\Dell\Desktop\zibendao\new_deploy_status.txt", True, False)
f.WriteLine "Status: " & http.Status

Dim body2
body2 = http.responseText

' Extract readyState
Dim pos1, pos2
pos1 = InStr(body2, """readyState"":""")
If pos1 > 0 Then
    pos1 = pos1 + 14
    pos2 = InStr(pos1, body2, """")
    f.WriteLine "readyState: " & Mid(body2, pos1, pos2 - pos1)
End If

f.WriteLine "Full: " & Left(body2, 1500)
f.Close

MsgBox "Done! Check new_deploy_status.txt"
