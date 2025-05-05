# Security Policy

## Supported Versions

We currently support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |

## Reporting a Vulnerability

If you discover a security vulnerability within Domus, please send an email to [your-email@example.com]. All security vulnerabilities will be promptly addressed.

Please include the following information in your report:
- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Measures

1. **Code Review**: All code changes require review and approval from code owners
2. **Dependency Scanning**: Regular automated scanning of dependencies for vulnerabilities
3. **Branch Protection**: Protected branches with required reviews and status checks
4. **Signed Commits**: All commits must be signed with a verified GPG key
5. **Access Control**: Strict access control through GitHub's permission system

## Best Practices

1. Never commit sensitive information (API keys, passwords, etc.)
2. Keep dependencies up to date
3. Follow secure coding practices
4. Report security issues responsibly
5. Use strong authentication methods

## Security Updates

Security updates will be released as soon as possible after a vulnerability is discovered and fixed. We will notify users through:
1. GitHub Security Advisories
2. Release notes
3. Email notifications (if provided) 