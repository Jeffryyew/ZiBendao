Dim shell, fso, f

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

shell.CurrentDirectory = "C:\Users\Dell\Desktop\zibendao"

' Remove stale lock if exists
If fso.FileExists("C:\Users\Dell\Desktop\zibendao\.git\index.lock") Then
    fso.DeleteFile "C:\Users\Dell\Desktop\zibendao\.git\index.lock", True
End If

' Fix corrupt index by removing it (git will regenerate)
If fso.FileExists("C:\Users\Dell\Desktop\zibendao\.git\index") Then
    fso.DeleteFile "C:\Users\Dell\Desktop\zibendao\.git\index", True
End If

Set f = fso.CreateTextFile("C:\Users\Dell\Desktop\zibendao\push_fix2_result.txt", True, False)
f.Close

' Restore index from HEAD
shell.Run "cmd /c git reset HEAD >> C:\Users\Dell\Desktop\zibendao\push_fix2_result.txt 2>&1", 0, True

' Stage only src/
shell.Run "cmd /c git add src/ >> C:\Users\Dell\Desktop\zibendao\push_fix2_result.txt 2>&1", 0, True

' Commit
shell.Run "cmd /c git commit -m ""fix: remove bottom whitespace, remove tool disclaimers, remove company icons"" >> C:\Users\Dell\Desktop\zibendao\push_fix2_result.txt 2>&1", 0, True

' Push
shell.Run "cmd /c git push origin main >> C:\Users\Dell\Desktop\zibendao\push_fix2_result.txt 2>&1", 0, True

' Read result
Set f = fso.OpenTextFile("C:\Users\Dell\Desktop\zibendao\push_fix2_result.txt", 1)
Dim result
result = f.ReadAll()
f.Close

MsgBox "Done!" & Chr(13) & Right(result, 600)
