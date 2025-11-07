---
title: Setup Your Computer
description: Become a developer in 5 minutes - no experience needed
section: Getting Started
order: 0
tags:
  - setup
  - installation
  - mac
  - linux
  - windows
  - beginners
---

# Become a Developer in 5 Minutes

**Never coded before? Never opened a terminal? Perfect.** This guide is for you.

**You'll need:**
- ✅ A computer (Mac, Windows, or Linux)
- ✅ A free Claude account (we'll help you create one)
- ✅ 5 minutes

---

## What You'll Be Doing

Before we start, here's what you'll do:

**Step 1:** Open a special app on your computer called "Terminal" (Mac/Linux) or "PowerShell" (Windows)
- This is a text-based window where you type commands
- Don't worry - we'll show you exactly what to type
- You just copy, paste, and press Enter

**Step 2:** Install Claude Code (your AI coding assistant)
- Just one command
- Takes 30 seconds

**Step 3:** Let Claude set up everything else
- Tell Claude what you want
- It installs the rest and creates your first app
- Done!

Ready? Let's go!

---

## Step 1: Open Your Terminal or PowerShell

**What is a terminal?** It's a window where you type commands to control your computer. Think of it like texting with your computer.

<div class="tabs-container" style="margin: 2rem 0;">
  <div class="tabs-header" style="display: flex; gap: 0.5rem; border-bottom: 2px solid hsl(var(--color-border)); margin-bottom: 2rem;">
    <button class="tab-button active" data-tab="mac" style="padding: 1rem 2rem; font-size: 1.25rem; font-weight: 600; background: hsl(var(--color-background)); border: none; border-bottom: 3px solid hsl(var(--color-primary)); cursor: pointer;">
      🍎 Mac
    </button>
    <button class="tab-button" data-tab="windows" style="padding: 1rem 2rem; font-size: 1.25rem; font-weight: 600; background: hsl(var(--color-background)); border: none; border-bottom: 3px solid transparent; cursor: pointer; opacity: 0.6;">
      🪟 Windows
    </button>
    <button class="tab-button" data-tab="linux" style="padding: 1rem 2rem; font-size: 1.25rem; font-weight: 600; background: hsl(var(--color-background)); border: none; border-bottom: 3px solid transparent; cursor: pointer; opacity: 0.6;">
      🐧 Linux
    </button>
  </div>

  <div class="tab-content" id="mac" style="display: block;">

### Opening Terminal on Mac

**Follow these exact steps:**

1. **Find Spotlight Search**
   - Look at the top-right of your screen
   - Press two keys at the same time: `Command ⌘` (has ⌘ symbol) + `Space`
   - A search bar appears in the middle of your screen

2. **Type "terminal"**
   - You'll see an app called "Terminal" with a black square icon
   - It says "Utilities" underneath

3. **Click on it or press Enter**
   - A white or black window opens
   - You'll see some text and a blinking cursor
   - **This is your terminal!** ✅

**What you'll see:**
- Something like: `MacBook-Pro:~ yourname$` or just `%`
- A blinking cursor waiting for you to type
- This is normal! Leave this window open.

  </div>

  <div class="tab-content" id="windows" style="display: none;">

### Opening PowerShell on Windows

**Follow these exact steps:**

1. **Find the Start Menu**
   - Click the Windows logo in the bottom-left corner
   - Or press the `Windows` key on your keyboard

2. **Type "powershell"**
   - You'll see "Windows PowerShell" appear
   - It has a blue icon with `>_` symbols

3. **Right-click on "Windows PowerShell"**
   - A menu appears
   - Click "Run as administrator"
   - A window might ask "Do you want to allow this app to make changes?"
   - Click "Yes"

4. **PowerShell opens**
   - A blue window appears
   - You'll see text and a blinking cursor
   - **This is your PowerShell!** ✅

**What you'll see:**
- Something like: `PS C:\Users\YourName>`
- A blinking cursor waiting for you to type
- This is normal! Leave this window open.

  </div>

  <div class="tab-content" id="linux" style="display: none;">

### Opening Terminal on Linux

**Follow these exact steps:**

1. **Use the keyboard shortcut**
   - Press three keys at the same time: `Ctrl` + `Alt` + `T`
   - A window opens immediately

2. **Or find it in your menu**
   - Click the applications menu (usually top-left or bottom-left)
   - Look for "Terminal" or "Console"
   - Click it

3. **Terminal opens**
   - A black or colored window appears
   - You'll see text and a blinking cursor
   - **This is your terminal!** ✅

**What you'll see:**
- Something like: `yourname@computer:~$`
- A blinking cursor waiting for you to type
- This is normal! Leave this window open.

  </div>
</div>

<script>
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      const buttons = document.querySelectorAll('.tab-button');
      const contents = document.querySelectorAll('.tab-content');

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const tabId = button.dataset.tab;

          buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.borderBottomColor = 'transparent';
            btn.style.opacity = '0.6';
          });
          button.classList.add('active');
          button.style.borderBottomColor = 'hsl(var(--color-primary))';
          button.style.opacity = '1';

          contents.forEach(content => {
            content.style.display = 'none';
          });
          document.getElementById(tabId).style.display = 'block';
        });
      });
    });
  }
