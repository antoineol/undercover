# Development Setup

This document describes the development setup for the Undercover game project, including code formatting and linting configuration.

## Code Formatting & Linting

This project uses **Prettier** for code formatting and **ESLint** for code linting, configured to work together seamlessly.

### Prettier Configuration

- **Config file**: `.prettierrc`
- **Ignore file**: `.prettierignore`
- **Settings**: Single quotes, semicolons, 2-space indentation, 80-character line width

### ESLint Configuration

- **Config file**: `eslint.config.mjs`
- **Integration**: Works with Prettier to avoid conflicts
- **Rules**: Next.js + TypeScript + Prettier integration

### Available Scripts

```bash
# Format all files
bun run format

# Check formatting without fixing
bun run format:check

# Lint all files
bun run lint

# Lint and fix auto-fixable issues
bun run lint:fix

# Check both linting and formatting
bun run check

# Fix both linting and formatting
bun run fix
```

### IDE Integration

The project includes VS Code/Cursor IDE settings in `.vscode/settings.json` that:

- Enable format on save
- Set Prettier as the default formatter
- Configure ESLint integration
- Enable auto-fix on save
- Set up proper file associations

### Recommended Extensions

The project recommends these VS Code/Cursor extensions (see `.vscode/extensions.json`):

- `esbenp.prettier-vscode` - Prettier formatter
- `dbaeumer.vscode-eslint` - ESLint integration
- `bradlc.vscode-tailwindcss` - Tailwind CSS support
- `ms-vscode.vscode-typescript-next` - TypeScript support

### Workflow

1. **Before committing**: Run `bun run check` to ensure code quality
2. **Auto-fix issues**: Run `bun run fix` to automatically fix formatting and linting issues
3. **Format on save**: The IDE will automatically format files when you save them

### Configuration Details

#### Prettier Settings

- Single quotes for strings
- Semicolons at the end of statements
- 2-space indentation
- 80-character line width
- Trailing commas in ES5-compatible locations
- Arrow function parentheses only when needed

#### ESLint Rules

- Disabled conflicting rules that Prettier handles
- Prettier integration as an ESLint rule
- TypeScript and Next.js specific rules
- Proper file exclusions for generated files

### Troubleshooting

If you encounter issues:

1. **Format conflicts**: Run `bun run format` to fix formatting issues
2. **Lint errors**: Run `bun run lint:fix` to auto-fix issues
3. **IDE not formatting**: Check that the Prettier extension is installed and enabled
4. **ESLint errors**: Ensure the ESLint extension is installed and the config is valid

### File Exclusions

The following files/directories are excluded from formatting and linting:

- `node_modules/`
- `.next/`
- `convex/_generated/`
- Build outputs (`out/`, `build/`, `dist/`)
- Generated files (`*.generated.*`)
- Lock files and config files
