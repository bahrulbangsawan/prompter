# Prompt Enhancer

A sophisticated AI-powered application that transforms rough software ideas into structured, AI-ready YAML prompts optimized for large language models like Grok, GPT-4, and Claude. Built with modern Next.js 15, TypeScript, and a carefully crafted UI using shadcn/ui components.

## 🌟 Overview

Prompt Enhancer bridges the gap between vague human requirements and precise AI instructions. Whether you're a developer, product manager, or designer, this tool helps you articulate your ideas in a structured format that AI assistants can understand and execute effectively.

### Key Capabilities

- **🎯 Smart Prompt Enhancement**: Converts natural language descriptions into structured YAML prompts with proper AI optimization techniques
- **🔧 Project-Aware Configuration**: Tailors prompts based on your specific technology stack and project context
- **📝 Intelligent Formatting**: Automatically applies AI prompt engineering best practices and structure
- **🚀 Production-Ready Output**: Generates professional YAML prompts ready for immediate use with AI assistants
- **⚡ Lightning Fast**: Optimized performance with caching and intelligent debouncing

## ✨ Features

### Core Functionality

- **🎨 Free-Form Input**: Describe your requirements in natural language - no technical knowledge required
- **📏 Word Limit Control**: Choose target output length to get responses of appropriate detail
- **🎯 DOM Scoping** (Optional): Limit AI focus to specific page elements using CSS selectors
- **📋 Syntax Highlighting**: Beautiful, color-coded YAML output for easy reading and copying
- **📤 One-Click Copy**: Instantly copy enhanced prompts to your clipboard
- **🔄 Regenerate**: Re-run enhancement with the same or modified parameters
- **💾 Smart Caching**: Identical requests return cached results for instant feedback

### Technology Stack Management

- **🏗️ Comprehensive Tech Library**: Pre-configured options for:
  - **Frontend**: React, Next.js, Vue, Angular, Svelte, TypeScript, JavaScript
  - **Backend**: Node.js, Express, NestJS, Django, Flask, FastAPI, Spring Boot, Go, Rust, Python
  - **Database**: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Supabase, Prisma, Drizzle ORM
  - **Tools**: Docker, Kubernetes, Vercel, Netlify, AWS, GitHub Actions, Tailwind CSS
  - **UI Libraries**: shadcn/ui, Radix UI, Material-UI, Ant Design, Chakra UI, and 50+ more
- **🔄 Persistent Configuration**: Your tech stack preferences are saved and automatically applied to enhance prompts
- **🎛️ Customizable**: Add your own technologies or modify existing ones

### User Experience

- **⌨️ Keyboard Shortcuts**:
  - `Cmd/Ctrl + K` - Focus input field
  - `Cmd/Ctrl + Enter` - Submit form
- **📱 Fully Responsive**: Works seamlessly on desktop, tablet, and mobile devices
- **🎨 Dark/Light Mode**: Automatic theme detection and manual toggle capability
- **🔔 Toast Notifications**: Clear feedback for all user actions
- **♿ Accessibility**: Full keyboard navigation and screen reader support
- **🔄 Error Handling**: Graceful API error recovery with retry logic

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd prompt-enhancer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Environment Variables**

   Create a `.env.local` file at the project root:

   ```bash
   # Required: Your Grok API key (server-side only for security)
   GROK_API_KEY=your_grok_api_key_here

   # Optional: Override the default Grok API base URL
   NEXT_PUBLIC_GROK_API_URL=https://api.x.ai/v1
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```

5. **Open Application**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🔧 Configuration

### API Setup

To use the full functionality of Prompt Enhancer, you'll need a Grok API key:

