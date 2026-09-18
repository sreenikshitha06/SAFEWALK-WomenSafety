# setup.ps1
# Run this ONCE, from inside your project folder, after dropping all the
# downloaded .js files loose in the root. It puts everything where it belongs.
#
#   cd C:\dev\WomenSafety
#   powershell -ExecutionPolicy Bypass -File setup.ps1

Write-Host "Building folder structure..." -ForegroundColor Cyan

New-Item -ItemType Directory -Force -Path "src\screens"    | Out-Null
New-Item -ItemType Directory -Force -Path "src\services"   | Out-Null
New-Item -ItemType Directory -Force -Path "src\components" | Out-Null
New-Item -ItemType Directory -Force -Path "functions"      | Out-Null

# Moves a file only if it is actually sitting in the root
function MoveIfHere($file, $destination) {
    if (Test-Path $file) {
        Move-Item $file $destination -Force
        Write-Host "  moved $file -> $destination" -ForegroundColor DarkGray
    }
}

# The cloud function must NOT stay in the root, it would replace Expo's entry file
MoveIfHere "functionsIndex.js" "functions\index.js"

MoveIfHere "auth.js"            "src\services\"
MoveIfHere "contacts.js"        "src\services\"
MoveIfHere "location.js"        "src\services\"
MoveIfHere "sos.js"             "src\services\"

MoveIfHere "LoginScreen.js"     "src\screens\"
MoveIfHere "SignupScreen.js"    "src\screens\"
MoveIfHere "HomeScreen.js"      "src\screens\"
MoveIfHere "ContactsScreen.js"  "src\screens\"

MoveIfHere "SosButton.js"       "src\components\"
MoveIfHere "theme.js"           "src\"

# Expo's entry point. This is what boots App.js.
Write-Host "Writing index.js entry point..." -ForegroundColor Cyan
@"
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
"@ | Set-Content -Path "index.js" -Encoding UTF8

Write-Host ""
Write-Host "Done. Your structure should now be:" -ForegroundColor Green
Write-Host "  App.js, app.json, index.js, firebaseConfig.js, package.json"
Write-Host "  src\theme.js"
Write-Host "  src\screens\  src\services\  src\components\"
Write-Host "  functions\index.js"
Write-Host ""
Write-Host "Next: paste your Firebase keys into firebaseConfig.js" -ForegroundColor Yellow
