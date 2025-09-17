# Contributing to Ticket Management System

Thank you for your interest in contributing to the Ticket Management System! This document provides guidelines and information for contributors.

## Getting Started

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git**
- Basic knowledge of TypeScript, React, and Next.js

### Initial Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/ticket-management.git
   cd ticket-management
   ```

3. **Install dependencies**:
   ```bash
   npm install
   ```

4. **Set up environment**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

5. **Initialize database**:
   ```bash
   npm run db:sync
   npm run db:seed
   ```

6. **Verify setup**:
   ```bash
   npm run setup:check
   ```

7. **Start development server**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Branch Strategy

- **main**: Production-ready code
- **develop**: Integration branch for features
- **feature/feature-name**: New features
- **fix/issue-description**: Bug fixes
- **hotfix/critical-fix**: Critical production fixes

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following our coding standards

3. **Test your changes**:
   ```bash
   npm test
   npm run test:coverage
   ```

4. **Check for database issues**:
   ```bash
   npm run db:check
   ```

5. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

7. **Create a Pull Request** on GitHub

## Code Standards

### TypeScript

- Use **strict TypeScript** configuration
- Define proper **interfaces and types**
- Avoid `any` type unless absolutely necessary
- Use **meaningful variable and function names**

### React/Next.js

- Use **functional components** with hooks
- Follow **Next.js App Router** conventions
- Implement **proper error boundaries**
- Use **server and client components** appropriately

### Styling

- Use **Tailwind CSS** for styling
- Follow **responsive design** principles
- Maintain **consistent spacing** and layout
- Use **semantic HTML** elements

### Database

- Write **clear Prisma schema** definitions
- Use **database transactions** for related operations
- Implement **proper error handling** for database operations
- Write **database migrations** when needed

## Testing

### Unit Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Database Testing

```bash
# Reset test database
npm run db:reset

# Seed test data
npm run db:seed
```

### Manual Testing

1. Test registration and login flows
2. Verify CRUD operations work correctly
3. Check responsive design on different devices
4. Test error handling scenarios

## Database Management

### Common Issues

If you encounter database lock issues:
```bash
npm run db:fix
```

For complete database reset:
```bash
npm run db:reset
npm run db:seed
```

### Migration Workflow

1. Make schema changes in `prisma/schema.prisma`
2. Run `npm run db:sync` to apply changes
3. Test the changes thoroughly
4. Commit both schema and generated files

## Pull Request Guidelines

### Before Submitting

- [ ] Code follows project standards
- [ ] Tests pass (`npm test`)
- [ ] TypeScript compiles without errors
- [ ] Database operations work correctly
- [ ] No console errors in browser
- [ ] Responsive design verified
- [ ] Documentation updated if needed

### PR Description Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Manual testing completed
- [ ] Database operations verified

## Screenshots
Include screenshots for UI changes.

## Additional Notes
Any additional information or context.
```

## Issue Reporting

### Bug Reports

When reporting bugs, include:
- **Steps to reproduce** the issue
- **Expected behavior**
- **Actual behavior**
- **Environment details** (OS, browser, Node.js version)
- **Error messages** or console logs
- **Screenshots** if applicable

### Feature Requests

When requesting features, include:
- **Clear description** of the feature
- **Use case** and motivation
- **Proposed implementation** (if any)
- **Additional context** or screenshots

## Common Development Tasks

### Adding a New API Route

1. Create route file in `src/app/api/`
2. Implement proper error handling
3. Add input validation with Zod
4. Write unit tests
5. Update API documentation

### Adding a New Component

1. Create component in `src/components/`
2. Use TypeScript interfaces for props
3. Implement responsive design
4. Add accessibility features
5. Write component tests

### Database Schema Changes

1. Update `prisma/schema.prisma`
2. Run `npm run db:sync`
3. Test migrations
4. Update seed data if needed
5. Document breaking changes

## Getting Help

- **Documentation**: Check README.md and DATABASE_TROUBLESHOOTING.md
- **Issues**: Search existing issues on GitHub
- **Questions**: Create a new issue with the "question" label
- **Setup Problems**: Run `npm run setup:check` for diagnostics

## Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and grow
- Follow project guidelines
- Report any inappropriate behavior

Thank you for contributing to the Ticket Management System! 🎫