1. Visit [x.ai](https://x.ai/) and sign up for API access
2. Generate your API key
3. Add it to your `.env.local` file as shown above

**Security Note**: Your API key is only used server-side through Next.js API routes to prevent CORS issues and maintain security.

### Customization

The application is highly customizable:

- **Add Custom Technologies**: Modify the technology options in `src/components/setup-form.tsx`
- **Adjust Prompt Templates**: Customize the enhancement logic in `src/lib/api/grok-client.ts`
- **Change UI Themes**: Modify Tailwind CSS configuration in `tailwind.config.js`
- **Extend Validation**: Update Zod schemas in `src/lib/schemas/form-schemas.ts`

## 🏗️ Technical Architecture

### Framework Stack

- **[Next.js 15](https://nextjs.org/)** with App Router and TypeScript
- **[React 18](https://react.dev/)** with modern hooks and patterns
- **[Tailwind CSS](https://tailwindcss.com/)** for utility-first styling
- **[shadcn/ui](https://ui.shadcn.com/)** for accessible component primitives

### State Management

- **[Zustand](https://zustand-demo.pmnd.rs/)** for lightweight, persistent state management
- **Local Storage Integration**: Automatic persistence of user preferences
- **React Hook Form** for form state and validation

### Data Layer

- **[Zod](https://zod.dev/)** for runtime type validation and TypeScript schemas
- **[js-yaml](https://github.com/nodeca/js-yaml)** for YAML parsing and generation
- **Custom API Client** for Grok integration with error handling and retry logic

### Performance Optimizations

- **React.memo**: Component memoization for expensive re-renders
- **useMemo/useCallback**: Hook-level optimization for expensive computations
- **Debouncing**: Smart debouncing for search and API calls
- **Virtual Scrolling**: Efficient rendering for large option lists
- **Code Splitting**: Automatic route-based code splitting
- **Image Optimization**: Next.js automatic image optimization

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── enhance/                  # Prompt enhancement workflow
│   │   ├── page.tsx             # Main enhance page component
│   │   └── layout.tsx           # Enhance page layout
│   ├── setup/                   # Technology stack configuration
│   │   ├── page.tsx             # Setup page component
│   │   └── layout.tsx           # Setup page layout
│   ├── demo/                    # Demo and examples
│   │   └── page.tsx             # Demo page component
│   ├── layout.tsx              # Root layout component
│   ├── globals.css              # Global styles
│   └── loading.tsx              # Loading component
├── components/                  # Reusable UI components
│   ├── ui/                     # shadcn/ui component primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── tabs.tsx
│   │   ├── toast.tsx
│   │   ├── badge.tsx
│   │   ├── popover.tsx
│   │   ├── command.tsx
│   │   └── multi-select-optimized.tsx
│   ├── enhance-form.tsx         # Main enhancement form
│   ├── setup-form.tsx           # Technology stack configuration
│   ├── yaml-result.tsx          # YAML display component
│   └── navigation-tabs.tsx     # Tab navigation component
├── lib/                         # Core business logic
│   ├── api/                     # API integration layer
│   │   └── grok-client.ts       # Grok API client with error handling
│   ├── schemas/                 # Data validation schemas
│   │   └── form-schemas.ts      # Form validation with Zod
│   ├── store/                   # State management
│   │   └── setup-store.ts       # Zustand store for configuration
│   └── utils/                   # Utility functions
│       └── index.ts             # Common utilities
├── types/                       # TypeScript type definitions
│   └── index.ts                 # Main type definitions
└── public/                      # Static assets
    └── ...                     # Images, icons, etc.
```

## 🎯 Usage Guide

### 1. Setup Your Technology Stack

1. Navigate to the **Setup** tab
2. Select your frontend technologies (required)
3. Choose backend frameworks and databases (optional)
4. Add development tools and UI libraries (optional)
5. Click "Save Configuration"

### 2. Enhance Your Prompts

1. Go to the **Enhance Prompt** tab
2. Describe what you want to build or improve in the text area
3. Select your desired word limit
4. (Optional) Add a CSS selector to focus on specific page elements
5. Click "Enhance Prompt" or use `Cmd/Ctrl + Enter`

### 3. Use Your Enhanced Prompt

1. Review the generated YAML prompt in the output area
2. Click the copy button to copy it to your clipboard
3. Paste it directly into your preferred AI assistant
4. Get high-quality, context-aware results

## 🔧 Advanced Features

### Caching System

The application implements intelligent caching to avoid unnecessary API calls:

- **Request Deduplication**: Identical prompts return cached results instantly
- **Local Storage**: Enhanced prompts are cached locally for offline access
- **Cache Invalidation**: Smart cache management based on content changes

### Error Handling & Resilience

- **API Retry Logic**: Automatic retry with exponential backoff for failed requests
- **Graceful Degradation**: User-friendly error messages and recovery options
- **Network Detection**: Offline mode indicators and local fallbacks

### Performance Optimizations

- **Virtual Scrolling**: Efficient rendering of large technology option lists
- **Lazy Loading**: Components load on-demand for faster initial load
- **Code Splitting**: Automatic separation of bundle sizes
- **Memoization**: Intelligent caching of expensive computations

## 🧪 Testing

### Linting

```bash
npm run lint
```

### Type Checking

```bash
npm run type-check
```

### Build Testing

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

## 🔒 Security Considerations

- **API Key Protection**: API keys are only used server-side and never exposed to the client
- **Input Sanitization**: All user inputs are validated and sanitized
- **XSS Prevention**: Built-in protection against cross-site scripting
- **CSRF Protection**: Implement token-based CSRF protection for forms
- **Content Security Policy**: Configurable CSP headers for enhanced security

## 📱 Browser Support

- **Chrome** (Latest)
- **Firefox** (Latest)
- **Safari** (Latest)
- **Edge** (Latest)
- **Mobile Browsers** (iOS Safari, Android Chrome)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use semantic commit messages
- Add appropriate tests for new features
- Update documentation as needed
- Ensure all linting passes

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Next.js Team** for the excellent React framework
- **shadcn/ui** for the beautiful component library
- **Vercel** for the deployment platform
- **Tailwind CSS** for the utility-first CSS framework
- **Grok AI** for providing the powerful language model API

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page for existing solutions
2. Create a new issue with detailed information about the problem
3. Include steps to reproduce and expected behavior
4. Mention your browser and operating system

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies**
