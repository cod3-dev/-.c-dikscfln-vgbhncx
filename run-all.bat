@echo off
setlocal EnableExtensions

set "ROOT=%~dp0"
set "MODE=all"
set "DRY_RUN=0"

:parse_args
if "%~1"=="" goto args_done
if /I "%~1"=="--dry-run" (
  set "DRY_RUN=1"
  shift
  goto parse_args
)
if /I "%~1"=="--frontend-only" (
  set "MODE=frontend"
  shift
  goto parse_args
)
if /I "%~1"=="--backend-only" (
  set "MODE=backend"
  shift
  goto parse_args
)
if /I "%~1"=="--help" goto show_help

echo Unknown option: %~1
echo Use --help to see the supported options.
exit /b 1

:args_done
where node >nul 2>&1 || (
  echo Node.js was not found on PATH.
  exit /b 1
)

where npm >nul 2>&1 || (
  echo npm was not found on PATH.
  exit /b 1
)

cd /d "%ROOT%"

echo CarePath launcher root: %ROOT%
echo Mode: %MODE%
if "%DRY_RUN%"=="1" echo Dry run enabled. Commands will be printed without launching windows.
echo.

if /I not "%MODE%"=="backend" (
  call :launch "CarePath Web" "npm run dev --workspace @african-healthcare/web"
  call :launch "CarePath Mobile" "npm run dev --workspace @african-healthcare/mobile"
  call :launch "CarePath USSD" "npm run dev --workspace @african-healthcare/ussd"
)

if /I not "%MODE%"=="frontend" (
  call :launch "CarePath API Gateway" "npm run dev --workspace @african-healthcare/api-gateway"
  call :launch "CarePath Triage Service" "npm run dev --workspace @african-healthcare/triage-service"
  call :launch "CarePath Facility Matching" "npm run dev --workspace @african-healthcare/facility-matching-service"
  call :launch "CarePath Cost Estimation" "npm run dev --workspace @african-healthcare/cost-estimation-service"
  call :launch "CarePath Telemedicine" "npm run dev --workspace @african-healthcare/telemedicine-service"
  call :launch "CarePath EHR" "npm run dev --workspace @african-healthcare/ehr-service"
  call :launch "CarePath Notifications" "npm run dev --workspace @african-healthcare/notification-service"
  call :launch "CarePath Appointments" "npm run dev --workspace @african-healthcare/appointment-service"
)

echo.
if "%DRY_RUN%"=="1" (
  echo Dry run complete.
) else (
  echo Launch complete.
  echo Web app: http://localhost:3000
  echo Mobile app: http://localhost:3001
  echo USSD app: http://localhost:3002
  echo Some backend workspaces are still scaffolds and will stay open with placeholder output.
)
exit /b 0

:launch
set "SERVICE_NAME=%~1"
set "SERVICE_COMMAND=%~2"

if "%DRY_RUN%"=="1" (
  echo [%SERVICE_NAME%]
  echo   %SERVICE_COMMAND%
) else (
  echo Starting %SERVICE_NAME%...
  start "%SERVICE_NAME%" cmd /k "cd /d ""%ROOT%"" && %SERVICE_COMMAND%"
)
exit /b 0

:show_help
echo Usage: run-all.bat [--dry-run] [--frontend-only ^| --backend-only]
echo.
echo   --dry-run        Print every launch command without opening new terminals.
echo   --frontend-only  Launch only the web, mobile, and USSD apps.
echo   --backend-only   Launch only the gateway and backend services.
echo   --help           Show this help message.
exit /b 0
