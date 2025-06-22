# JS Top-Level Side Effect Linter (`side-effects-linter.js`)

Detects and reports **top-level side effects** in your JavaScript/TypeScript modules.

---

## 🚨 What are top-level side effects?

These are pieces of code that **run immediately when a module is imported**—such as:

- Service initializations (e.g., SDKs for Firebase, AWS, Azure, etc.)
- Assignments to global/window/globalThis properties
- Event listener setup (`window.addEventListener`)
- Function or method calls not wrapped inside a function/class
- Direct DOM mutations
- Any code that could cause unwanted state changes on import

These can lead to:
- Hard-to-debug race conditions
- Duplicate SDK initializations
- Global namespace pollution
- Unpredictable app behavior (especially in large, modular, or SPA projects)
- Security headaches

---

## 💡 Why use this tool?

Even if your project isn’t using Firebase, this linter catches **side effects for ANY stack**—AWS, Azure, Express, React, Vue, Angular, Next.js, browser, Node.js, you name it. If you ship modules, you need this.

---

## 🏃‍♂️ Quick Start

```bash
node side-effects-linter.js
Config

Update the UTILS_DIRS array at the top of the script to scan your desired directories.

Output
	•	Results print to the console and save to side-effect-report.txt
	•	Each finding includes:
	•	File path
	•	Line number
	•	Code snippet
	•	Human-friendly reason
	•	Suggestion for how to fix

⸻

🛠️ Example Output

File: src/utils/awsHelpers.js
Line: 10
Code:   AWS.config.update({ region: "us-east-1" });
Reason: Service initialization at top level (e.g., AWS SDK, Firebase, etc.)
Suggestion: Move this code into an exported function or class method.

File: src/utils/awsHelpers.js
Line: 10
Code:   AWS.config.update({ region: "us-east-1" });
Reason: Service initialization at top level (e.g., AWS SDK, Firebase, etc.)
Suggestion: Move this code into an exported function or class method.


⚡ How to Fix

Move any flagged code inside an exported function, class, or explicit setup method.
Never run code on import unless you intend it!

⸻

✨ Credit

Originally authored by Chris Osterhaug, inspired by real-world pain fighting module side effects in large codebases.

⸻

📜 License

MIT (do what you want, just keep this notice).
---

## 🚀 GitHub Launch Post

> 🛠️ New Dev Tool for Modern JS/TS Codebases!
>
> Ever had weird bugs, race conditions, or “mystery” initializations in your Node.js, frontend, or cloud-app project?  
> I built a **free, universal “Top-Level Side Effect Linter”** for JavaScript and TypeScript—no matter what stack (Firebase, AWS, Azure, plain browser, React, Express, etc).
>
> 🔍 It scans your modules and tells you if anything is running “just by being imported”—which can cause all kinds of pain in big apps.  
> Catches things like: SDK initializations, event listeners, global assignments, DOM mutations, top-level function calls.
>
> **Zero config. Zero risk. No code changes—just clear findings.**  
> Perfect for debugging why your app is acting “haunted.”
>
> - Use it on any project—cloud, frontend, backend, you name it.
> - MIT licensed, free for all.  
>
> Check it out / star it / fork it here: [GitHub Link]
>
> (And if it saves you a headache, drop me a line—always happy to help others dodge the chaos of accidental side effects!)
>
> #javascript #typescript #devtools #opensource #nodejs #webdev #softwareengineering #bughunting #productivity

---

Let me know if you want me to **refactor the actual script header/comments for “universal” branding** or want any code changes to make it even friendlier for public eyes.

Call to Action

If you like it, give it a ⭐️ on GitHub!