</script>

---

## Step 2: Install Claude Code

**Now you're going to copy and paste ONE command.**

**How to copy and paste in terminal:**
- **To paste:** Right-click and choose "Paste", OR press `Command + V` (Mac) or `Ctrl + V` (Windows/Linux)
- **Then press `Enter`** to run the command

<div class="tabs-container" style="margin: 2rem 0;">
  <div class="tabs-header" style="display: flex; gap: 0.5rem; border-bottom: 2px solid hsl(var(--color-border)); margin-bottom: 2rem;">
    <button class="tab-button-2 active" data-tab="mac2" style="padding: 1rem 2rem; font-size: 1.25rem; font-weight: 600; background: hsl(var(--color-background)); border: none; border-bottom: 3px solid hsl(var(--color-primary)); cursor: pointer;">
      🍎 Mac
    </button>
    <button class="tab-button-2" data-tab="windows2" style="padding: 1rem 2rem; font-size: 1.25rem; font-weight: 600; background: hsl(var(--color-background)); border: none; border-bottom: 3px solid transparent; cursor: pointer; opacity: 0.6;">
      🪟 Windows
    </button>
    <button class="tab-button-2" data-tab="linux2" style="padding: 1rem 2rem; font-size: 1.25rem; font-weight: 600; background: hsl(var(--color-background)); border: none; border-bottom: 3px solid transparent; cursor: pointer; opacity: 0.6;">
      🐧 Linux
    </button>
  </div>

  <div class="tab-content-2" id="mac2" style="display: block;">

**1. Copy this command** (click the copy button on the right):

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**2. Paste it into your Terminal**
- Right-click in the Terminal window
- Click "Paste"
- Or press `Command + V`

**3. Press Enter**

**What happens next:**
- Lots of text starts scrolling. **This is normal!**
- You might see: "Downloading...", "Installing..."
- Wait about 30 seconds
- When it stops, you'll see the blinking cursor again
- **Installation complete!** ✅

**4. Close Terminal and open it again**
- Click the red X (top-left)
- Follow Step 1 again to open a fresh Terminal

**5. Verify it worked** - Type this:

```bash
claude --version
```

Press Enter. You should see: `claude-cli 0.x.x`

✅ **Success!** Continue to Step 3 below.

  </div>

  <div class="tab-content-2" id="windows2" style="display: none;">

**1. Copy this command** (click the copy button on the right):

```powershell
irm https://claude.ai/install.ps1 | iex
```

**2. Paste it into your PowerShell**
- Right-click in the PowerShell window
- It automatically pastes!
- Or press `Ctrl + V`

**3. Press Enter**

**What happens next:**
- Lots of text starts scrolling. **This is normal!**
- You might see: "Downloading...", "Installing..."
- Wait about 30 seconds
- When it stops, you'll see the blinking cursor again
- **Installation complete!** ✅

**4. Close PowerShell and open it again**
- Click the X (top-right)
- Follow Step 1 again to open a fresh PowerShell (as Administrator)

**5. Verify it worked** - Type this:

```powershell
claude --version
```

Press Enter. You should see: `claude-cli 0.x.x`

✅ **Success!** Continue to Step 3 below.

  </div>

  <div class="tab-content-2" id="linux2" style="display: none;">

**1. Copy this command** (click the copy button on the right):

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

**2. Paste it into your Terminal**
- Right-click in the Terminal window
- Click "Paste"
- Or press `Ctrl + Shift + V` (note: Shift is needed in Linux terminals)

