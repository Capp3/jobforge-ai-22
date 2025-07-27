# GitHub Pages Setup Guide

This guide helps you set up GitHub Pages for your JobForge AI documentation if the automatic setup doesn't work.

## Automatic Setup (Recommended)

The GitHub Actions workflow should automatically enable GitHub Pages. If you're seeing errors, try the following:

1. **Push the updated workflow**: The workflow now includes `enablement: true` which should automatically enable Pages
2. **Check the Actions tab**: Go to your repository's Actions tab to see if the workflow is running
3. **Wait for completion**: The first run may take a few minutes

## Manual Setup (If Automatic Fails)

If the automatic setup doesn't work, follow these steps:

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click on **Settings** tab
3. Scroll down to **Pages** section in the left sidebar
4. Under **Source**, select **GitHub Actions**
5. Click **Save**

### Step 2: Configure Pages Settings

1. In the same Pages section, ensure:
   - **Source** is set to "GitHub Actions"
   - **Branch** should be automatically set to `main`
   - **Folder** should be set to `/ (root)`

### Step 3: Trigger the Workflow

1. Go to **Actions** tab
2. Find the "Deploy Documentation" workflow
3. Click **Run workflow** button
4. Select the `main` branch
5. Click **Run workflow**

### Step 4: Verify Deployment

1. Wait for the workflow to complete (check the Actions tab)
2. Go back to **Settings** → **Pages**
3. You should see a green checkmark and a URL like:
   ```
   https://yourusername.github.io/jobforge-ai-22/
   ```

## Troubleshooting

### Common Issues

1. **"Pages not enabled" error**
   - Follow the manual setup steps above
   - Ensure you have admin access to the repository

2. **Workflow fails to run**
   - Check that the workflow file is in `.github/workflows/docs.yml`
   - Verify the file has proper YAML syntax
   - Check the Actions tab for error messages

3. **Build fails**
   - Check that `requirements.txt` exists and contains the required packages
   - Verify that `mkdocs.yml` is properly configured
   - Look at the build logs in the Actions tab

4. **Pages not updating**
   - Wait a few minutes for changes to propagate
   - Clear your browser cache
   - Check that the workflow completed successfully

### Repository Settings

Make sure your repository has the following settings:

1. **Repository visibility**: Public (required for free GitHub Pages)
2. **Pages source**: GitHub Actions
3. **Branch protection**: Ensure `main` branch allows GitHub Actions

### Permissions

The workflow requires these permissions:
- `contents: read` - To read repository files
- `pages: write` - To deploy to GitHub Pages
- `id-token: write` - For authentication

These are automatically configured in the workflow file.

## Custom Domain (Optional)

If you want to use a custom domain:

1. Go to **Settings** → **Pages**
2. Under **Custom domain**, enter your domain
3. Click **Save**
4. Add a CNAME record pointing to `yourusername.github.io`
5. Create a `CNAME` file in your repository root with your domain name

## Support

If you continue to have issues:

1. Check the [GitHub Pages documentation](https://docs.github.com/en/pages)
2. Review the workflow logs in the Actions tab
3. Open an issue in the repository with the error details 