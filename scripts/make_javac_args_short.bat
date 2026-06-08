@echo off
setlocal enabledelayedexpansion
set "SHORT="
for /f "usebackq delims=; eol=" %%A in ("cp.txt") do (
  for %%B in ("%%~A") do (
    for %%S in ("%%~B") do set "SHORTPATH=%%~sS"
    if defined SHORT (
      set "SHORT=!SHORT!;!SHORTPATH!"
    ) else (
      set "SHORT=!SHORTPATH!"
    )
  )
)
(
  echo -classpath
  echo !SHORT!
  echo -d
  echo target\classes
)>javac_args_short.txt
endlocal
exit /b 0
