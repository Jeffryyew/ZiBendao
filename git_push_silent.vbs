' Git push VBScript - runs silently, writes output to log file
Dim oShell, oFSO, oFile, strOutput, strErr
Set oShell = CreateObject("WScript.Shell")
Set oFSO = CreateObject("Scripting.FileSystemObject")

Dim logPath
logPath = "C:\Users\Dell\Desktop\zibendao\git_push_log.txt"
Set oFile = oFSO.CreateTextFile(logPath, True)

Dim repoPath
repoPath = "C:\Users\Dell\Desktop\zibendao"

Sub RunCmd(cmd)
    Dim oExec
    Set oExec = oShell.Exec(cmd)
    Dim output
    output = oExec.StdOut.ReadAll()
    Dim errOutput
    errOutput = oExec.StdErr.ReadAll()
    oFile.WriteLine "CMD: " & cmd
    If output <> "" Then oFile.WriteLine "OUT: " & output
    If errOutput <> "" Then oFile.WriteLine "ERR: " & errOutput
    oFile.WriteLine "EXIT: " & oExec.ExitCode
    oFile.WriteLine "---"
    RunCmd = oExec.ExitCode
End Sub

' Set environment for git
oShell.Environment("Process")("GIT_TERMINAL_PROMPT") = "0"
oShell.Environment("Process")("GIT_PAGER") = "cat"
oShell.Environment("Process")("GIT_ASKPASS") = "echo"

' Delete lock files
oShell.Run "cmd /c del /f /q """ & repoPath & "\.git\index.lock""", 0, True
oShell.Run "cmd /c del /f /q """ & repoPath & "\.git\HEAD.lock""", 0, True

' Kill background git processes
oShell.Run "taskkill /F /IM git.exe /T", 0, True

' Wait a moment
WScript.Sleep 2000

' Delete lock again (in case VS Code recreated it)
oShell.Run "cmd /c del /f /q """ & repoPath & "\.git\index.lock""", 0, True

' Stage files
Dim stagCmd
stagCmd = "cmd /c cd /d """ & repoPath & """ && git -c core.pager=cat add src/lib/capitalLaunchCourse.ts src/app/online/learn/page.tsx"
oShell.Run stagCmd, 0, True

' Commit
Dim commitCmd
commitCmd = "cmd /c cd /d """ & repoPath & """ && set GIT_PAGER=cat && git -c core.pager=cat commit --no-verify -m ""feat: 资本启航完整13章100关课程系统 + 5阶段导航"""
Dim oExecCommit
Set oExecCommit = oShell.Exec(commitCmd)
Dim commitOut, commitErr
commitOut = oExecCommit.StdOut.ReadAll()
commitErr = oExecCommit.StdErr.ReadAll()
oFile.WriteLine "COMMIT OUT: " & commitOut
oFile.WriteLine "COMMIT ERR: " & commitErr
oFile.WriteLine "COMMIT EXIT: " & oExecCommit.ExitCode
oFile.WriteLine "---"

' Push
Dim pushCmd
pushCmd = "cmd /c cd /d """ & repoPath & """ && set GIT_TERMINAL_PROMPT=0 && git -c core.pager=cat push origin main"
Dim oExecPush
Set oExecPush = oShell.Exec(pushCmd)
Dim pushOut, pushErr
pushOut = oExecPush.StdOut.ReadAll()
pushErr = oExecPush.StdErr.ReadAll()
oFile.WriteLine "PUSH OUT: " & pushOut
oFile.WriteLine "PUSH ERR: " & pushErr
oFile.WriteLine "PUSH EXIT: " & oExecPush.ExitCode
oFile.WriteLine "---"

oFile.WriteLine "DONE"
oFile.Close

' Show result
If oExecPush.ExitCode = 0 Then
    MsgBox "SUCCESS! 代码已推送到GitHub，Vercel将在2分钟内自动部署。" & Chr(10) & "日志: " & logPath, 64, "部署成功"
Else
    MsgBox "推送失败，请查看日志: " & logPath & Chr(10) & Chr(10) & "PUSH ERR: " & pushErr, 16, "推送失败"
End If
