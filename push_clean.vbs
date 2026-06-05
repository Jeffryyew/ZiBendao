Dim shell, fso, f

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

shell.CurrentDirectory = "C:\Users\Dell\Desktop\zibendao"

If fso.FileExists("C:\Users\Dell\Desktop\zibendao\.git\index.lock") Then
    fso.DeleteFile "C:\Users\Dell\Desktop\zibendao\.git\index.lock", True
End If

' Undo last commit but keep changes staged
shell.Run "cmd /c git reset HEAD~1 >> C:\Users\Dell\Desktop\zibendao\push_clean_result.txt 2>&1", 0, True

' Stage only src/ directory
shell.Run "cmd /c git add src/ >> C:\Users\Dell\Desktop\zibendao\push_clean_result.txt 2>&1", 0, True

' Commit cleanly
shell.Run "cmd /c git commit -m ""feat: UI adjustments - remove Capital OS labels, rebrand AI to Zibo, remove icons, update About/footer/courses/community/tools"" >> C:\Users\Dell\Desktop\zibendao\push_clean_result.txt 2>&1", 0, True

' Push
shell.Run "cmd /c git push origin main >> C:\Users\Dell\Desktop\zibendao\push_clean_result.txt 2>&1", 0, True

Set f = fso.OpenTextFile("C:\Users\Dell\Desktop\zibendao\push_clean_result.txt", 1)
Dim result
result = f.ReadAll()
f.Close

MsgBox "Done!" & Chr(13) & Right(result, 500)
