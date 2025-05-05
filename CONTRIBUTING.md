# Contributing to Domus

Thank you for your interest in contributing to Domus! This document provides guidelines and instructions for contributing.

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/your-username/domus.git
   cd domus
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file based on `.env.example`
5. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a new branch for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```
2. Make your changes
3. Run tests:
   ```bash
   npm test
   ```
4. Run linting:
   ```bash
   npm run lint
   ```
5. Commit your changes:
   ```bash
   git commit -m "feat: your feature description"
   ```
6. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
7. Create a Pull Request

## Code Style

- Follow the existing code style
- Use meaningful variable and function names
- Add comments for complex logic
- Keep functions small and focused
- Write tests for new features
- Update documentation as needed

## Testing

- Write unit tests for new features
- Ensure all tests pass before submitting PR
- Maintain or improve test coverage
- Test edge cases and error conditions

## Pull Request Process

1. Update the README.md with details of changes if needed
2. Update the documentation if needed
3. The PR will be merged once you have the sign-off of at least one other developer
4. Make sure all CI checks pass

## Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

## Code of Conduct

- Be respectful and inclusive
- Be patient and welcoming
- Be thoughtful
- Be collaborative
- When disagreeing, try to understand why

## Questions?

Feel free to open an issue for any questions or concerns. 