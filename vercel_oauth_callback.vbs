Dim http, fso, f

Set http = CreateObject("MSXML2.ServerXMLHTTP.6.0")
http.Open "GET", "http://localhost:40440/callback?state=oO1tg9paaxrcg1yoA8FuoqKvKccBPLz2GO-IPofFlTU&code=275ee326709b14e4ed62d1bc8c927fb34fdb0e70", False
http.Send

Set fso = CreateObject("Scripting.FileSystemObject")
Set f = fso.CreateTextFile("C:\Users\Dell\Desktop\zibendao\oauth_result.txt", True, False)
f.WriteLine "Status: " & http.Status
f.WriteLine "Response: " & Left(http.responseText, 2000)
f.Close

MsgBox "Done! Status: " & http.Status & Chr(13) & Left(http.responseText, 200)
