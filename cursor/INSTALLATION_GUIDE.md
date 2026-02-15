# Installation Guide

## Node.js Installation (Required)

Since Node.js is not currently installed on your system, you need to install it first to run this React project.

### Option 1: Download from Official Website (Recommended)

1. **Visit Node.js website:**
   - Go to: https://nodejs.org/
   - Download the **LTS (Long Term Support)** version (recommended for most users)
   - Choose the Windows Installer (.msi) for your system (64-bit or 32-bit)

2. **Run the Installer:**
   - Double-click the downloaded `.msi` file
   - Follow the installation wizard
   - **Important:** Make sure to check "Add to PATH" option during installation
   - Accept the license agreement and click "Next" through the installation

3. **Verify Installation:**
   - Close and reopen your terminal/PowerShell
   - Run: `node --version`
   - Run: `npm --version`
   - Both commands should display version numbers

### Option 2: Using Chocolatey (If you have Chocolatey installed)

```powershell
choco install nodejs-lts
```

### Option 3: Using Winget (Windows Package Manager)

```powershell
winget install OpenJS.NodeJS.LTS
```

## After Installing Node.js

1. **Close and reopen your terminal/PowerShell** (important for PATH changes to take effect)

2. **Navigate to project directory:**
   ```powershell
   cd E:\cursor
   ```

3. **Install project dependencies:**
   ```powershell
   npm install
   ```

4. **Start the development server:**
   ```powershell
   npm run dev
   ```

5. **Open your browser:**
   - Navigate to `http://localhost:5173`
   - You should see the TechService login page

## Troubleshooting

### If npm is still not recognized after installation:

1. **Restart your computer** (sometimes required for PATH changes)

2. **Or manually add to PATH:**
   - Open System Properties → Environment Variables
   - Add Node.js installation path (usually `C:\Program Files\nodejs\`) to PATH
   - Restart terminal

### Verify Installation:

```powershell
node --version    # Should show v18.x.x or v20.x.x
npm --version     # Should show 9.x.x or 10.x.x
```

## Quick Start Commands

Once Node.js is installed:

```powershell
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```