**3. Press Enter**

**What happens next:**
- Lots of text starts scrolling. **This is normal!**
- You might see: "Downloading...", "Installing..."
- Wait about 30 seconds
- When it stops, you'll see the blinking cursor again
- **Installation complete!** ✅

**4. Close Terminal and open it again**
- Click the X
- Follow Step 1 again to open a fresh Terminal

**5. Verify it worked** - Type this:

```bash
claude --version
```

Press Enter. You should see: `claude-cli 0.x.x`

✅ **Success!** Continue to Step 3 below.

  </div>
</div>

<script>
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      const buttons = document.querySelectorAll('.tab-button-2');
      const contents = document.querySelectorAll('.tab-content-2');

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const tabId = button.dataset.tab;

          buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.borderBottomColor = 'transparent';
            btn.style.opacity = '0.6';
          });
          button.classList.add('active');
          button.style.borderBottomColor = 'hsl(var(--color-primary))';
          button.style.opacity = '1';

          contents.forEach(content => {
            content.style.display = 'none';
          });
          document.getElementById(tabId).style.display = 'block';
        });
      });
    });
  }
</script>

---

## Step 3: Create Your Claude Account and Start Coding

**Now the fun part! You'll talk to Claude and build your first app.**

### 3A. Start Claude

In your Terminal/PowerShell, type:

```bash
claude
```

Press Enter.

**What happens:**
- Claude starts loading
- Your web browser opens automatically
- You see a Claude sign-in page

### 3B. Create Your Free Claude Account

**If you already have a Claude account:**
- Just sign in
- Click "Authorize" when asked
- Return to your terminal

**If you need to create an account:**

1. **Click "Sign Up" or "Create Account"**
2. **Choose how to sign up:**
   - Email address (easiest)
   - Google account
   - Apple account
3. **If using email:**
   - Enter your email address
   - Create a password
   - Check your email for a verification link
   - Click the link
   - Return to the sign-in page and log in
4. **Click "Authorize" when asked**
   - This lets Claude Code access your account
   - It's safe and normal
5. **Return to your Terminal/PowerShell**
   - You'll see: "Successfully authenticated!"
   - **You're ready!** ✅

### 3C. Choose Your Setup

**Pick which setup you want:**

<div class="tabs-container" style="margin: 2rem 0;">
  <div class="tabs-header" style="display: flex; gap: 0.5rem; border-bottom: 2px solid hsl(var(--color-border)); margin-bottom: 2rem;">
    <button class="tab-button-3 active" data-tab="minimal" style="padding: 1rem 2rem; font-size: 1.25rem; font-weight: 600; background: hsl(var(--color-background)); border: none; border-bottom: 3px solid hsl(var(--color-primary)); cursor: pointer;">
      ⚡ Minimal (2 min)
    </button>
    <button class="tab-button-3" data-tab="full" style="padding: 1rem 2rem; font-size: 1.25rem; font-weight: 600; background: hsl(var(--color-background)); border: none; border-bottom: 3px solid transparent; cursor: pointer; opacity: 0.6;">
      💎 Full Setup (5 min)
    </button>
  </div>

  <div class="tab-content-3" id="minimal" style="display: block;">

### ⚡ Minimal Setup - Just What You Need

**What you'll get:**
- Node.js (runs your apps)
- Git (saves your code)
- Bun (super-fast - installs things in seconds)
- Wrangler (publish your app to the world)
- Your first app running!

**Copy and paste this into Claude:**

```
Hi! I'm new to coding and want to build apps with the ONE Platform.

Can you please help me set up my computer? I need:
- Node.js (so I can run apps)
- Git (to save my work)
- Bun (I heard it's really fast!)
- Wrangler (to publish my apps online)

Then create my first project using: npx oneie agent

Take your time and explain everything simply, like I'm 5 years old! 😊
```

**Press Enter. Claude will:**
1. Check what's already on your computer
2. Install what's missing (asks first)
3. Create your first app
4. Show you how to see it in your browser

⏱️ **Takes 2-3 minutes**

  </div>

  <div class="tab-content-3" id="full" style="display: none;">

### 💎 Full Setup - The Complete Package

**Everything in Minimal, PLUS:**
- Visual Studio Code (pretty code editor with colors)
- Helpful extensions (make coding easier)
- All configured to work together perfectly

