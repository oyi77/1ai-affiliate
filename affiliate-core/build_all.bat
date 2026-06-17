echo "Building Admin..."
cd admin
call npm install
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%
cd ..

echo "Building Client User..."
cd client-user
call npm install
call npm run build
if %errorlevel% neq 0 exit /b %errorlevel%
cd ..

echo "Copying to Server..."
mkdir server\public\admin
mkdir server\public\client
xcopy /E /I /Y admin\dist server\public\admin
xcopy /E /I /Y client-user\dist server\public\client

echo "Done!"
