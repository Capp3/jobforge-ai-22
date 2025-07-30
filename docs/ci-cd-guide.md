# CI/CD Pipeline Guide

This document explains the CI/CD pipeline for JobForge AI, including automated testing, building, deployment, and maintenance workflows.

## Overview

JobForge AI uses GitHub Actions for a comprehensive CI/CD pipeline with the following workflows:

1. **CI Pipeline** (`ci.yml`) - Continuous Integration for every push/PR
2. **CD Pipeline** (`cd.yml`) - Continuous Deployment for releases
3. **Documentation** (`docs.yml`) - Documentation deployment
4. **Maintenance** (`maintenance.yml`) - Weekly health checks and updates

## CI Pipeline (Continuous Integration)

### Triggers
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop` branches
- Manual dispatch

### Workflow Jobs

#### 1. Code Quality & Security
- **ESLint**: Code style and quality checks
- **Security Audit**: npm audit for vulnerability scanning
- **Node.js 18**: Primary development environment

#### 2. Build & Test (Matrix Strategy)
- **Multi-version testing**: Node.js 18 and 20
- **Frontend build**: `npm run build`
- **Backend build**: `npm run build:server`
- **Server health test**: Automated startup and health check
- **Artifact upload**: Build artifacts for downstream jobs

#### 3. Database Tests
- **SQLite initialization**: Automatic database creation test
- **Database integrity**: File creation and table validation
- **Cleanup**: Automatic test data cleanup

#### 4. Production Build Test
- **Production build**: Full production build process
- **Production server**: Test production server startup
- **API validation**: Health and frontend serving tests
- **End-to-end validation**: Complete application functionality

#### 5. CI Summary
- **Aggregated results**: Summary of all CI job results
- **GitHub Summary**: Rich markdown summary in GitHub interface

### CI Status Badge

Add to README.md:
```markdown
[![CI Pipeline](https://github.com/your-org/jobforge-ai/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/jobforge-ai/actions/workflows/ci.yml)
```

## CD Pipeline (Continuous Deployment)

### Triggers
- **Git tags**: Version tags like `v1.0.0`, `v2.1.3`
- **GitHub releases**: Published releases
- **Manual dispatch**: Environment selection (staging/production)

### Workflow Jobs

#### 1. Release Validation
- **Version extraction**: Automatic version detection from tags
- **Release detection**: Determines if this is a release or manual run
- **Validation checks**: Ensures proper release format

#### 2. Build Release Artifacts
- **Production build**: Optimized frontend and backend builds
- **Release packaging**: Creates deployable packages
- **Deployment scripts**: Generates automated deployment scripts
- **Tarball creation**: Compressed release archives

#### 3. Docker Image Creation
- **Multi-stage build**: Optimized Docker images
- **Security**: Non-root user, health checks
- **Container registry**: Pushes to GitHub Container Registry (ghcr.io)
- **Multiple tags**: Version, branch, and commit-based tags

#### 4. GitHub Release
- **Automated release notes**: Generated from template
- **Asset upload**: Release tarballs and deployment scripts
- **Documentation links**: Links to setup guides and docs
- **Version management**: Proper semantic versioning

### Release Process

#### Creating a Release

1. **Tag the version**:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Or create a GitHub release**:
   - Go to GitHub → Releases → Create new release
   - Choose tag version (e.g., `v1.0.0`)
   - Add release notes
   - Publish release

#### Using Released Artifacts

**Docker Deployment**:
```bash
docker pull ghcr.io/your-org/jobforge-ai:v1.0.0
docker run -p 3001:3001 -v $(pwd)/data:/app/data ghcr.io/your-org/jobforge-ai:v1.0.0
```

**Manual Deployment**:
```bash
# Download from releases page
wget https://github.com/your-org/jobforge-ai/releases/download/v1.0.0/jobforge-v1.0.0.tar.gz

# Extract and deploy
tar -xzf jobforge-v1.0.0.tar.gz
cd jobforge-v1.0.0
./deploy.sh
```

## Documentation Pipeline

### Triggers
- Changes to `docs/` directory
- Changes to `mkdocs.yml`
- Manual dispatch

### Process
- **Python setup**: MkDocs environment
- **Build docs**: Generate static site
- **Deploy**: GitHub Pages deployment
- **Accessibility**: Public documentation site

### Documentation URL
- **Production**: `https://your-org.github.io/jobforge-ai/`
- **Staging**: Available during PR previews

## Maintenance Pipeline

### Schedule
- **Weekly**: Every Monday at 9 AM UTC
- **Manual**: On-demand execution

### Maintenance Tasks

#### 1. Security Audit
- **npm audit**: Vulnerability scanning
- **Auto-fix detection**: Identifies fixable issues
- **Report generation**: Detailed security reports

#### 2. Dependency Updates
- **Outdated packages**: Identifies packages needing updates
- **Update preview**: Shows what would be updated
- **Compatibility check**: Ensures updates won't break builds

#### 3. Application Health Check
- **Build validation**: Ensures current codebase builds
- **Server startup**: Tests production server functionality
- **Database validation**: SQLite initialization and integrity
- **API testing**: Health endpoint validation

#### 4. Documentation Health
- **MkDocs build**: Validates documentation builds
- **Link checking**: Basic broken link detection
- **File inventory**: Documentation completeness check

## Pipeline Configuration

### Environment Variables

#### Required for CD Pipeline
```bash
# GitHub Container Registry (automatic)
GITHUB_TOKEN=<github_token>

# Optional: Custom container registry
DOCKER_REGISTRY=ghcr.io
DOCKER_USERNAME=<username>
DOCKER_PASSWORD=<password>
```

#### Optional Configuration
```bash
# Customize CI behavior
CI_SKIP_SECURITY_AUDIT=false
CI_NODE_VERSIONS="18,20"
CI_TIMEOUT_MINUTES=30

# Customize CD behavior
CD_CREATE_DOCKER_IMAGE=true
CD_AUTO_RELEASE=true
```

### Secrets Configuration

In GitHub repository settings → Secrets and variables → Actions:

1. **GITHUB_TOKEN**: Automatically provided by GitHub
2. **Custom secrets** (if using external services):
   - `DOCKER_HUB_USERNAME`
   - `DOCKER_HUB_TOKEN`
   - `SLACK_WEBHOOK` (for notifications)

## Workflow Customization

### Adding New Tests

Edit `.github/workflows/ci.yml`:

```yaml
- name: Custom Tests
  run: |
    # Add your custom test commands
    npm run test:custom
    npm run integration-test
```

### Custom Deployment Targets

Edit `.github/workflows/cd.yml`:

```yaml
deploy-staging:
  name: Deploy to Staging
  runs-on: ubuntu-latest
  needs: build
  if: github.ref == 'refs/heads/develop'
  
  steps:
    - name: Deploy to staging server
      run: |
        # Your staging deployment commands
```

### Notification Integration

Add to any workflow:

```yaml
- name: Notify on failure
  if: failure()
  uses: 8398a7/action-slack@v3
  with:
    status: failure
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## Monitoring and Debugging

### Pipeline Status

1. **GitHub Actions tab**: View all workflow runs
2. **Status badges**: Real-time status in README
3. **Email notifications**: GitHub settings → Notifications

### Debugging Failed Builds

1. **Check logs**: Click on failed job in GitHub Actions
2. **Artifact download**: Download build artifacts for inspection
3. **Re-run jobs**: Re-run individual jobs or entire workflows
4. **Local testing**: Reproduce issues locally

### Common Issues

#### CI Pipeline Issues

**Build failures**:
```bash
# Test locally
npm ci
npm run build
npm run build:server
```

**Health check timeouts**:
```bash
# Check if server starts locally
npm run start:prod
curl http://localhost:3001/api/health
```

#### CD Pipeline Issues

**Docker build failures**:
```bash
# Test Docker build locally
docker build -t jobforge-test .
docker run -p 3001:3001 jobforge-test
```

**Release creation failures**:
- Check tag format (must be `v*.*.*`)
- Verify permissions for creating releases
- Ensure all required files are present

## Best Practices

### Development Workflow

1. **Feature branches**: Create feature branches from `develop`
2. **Pull requests**: Always use PRs to `develop` or `main`
3. **CI validation**: Ensure CI passes before merging
4. **Code review**: Require reviews for all changes

### Release Management

1. **Semantic versioning**: Use proper semver (v1.2.3)
2. **Release notes**: Include meaningful change descriptions
3. **Testing**: Thoroughly test before tagging releases
4. **Rollback plan**: Keep previous versions available

### Security

1. **Dependency updates**: Regular security audits
2. **Secret management**: Use GitHub secrets for sensitive data
3. **Minimal permissions**: Grant only required permissions
4. **Image scanning**: Regular container security scans

### Performance

1. **Cache optimization**: Use npm cache in CI
2. **Parallel jobs**: Run independent jobs in parallel
3. **Artifact management**: Clean up old artifacts
4. **Resource limits**: Set appropriate timeout values

## Troubleshooting

### Pipeline Not Triggering

1. **Check trigger conditions**: Verify branch names and paths
2. **Permissions**: Ensure workflow has required permissions
3. **Syntax**: Validate YAML syntax
4. **Repository settings**: Check Actions are enabled

### Failed Database Tests

1. **SQLite dependencies**: Ensure better-sqlite3 compiles
2. **File permissions**: Check write permissions for data directory
3. **Timeout issues**: Increase server startup timeout

### Docker Build Issues

1. **Multi-platform**: Consider platform-specific builds
2. **Dependencies**: Ensure all dependencies are in package.json
3. **Build context**: Check .dockerignore file
4. **Cache**: Clear build cache if needed

---

This CI/CD pipeline provides a robust foundation for developing, testing, and deploying JobForge AI with confidence and automation. 