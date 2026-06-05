@echo off
echo Removing stale git lock files...
if exist ".git\HEAD.lock" (
    del /f ".git\HEAD.lock"
    echo Removed HEAD.lock
) else (
    echo HEAD.lock not found
)
if exist ".git\index.lock" (
    del /f ".git\index.lock"
    echo Removed index.lock
)
echo Done. Running git status...
git status
pause
