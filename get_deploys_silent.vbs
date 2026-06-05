Dim http, token, fso, f

token = "REDACTED_TOKEN"

Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.Open "GET", "https://api.vercel.com/v6/deployments?teamId=team_ei2oEAanKpGuN9I4T5JJXYrP&projectId=prj_3eMvlwfUGlgD5tYam91n9nuE2UZS&limit=3", False
http.setRequestHeader "Authorization", "Bearer " & token
http.Send

Set fso = CreateObject("Scripting.FileSystemObject")
Set f = fso.CreateTextFile("C:\Users\Dell\Desktop\zibendao\deploys_result.txt", True, False)
f.WriteLine "Status: " & http.Status
f.WriteLine Left(http.responseText, 4000)
f.Close
