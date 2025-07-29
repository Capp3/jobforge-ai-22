# JobForge AI

A job application tracking system built with React, TypeScript, and Supabase.

## 📚 Documentation

📖 **[View Full Documentation](https://jobforge-ai.github.io/jobforge-ai-22/)** - Complete setup and usage guide

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` to see the application.

## Features

- **Job Tracking**: Keep track of all your job applications in one place
- **AI-Powered Analysis**: Get intelligent ratings and insights for job opportunities  
- **Status Management**: Track applications through different stages
- **Cloud Deployment**: Works with Supabase Cloud for easy setup

## Technology Stack

- **Frontend**: React, TypeScript, Vite, shadcn/ui
- **Backend**: Supabase Cloud (PostgreSQL database + API)
- **Deployment**: Serve locally or deploy to any static hosting service

## Setup

This application works with Supabase Cloud. For detailed setup instructions, see the [Setup Guide](https://jobforge-ai.github.io/jobforge-ai-22/setup-guide/).

### Prerequisites

- Node.js and npm
- Supabase Cloud account (free tier available)
- Basic understanding of PostgreSQL

### Quick Setup

1. Create a Supabase Cloud project
2. Update Supabase configuration in `src/integrations/supabase/client.ts`
3. Set up database schema (see [Database Setup Guide](https://jobforge-ai.github.io/jobforge-ai-22/database-setup-guide/))
4. Start the development server with `npm run dev`

## Development

### Documentation

This project uses MkDocs for documentation. To work with the documentation locally:

```bash
# Install MkDocs dependencies
pip install -r requirements.txt

# Serve documentation locally
mkdocs serve

# Build documentation
mkdocs build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally with Vite
- `npm run serve` - Serve production build with http-server
- `npm run lint` - Run ESLint

## Production Deployment

After building the application:

```bash
# Build for production
npm run build

# Serve locally with http-server
npm run serve
```

The application will be available at `http://localhost:8080`.

You can also deploy the contents of the `dist` directory to any static hosting service like Vercel, Netlify, or GitHub Pages.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- 📖 [Documentation](https://jobforge-ai.github.io/jobforge-ai-22/)
- 🐛 [Report Issues](https://github.com/jobforge-ai/jobforge-ai-22/issues)
- 💬 [Discussions](https://github.com/jobforge-ai/jobforge-ai-22/discussions)

---

Built with ❤️ using modern web technologies
