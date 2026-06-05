Dim shell, fso, f

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

shell.CurrentDirectory = "C:\Users\Dell\Desktop\zibendao"
shell.Run "cmd /c git push origin main > C:\Users\Dell\Desktop\zibendao\push_fix_result.txt 2>&1", 0, True

Set f = fso.OpenTextFile("C:\Users\Dell\Desktop\zibendao\push_fix_result.txt", 1)
Dim result
result = f.ReadAll()
f.Close

MsgBox "Push done! Result: " & Left(result, 300)
