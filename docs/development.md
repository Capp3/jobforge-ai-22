# Development Guidelines

## Automated Code Quality

This project uses automated linting to maintain code quality and consistency.

### Linting Rules

The following linting automation is in place:

#### 1. **Pre-commit Hooks** 
- **Husky** automatically runs ESLint on all staged files before each commit
- **lint-staged** ensures only modified files are linted for faster execution
- Commits will be **blocked** if linting errors are found

#### 2. **Build Integration**
- `npm run build` now includes linting as a prerequisite
- Production builds will **fail** if linting errors exist
- Use `npm run build:dev` for development builds without linting

#### 3. **GitHub Actions**
- Separate **lint workflow** runs on all pushes and pull requests
- Linting failures are reported with annotations in PRs
- SARIF format integration for advanced error reporting

#### 4. **VS Code Integration**
- Auto-fix on save enabled for supported rules
- Real-time linting feedback in the editor
- Consistent formatting across the team

### Available Scripts

```bash
# Run linting manually
npm run lint

# Run linting with auto-fix
npm run lint:fix

# Run linting + build (full check)
npm run check-all

# Development build (no linting)
npm run build:dev

# Production build (with linting)
npm run build
```

### Workflow

1. **During Development**: 
   - VS Code provides real-time feedback
   - Save files to auto-fix simple issues

2. **Before Commit**:
   - Pre-commit hook automatically lints staged files
   - Fix any reported errors before the commit proceeds

3. **In CI/CD**:
   - Separate lint job provides fast feedback
   - Build jobs include linting for production safety

### Bypassing Linting

**Not recommended**, but for emergencies:

```bash
# Skip pre-commit hooks (use sparingly)
git commit --no-verify -m "Emergency commit"

# Development build without linting
npm run build:dev
```

### Linting Configuration

- **ESLint config**: Standard TypeScript/React rules
- **Prettier integration**: Consistent code formatting
- **React hooks rules**: Prevents common React pitfalls
- **TypeScript strict mode**: Enhanced type safety

### Adding New Rules

1. Update `.eslintrc.js` configuration
2. Run `npm run lint:fix` to apply to existing code
3. Test with `npm run check-all`
4. Document any breaking changes

This automated approach ensures:
- **Consistent code quality** across all contributors
- **Early error detection** before code reaches production
- **Reduced manual review time** for code style issues
- **Improved maintainability** of the codebase