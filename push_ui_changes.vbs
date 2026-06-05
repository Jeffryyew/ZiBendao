Dim shell, fso, f

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

shell.CurrentDirectory = "C:\Users\Dell\Desktop\zibendao"

' Remove stale lock if exists
If fso.FileExists("C:\Users\Dell\Desktop\zibendao\.git\index.lock") Then
    fso.DeleteFile "C:\Users\Dell\Desktop\zibendao\.git\index.lock", True
End If

' Stage only src files and i18n
shell.Run "cmd /c git add src/ >> C:\Users\Dell\Desktop\zibendao\push_ui_result.txt 2>&1", 0, True

' Commit
shell.Run "cmd /c git commit -m ""feat: UI adjustments - remove Capital OS labels, rebrand AI to Zibo/Xiaoze, remove icons, update About/footer/courses/community/tools"" >> C:\Users\Dell\Desktop\zibendao\push_ui_result.txt 2>&1", 0, True

' Push
shell.Run "cmd /c git push origin main >> C:\Users\Dell\Desktop\zibendao\push_ui_result.txt 2>&1", 0, True

' Read result
Set f = fso.OpenTextFile("C:\Users\Dell\Desktop\zibendao\push_ui_result.txt", 1)
Dim result
result = f.ReadAll()
f.Close

MsgBox "Done!" & Chr(13) & Left(result, 400)