**Copy and paste this into Claude:**

```
Hi! I want to set up my computer like a professional developer.

Can you please install and set up:

**The Basics:**
- Node.js (runs apps)
- Git (saves my work)
- Bun (super-fast installer)
- Wrangler (publish apps to the world)

**The Nice Stuff:**
- Visual Studio Code (code editor with pretty colors)
- VS Code extensions: Claude, Astro, Tailwind CSS, ESLint, Prettier

**Then:**
- Create my ONE project using: npx oneie agent
- Open it in Visual Studio Code
- Start it so I can see it working

Explain each thing as you go, and be patient with me - I'm learning! 😊
```

**Press Enter. Claude will:**
1. Install all the tools for your computer type
2. Set them up to work together
3. Create your first app
4. Open it in VS Code
5. Show you how to use everything

⏱️ **Takes 5-7 minutes**

**Note:** You don't need GitHub Desktop! Just use `/push` in Claude and it saves to GitHub automatically. 🎉

  </div>
</div>

<script>
  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      const buttons = document.querySelectorAll('.tab-button-3');
      const contents = document.querySelectorAll('.tab-content-3');

      buttons.forEach(button => {
        button.addEventListener('click', () => {
          const tabId = button.dataset.tab;

          buttons.forEach(btn => {
            btn.classList.remove('active');
            btn.style.borderBottomColor = 'transparent';
            btn.style.opacity = '0.6';
          });
          button.classList.add('active');
          button.style.borderBottomColor = 'hsl(var(--color-primary))';
          button.style.opacity = '1';

          contents.forEach(content => {
            content.style.display = 'none';
          });
          document.getElementById(tabId).style.display = 'block';
        });
      });
    });
  }
</script>

---

**Why these tools?**

| Tool | What It Does | In Which Setup? |
|------|--------------|-----------------|
| **Node.js** | Runs your apps on your computer | Both (Required) |
| **Git** | Saves your code safely | Both (Required) |
| **Bun** | Installs packages 10x faster than npm | Both (Game changer!) |
| **Wrangler** | Publishes your app to 330+ cities worldwide | Both (For going live) |
| **VS Code** | Pretty code editor with colors | Full Setup only |
| **VS Code Extensions** | Make coding easier (colors, autocomplete) | Full Setup only |

**About saving your work:**
- Both setups use Git (automatic with `/push` command)
- No GitHub Desktop needed - Claude handles it!
- Just type `/push` and your code saves to GitHub automatically

**Not sure which to choose?**
- Pick **Minimal** if you just want to start building NOW
- Pick **Full** if you want the pretty code editor (VS Code)

**You can always add VS Code later by asking Claude!**

### 3D. Follow Along with Claude

**What happens next:**

**If you chose Minimal Setup:**
- ✅ Claude checks your computer
- ✅ Installs Node.js, Git, Bun, Wrangler (if needed)
- ✅ Runs `npx oneie agent` (creates your project automatically)
- ✅ Starts dev server at `http://localhost:4321`
- ⏱️ **Takes 2-3 minutes**

**If you chose Full Setup:**
- ✅ Everything from Minimal, PLUS:
- ✅ Downloads and installs VS Code
- ✅ Installs VS Code extensions (Claude, Astro, Tailwind, etc.)
- ✅ Opens VS Code in your project
- ✅ Shows you around VS Code
- ✅ Teaches you useful keyboard shortcuts
- ⏱️ **Takes 4-5 minutes**

**What you do:**
- Just read what Claude says
- Answer "yes" or "ok" if asked
- Copy any commands Claude gives you
- Press Enter
- Relax while Claude does the work! ☕

**Claude is very patient and explains everything step by step.**

---

## Step 4: See Your First App!

When Claude is done, it will tell you to open your web browser.

**Open your web browser and go to:**

```
http://localhost:4321
```

**You'll see your app running!** 🎉

**What you're looking at:**
- This is YOUR app
- It's running on YOUR computer
- You just became a developer!

---

## What Just Happened?

**You now have everything you need!**

### ⚡ If You Chose Minimal Setup:

