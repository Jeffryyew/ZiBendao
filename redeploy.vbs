Dim http, token, body, fso, f

token = "REDACTED_TOKEN"

' Trigger a new deployment for the latest commit
body = "{""name"":""zibendao"",""gitSource"":{""type"":""github"",""repoId"":""1232039358"",""ref"":""main"",""sha"":""16348552c05a7491aa12f3c572373e064e96b0e2""},""target"":""production""}"

Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.Open "POST", "https://api.vercel.com/v13/deployments?teamId=team_ei2oEAanKpGuN9I4T5JJXYrP", False
http.setRequestHeader "Authorization", "Bearer " & token
http.setRequestHeader "Content-Type", "application/json"
http.Send body

Set fso = CreateObject("Scripting.FileSystemObject")
Set f = fso.CreateTextFile("C:\Users\Dell\Desktop\zibendao\redeploy_result.txt", True, False)
f.WriteLine "Status: " & http.Status
f.WriteLine "Response: " & Left(http.responseText, 3000)
f.Close

MsgBox "Done! Status: " & http.Status
