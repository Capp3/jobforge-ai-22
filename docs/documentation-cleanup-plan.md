# Documentation Cleanup Plan

## Overview

This document outlines the plan for cleaning up the JobForge AI documentation to remove duplicate information, outdated content, and streamline the documentation structure.

## Files to Remove

These files contain duplicate or outdated information and should be removed:

1. **`docs/documentation-cleanup-summary.md`**
   - Reason: Contains outdated cleanup information from a previous effort
   - Alternative: This new plan replaces it

2. **`docs/documentation-update-summary.md`**
   - Reason: Contains outdated information about documentation updates
   - Alternative: Information is redundant with what's in tasks.md and other files

3. **`docs/migration-status.md`**
   - Reason: The migration is complete; this information is now historical
   - Alternative: Key migration information is already in architecture.md

4. **`docs/ci-cd-implementation-summary.md`**
   - Reason: Duplicate information with ci-cd-guide.md
   - Alternative: The comprehensive ci-cd-guide.md is sufficient

5. **`docs/README.md`** (in docs directory)
   - Reason: Redundant with index.md
   - Alternative: index.md serves as the documentation homepage

## Files to Update

1. **`docs/job-hunting-journey.md`**
   - Remove outdated n8n workflow concept section
   - Focus on the current implementation journey
   - Update the LLM prompt section to reference the new prompts.md file

2. **`docs/projectbrief.md`**
   - Update to reflect the current SQLite + Express.js architecture
   - Remove references to n8n, Google Sheets, and other outdated technologies
   - Keep the core job hunting workflow concepts that are still relevant

3. **`mkdocs.yml`**
   - Update navigation structure to reflect removed and consolidated files
   - Reorganize sections for better flow and clarity

4. **`docs/tasks.md`**
   - Remove completed tasks related to migration
   - Ensure focus is on current and future tasks

## New Files to Create

1. **`docs/current-architecture.md`**
   - Consolidate current architecture information from various files
   - Provide a clear, comprehensive view of the current system design

## Updated Navigation Structure

The proposed navigation structure for mkdocs.yml:

```yaml
nav:
  - Home: index.md
  - Getting Started:
    - Quick Start: quick-start.md
    - Setup Guide: setup-guide.md
  - System Information:
    - Architecture: architecture.md
    - Database Guide: database-setup-guide.md
    - Job Hunting Journey: job-hunting-journey.md
    - LLM Prompts: prompts.md
  - Development:
    - Tasks & Roadmap: tasks.md
    - CI/CD Pipeline: ci-cd-guide.md
  - Documentation:
    - GitHub Pages Setup: github-pages-setup.md
```

## Implementation Plan

1. Remove the identified files
2. Update the remaining files to ensure consistency
3. Update mkdocs.yml with the new navigation structure
4. Test the documentation locally to ensure it builds correctly
5. Push changes and verify the documentation is published correctly
