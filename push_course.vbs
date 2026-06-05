Dim shell, fso, f
Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
shell.CurrentDirectory = "C:\Users\Dell\Desktop\zibendao"
If fso.FileExists("C:\Users\Dell\Desktop\zibendao\.git\index") Then
    fso.DeleteFile "C:\Users\Dell\Desktop\zibendao\.git\index", True
End If
Set f = fso.CreateTextFile("C:\Users\Dell\Desktop\zibendao\push_course_result.txt", True, False)
f.Close
shell.Run "cmd /c git reset HEAD >> C:\Users\Dell\Desktop\zibendao\push_course_result.txt 2>&1", 0, True
shell.Run "cmd /c git add scripts/seed.ts docs/ CLAUDE.md >> C:\Users\Dell\Desktop\zibendao\push_course_result.txt 2>&1", 0, True
shell.Run "cmd /c git commit -m ""feat: 资本启航 13模块100关课程内容全部定稿，闸门A解锁"" >> C:\Users\Dell\Desktop\zibendao\push_course_result.txt 2>&1", 0, True
shell.Run "cmd /c git push origin main >> C:\Users\Dell\Desktop\zibendao\push_course_result.txt 2>&1", 0, True
Set f = fso.OpenTextFile("C:\Users\Dell\Desktop\zibendao\push_course_result.txt", 1)
Dim result
result = f.ReadAll()
f.Close
MsgBox "Done!" & Chr(13) & Right(result, 500)
