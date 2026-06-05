Dim shell, fso, f

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

shell.CurrentDirectory = "C:\Users\Dell\Desktop\zibendao"
shell.Run "cmd /c git log --oneline -5 > C:\Users\Dell\Desktop\zibendao\git_log_result.txt 2>&1 && git status --short >> C:\Users\Dell\Desktop\zibendao\git_log_result.txt 2>&1", 0, True

Set f = fso.OpenTextFile("C:\Users\Dell\Desktop\zibendao\git_log_result.txt", 1)
Dim result
result = f.ReadAll()
f.Close

MsgBox result
