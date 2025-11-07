@echo off
REM Script to create Alpine-compatible node_modules using WSL

echo ========================================
echo Creating Linux node_modules using WSL
echo ========================================
echo.

REM Get the current directory in WSL format
for /f "delims=" %%i in ('wsl wslpath -a "%cd%"') do set WSL_PATH=%%i

echo Current directory in WSL: %WSL_PATH%
echo.

echo Installing Node.js in WSL (if not already installed)...
wsl bash -c "command -v node || (curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - && sudo apt-get install -y nodejs)"
echo.

echo ========================================
echo Building FRONTEND node_modules...
echo ========================================
wsl bash -c "cd '%WSL_PATH%/frontend' && npm ci && tar -czf node_modules-linux.tar.gz node_modules && echo 'Frontend done!'"
echo.

echo ========================================
echo Building BACKEND node_modules...
echo ========================================
wsl bash -c "cd '%WSL_PATH%/backend' && npm ci --only=production && tar -czf node_modules-linux.tar.gz node_modules && echo 'Backend done!'"
echo.

echo ========================================
echo SUCCESS!
echo ========================================
echo.
echo Created files:
echo   - frontend/node_modules-linux.tar.gz
echo   - backend/node_modules-linux.tar.gz
echo.
echo Transfer these to your Ubuntu machine and extract:
echo   tar -xzf node_modules-linux.tar.gz
echo.
pause
