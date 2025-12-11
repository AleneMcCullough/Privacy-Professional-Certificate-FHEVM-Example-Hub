# How to Contribute

We welcome contributions to improve this FHEVM example hub!

## Getting Started

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/your-feature`
3. **Make your changes**
4. **Write tests** for new functionality
5. **Run tests**: `npm run test`
6. **Update documentation**
7. **Commit with clear message**
8. **Push to your fork**
9. **Create pull request**

## Types of Contributions

### Bug Reports
- Describe the issue
- Provide steps to reproduce
- Include expected vs actual behavior
- Share your environment (OS, Node version)

### Feature Requests
- Explain the use case
- Describe expected behavior
- Provide examples
- Consider security implications

### Documentation
- Improve existing guides
- Add tutorials
- Fix typos
- Add clarifying examples

### Code Contributions
- Add new examples
- Improve automation scripts
- Optimize contracts
- Enhance tests

## Code Standards

### Solidity
- Use Solidity 0.8.24
- Follow OpenZeppelin conventions
- Include natspec documentation
- Add security comments

### TypeScript/JavaScript
- Use TypeScript for new code
- Follow ESLint rules
- Include proper type annotations
- Add meaningful comments

### Tests
- Test coverage above 90%
- Include positive and negative cases
- Test authorization thoroughly
- Verify events are emitted

### Documentation
- Use clear, simple language
- Include code examples
- Explain the "why", not just the "what"
- Keep links current

## Commit Message Format

```
Type: Short description (50 chars max)

Longer explanation if needed. Explain why, not what.
Reference issues if applicable: Fixes #123

Type options: feat, fix, docs, style, refactor, perf, test, chore
```

## Pull Request Process

1. **Update documentation** if needed
2. **Add tests** for new functionality
3. **Ensure all tests pass**: `npm run test`
4. **Update CHANGELOG** if applicable
5. **Self-review** your code
6. **Request reviews** from maintainers

## Development Setup

```bash
# Clone repository
git clone <repo-url>
cd privacy-professional-certificate

# Install dependencies
npm install

# Verify setup
npm run compile
npm run test
```

## Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test test/examples/YourExample.test.ts

# Run with coverage
npm run test -- --coverage
```

## Documentation

When adding features:
1. Document in code with comments
2. Add guide in docs/
3. Update README if needed
4. Add examples where applicable

## Code Review

Reviews check for:
- Code quality and clarity
- Security implications
- Test coverage
- Documentation completeness
- Consistency with project style

## Community Guidelines

- Be respectful and inclusive
- Provide constructive feedback
- Help other contributors
- Share knowledge generously
- Follow the code of conduct

## Recognitions

Contributors are recognized:
- In commit history
- In project documentation
- In contributor list

## Questions?

- Check existing documentation
- Review past issues/PRs
- Ask in discussions
- Create an issue to discuss

Thank you for contributing!
