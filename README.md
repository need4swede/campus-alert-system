# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/9f6e389a-6b2e-4b9e-8b93-2af189af148d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9f6e389a-6b2e-4b9e-8b93-2af189af148d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Authentication System

This project uses a dual authentication system:

- **Development Mode**: Uses local authentication with mock users for easy testing
- **Production Mode**: Integrates with Microsoft OAuth for secure authentication

### Setting up Microsoft OAuth

To set up Microsoft OAuth for production:

1. Register your application in the [Azure Portal](https://portal.azure.com/)
2. Create an App Registration and configure the redirect URI to match your production domain
3. Update the `.env.production` file with your Microsoft OAuth credentials:
   - `VITE_MS_CLIENT_ID`: Your Microsoft OAuth client ID
   - `VITE_MS_TENANT_ID`: Your Microsoft OAuth tenant ID
   - `VITE_MS_REDIRECT_URI`: Your OAuth callback URL (e.g., https://your-domain.com/auth/callback)

### Development Authentication

In development mode, you can use the following test accounts:

- Regular User: `user@school.edu` / `password`
- Admin User: `admin@school.edu` / `password`
- Super Admin: `superadmin@school.edu` / `password`

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/9f6e389a-6b2e-4b9e-8b93-2af189af148d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
