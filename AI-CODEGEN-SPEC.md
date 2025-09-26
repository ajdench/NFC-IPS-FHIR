# AI-CODEGEN-SPEC.md

**Purpose**  
This specification defines the standards for AI-assisted code generation across all languages, frameworks, and platforms (Swift, Flutter, React, Node, Three.js, etc.). It enforces modular, maintainable, and consistent codebases that avoid monolithic growth, hardcoding, or UI misalignment.  

---

## 1. General Principles
- Code must follow **modular, component-based, and/or object-oriented design** depending on the target language.  
- Follow **SOLID principles** and industry-standard design patterns where appropriate.  
- Avoid duplicating logic. Reuse shared utilities, constants, and helpers.  
- Code must be **readable and self-documenting** with meaningful names and inline comments.  

---

## 2. Architecture
- Always scaffold a **clear project structure** before writing detailed code.  
- Separate code into:
  - **Modules/Packages** (by domain or feature)  
  - **Components/Classes** (UI, logic, services, models)  
  - **Utilities** (shared helpers, constants, config)  
- Each file must have a **single responsibility**.  
- No circular dependencies.  
- Prefer **dependency injection** over hardcoded imports.  

---

## 3. UI Development
- Always reason about **user perspective vs code coordinate systems** explicitly:  
  - Use **leading/trailing** instead of left/right if the framework supports RTL/LTR.  
  - Define all spacing, padding, and alignment using **variables/tokens**, not inline magic numbers.  
- Layout must respect **hierarchies** (containers → children).  
- Avoid absolute positioning unless unavoidable.  
- For orientation-sensitive frameworks (e.g. SwiftUI, Flutter):  
  - State in comments what “top,” “bottom,” “leading,” and “trailing” refer to.  
- Never assume screen size. Use constraints, responsive units, or breakpoints.  

---

## 4. Global vs Local Variables
- **Never hardcode** values such as colors, fonts, dimensions, URLs, keys, or API endpoints.  
- Place them in:
  - `constants/` or `config/` files (language dependent).  
  - Theming systems (e.g. Flutter `ThemeData`, SwiftUI environment values).  
- All **global state** must be clearly documented and initialized in a central place.  
- Local adjustments must extend or override globals, not bypass them.  

---

## 5. Edits & Refactoring
- When modifying existing code, prefer **incremental refactor** over full regeneration.  
- Preserve naming, structure, and existing comments unless a global rename/refactor is required.  
- If a breaking change is necessary, document it in comments and provide a migration note.  
- Avoid introducing **orphaned or unused code**.  

---

## 6. Output Requirements
- Provide **code + explanations**.  
- Each major file/component must include:
  - Purpose description  
  - Example usage snippet  
  - Notes on dependencies and configuration  
- Provide diffs or patch-style outputs if editing existing code.  

---

## 7. Testing & Validation
- Generate **unit tests** for logic and **snapshot tests** for UI where frameworks support it.  
- Always validate against edge cases (empty state, null values, screen rotations, network errors).  
- No generated code should ship without test coverage.  

---

## 8. Documentation
- All generated projects must include:
  - `README.md` with setup instructions  
  - High-level architecture overview (diagram if applicable)  
  - List of environment variables and config files  
- Inline docstrings for all public functions/classes.  

---

## 9. Flexibility Clause
- Hard rules apply by default.  
- AI may deviate only if:  
  - Framework conventions strongly recommend a different structure.  
  - The user explicitly requests a simplified prototype.  
- Any deviation must be explained with reasoning.  

---

## 10. Example Prompt Integration
Before coding, prepend this spec as context to AI assistants (Claude Code, Codex, Gemini CLI, etc.). Example:

```
Follow the rules in AI-CODEGEN-SPEC.md. 
Always structure code modularly, avoid hardcoding, and respect UI orientation rules. 
Explain reasoning where deviations are necessary.
```
