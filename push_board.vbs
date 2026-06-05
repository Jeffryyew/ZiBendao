Dim shell, fso, f

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

shell.CurrentDirectory = "C:\Users\Dell\Desktop\zibendao"

If fso.FileExists("C:\Users\Dell\Desktop\zibendao\.git\index.lock") Then
    fso.DeleteFile "C:\Users\Dell\Desktop\zibendao\.git\index.lock", True
End If

If fso.FileExists("C:\Users\Dell\Desktop\zibendao\.git\index") Then
    fso.DeleteFile "C:\Users\Dell\Desktop\zibendao\.git\index", True
End If

Set f = fso.CreateTextFile("C:\Users\Dell\Desktop\zibendao\push_board_result.txt", True, False)
f.Close

shell.Run "cmd /c git reset HEAD >> C:\Users\Dell\Desktop\zibendao\push_board_result.txt 2>&1", 0, True
shell.Run "cmd /c git add src/app/admin/ >> C:\Users\Dell\Desktop\zibendao\push_board_result.txt 2>&1", 0, True
shell.Run "cmd /c git commit -m ""feat: add /admin/board project kanban page"" >> C:\Users\Dell\Desktop\zibendao\push_board_result.txt 2>&1", 0, True
shell.Run "cmd /c git push origin main >> C:\Users\Dell\Desktop\zibendao\push_board_result.txt 2>&1", 0, True

Set f = fso.OpenTextFile("C:\Users\Dell\Desktop\zibendao\push_board_result.txt", 1)
Dim result
result = f.ReadAll()
f.Close

MsgBox "Done!" & Chr(13) & Right(result, 600)