| What You Got | Why It's Awesome | Status |
|--------------|------------------|--------|
| **Terminal/PowerShell** | Your command center | ✅ Opened |
| **Claude Account** | Your AI coding buddy | ✅ Created |
| **Claude Code** | AI that writes code with you | ✅ Installed |
| **Node.js** | Runs JavaScript apps | ✅ Installed |
| **Git** | Saves your work safely | ✅ Installed |
| **Bun** | Installs things 10x faster | ✅ Installed |
| **Wrangler** | Publish to 330+ cities | ✅ Installed |
| **Your First App** | Running right now! | ✅ Built |

**Congratulations! You're a developer!** 🎉

### 💎 If You Chose Full Setup:

| What You Got | Why It's Awesome | Status |
|--------------|------------------|--------|
| **All the Minimal tools** | Everything above | ✅ Installed |
| **VS Code** | Pretty code editor | ✅ Installed |
| **Claude Extension** | Claude inside VS Code | ✅ Installed |
| **Astro Extension** | Syntax highlighting | ✅ Installed |
| **Tailwind Extension** | CSS autocomplete | ✅ Installed |
| **ESLint & Prettier** | Clean, pretty code | ✅ Installed |
| **Your First App** | Open in VS Code | ✅ Built |

**Bonus:** Git commits happen automatically with `/push` - no extra software needed! 🎉

**Congratulations! You're a PRO developer!** 🚀🎉

---

## What to Do Next

You're still in Claude Code (in your terminal). Try typing:

```
/one
```

Press Enter. This shows all the things you can build!

**Want to build something specific?** Type:

```
/chat "I want to build [your idea]"
```

**Examples:**
- `/chat "I want to build an online store"`
- `/chat "I want to build a blog"`
- `/chat "I want to build a portfolio website"`

Claude will help you build it step by step!

---

## Pro Tips After Setup

### ⚡ If You Chose Minimal Setup

**Want to add VS Code later?**

Just ask Claude anytime:
```
Hey Claude! Can you help me install Visual Studio Code and set it up for my project?
```

**That's it!** Claude will install VS Code and all the helpful extensions.

**Note:** You don't need any extra GitHub software. Just use `/push` in Claude to save your work to GitHub automatically! ✨

### 💎 If You Chose Full Setup

**Useful keyboard shortcuts in VS Code:**

- **`Ctrl + `` (backtick)** - Opens terminal at the bottom
- **`Ctrl + P`** - Quick find any file
- **`Ctrl + Shift + P`** - Opens command menu
- **`Ctrl + /`** - Add a comment
- **`Ctrl + S`** - Save your work

**In the VS Code terminal, type:**
```
/one
```

This opens the ONE control center with all your commands!

**If something looks confusing, just ask Claude:**
```
What does this button do?
```

**Claude is RIGHT THERE in VS Code to help you!** 💪

---

## Something Went Wrong?

### "Command not found: claude"

**Why:** Your terminal hasn't refreshed yet.

**Fix:**
1. Close your Terminal/PowerShell completely
2. Open it again (follow Step 1)
3. Try again

### "Permission denied" or "Access denied"

**Why:** You might not have admin access.

**Fix:**
- **Mac/Linux:** Put `sudo` before the command and enter your computer password
- **Windows:** Make sure you opened PowerShell as Administrator (see Step 1)

### "I can't find Terminal" (Mac)

**Fix:**
1. Open Finder
2. Click "Applications" on the left
3. Open the "Utilities" folder
4. Double-click "Terminal"

### "I closed the terminal by accident"

**Fix:**
- Just open it again (follow Step 1)
- Type `claude` and press Enter
- You're back!

### "Claude isn't responding"

**Fix:**
1. Press `Ctrl + C` to stop Claude
2. Type `claude` and press Enter to start again
3. Try your command again

### "The browser didn't open for sign-in"

**Fix:**
1. Manually open your browser
2. Go to: https://claude.ai/login
3. Sign in
4. Return to terminal and try `claude` again

### "Still stuck?"

**No problem!** In your terminal, type:

```
I'm having trouble with setup. Here's what happened: [describe what you see]

