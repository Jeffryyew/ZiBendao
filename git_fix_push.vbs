Dim shell, fso, f, result

Set shell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

Dim repoPath
repoPath = "C:\Users\Dell\Desktop\zibendao"

' Git add
shell.CurrentDirectory = repoPath
result = shell.Run("cmd /c git add middleware.ts 2>&1", 0, True)

' Git commit
result = shell.Run("cmd /c git commit -m ""fix: simplify middleware matcher to fix Vercel CLI 54.4.1 route validation"" 2>&1", 0, True)

' Git push
result = shell.Run("cmd /c git push origin main 2>&1", 0, True)

' Write status
Set f = fso.CreateTextFile(repoPath & "\git_fix_result.txt", True, False)
f.WriteLine "Git operations completed. Exit code: " & result
f.WriteLine "Time: " & Now()
f.Close

MsgBox "Done! Push result code: " & result & ". Check git_fix_result.txt"