Can you help me troubleshoot?
```

Claude will help you fix it!

---

## Why Is This So Easy?

**Traditional way to become a developer:**
- Research which tools you need (confusing!)
- Install 10+ tools manually (each with its own installer)
- Configure them to work together (breaks easily)
- Read hundreds of pages of documentation
- Spend weeks learning commands
- Get stuck on cryptic errors alone
- Give up

**The ONE Platform way:**
- Install Claude (30 seconds - one command)
- Choose your setup path (minimal or full)
- Tell Claude what you want (copy one prompt)
- Claude detects your OS and installs everything
- Claude configures tools to work together
- Ask Claude when stuck
- Build apps in minutes

**You have an AI assistant who:**
- Knows every operating system (Mac, Windows, Linux)
- Installs tools the right way for your OS
- Configures everything to work together
- Explains what each tool does and why you need it
- Fixes errors for you (with actual solutions)
- Teaches you as you go (patient and clear)
- Never judges or gets impatient (even if you ask 100 times)

**Even better with `npx oneie agent`:**
- Claude runs this command to create your project
- Zero questions asked - it detects everything automatically
- Reads your git config, infers from conversation
- Creates project in 5-10 seconds
- No context switching, no forms to fill out

---

## Next Steps

Now that you're set up, explore:

- **[Quick Start Guide](/docs/getting-started/quick-start)** - Learn the basics
- **[Build Your First App](/docs/tutorial/your-first-app)** - Follow a complete tutorial
- **[How ONE Works](/docs/concepts/6-dimensions)** - Understand the magic behind ONE

---

## Welcome to Your New Superpower!

**Look what you just did! 🎉**

### You Did The "Impossible"

Most people think becoming a developer takes years. You just did it in minutes!

**You accomplished:**
- ✅ Opened a terminal for the first time
- ✅ Installed professional developer tools
- ✅ Created an AI assistant account
- ✅ Built your first real app
- ✅ **You're officially a developer!**

### ⚡ If You Chose Minimal Setup

**You now have:**
- Everything you need to build ANY app
- Bun (faster than what most pros use!)
- Wrangler (publish to 330 cities worldwide)
- A running app at http://localhost:4321
- Claude to help you every step

**You're ready to build!**

### 💎 If You Chose Full Setup

**You now have:**
- Everything from Minimal PLUS:
- VS Code (what professionals use every day)
- All the helpful extensions
- Claude extension right inside VS Code
- The EXACT same setup as senior developers

**Bonus:** `/push` command saves to GitHub automatically - no extra apps needed!

**You're set up like a pro!**

---

## What Should You Build First?

**In your terminal (or VS Code terminal), try:**

```
/chat "I want to build [your idea]"
```

**Ideas if you're not sure:**

- `/chat "I want to build a simple blog about my hobby"`
- `/chat "I want to build a website for my business"`
- `/chat "I want to build an online store to sell products"`
- `/chat "I want to build a portfolio to show my work"`
- `/chat "I want to build a tool that helps people [do something]"`

**Claude will help you build ANY of these!**

---

## Quick Commands to Remember

**Keep this handy:**

```bash
# Commands to use in Claude Code

/one              # See everything you can do
/chat [idea]      # Start building your idea
/now              # What am I working on?
/done             # Finished this step!
/push             # Save my work to GitHub
/deploy           # Put it online for the world!

# Commands in your terminal

bun run dev       # Start your app (see it at localhost:4321)
bun run build     # Get ready for publishing
wrangler pages deploy dist   # Publish to the world
```

**Not sure what a command does? Ask Claude:**
```
Hey Claude, what does /deploy do?
```

---

## You're Part of Something Special

**Most people give up because:**
- Setup is confusing
- They get stuck and have no help
- Errors are scary
- It feels lonely

**You succeeded because:**
- Setup was simple (Claude did it!)
- You have help 24/7 (Claude never sleeps)
- Errors get fixed (Claude explains them)
- You're never alone (Claude is always there)

---

## What's Next?

**Start building RIGHT NOW:**

1. **Type `/chat [your idea]`** in your terminal
2. **Tell Claude what you want to build**
3. **Follow along as Claude builds it with you**
4. **Ask questions whenever you're confused**
5. **Build something amazing!**

**Or learn more first:**

- [Quick Start Guide](/docs/getting-started/quick-start) - Learn the basics
- [Build Your First App](/docs/tutorial/your-first-app) - Step-by-step tutorial
- [How ONE Works](/docs/concepts/6-dimensions) - The magic explained

---

## Remember This

**Every professional developer started EXACTLY where you are right now.**

The difference? They kept going. And now you can too, with Claude by your side.

**You've got this!** 💪🚀

**Let's build something amazing together!**

Type `/chat [your idea]` and let's go! 🎉
