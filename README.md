
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/dd34faa8-f2b9-4cd0-8328-bd9c99b92734

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/dd34faa8-f2b9-4cd0-8328-bd9c99b92734) and start prompting.

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

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/dd34faa8-f2b9-4cd0-8328-bd9c99b92734) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes it is!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)


# IoT Agent Mesh

A modern web-based platform for managing IoT device agents, built using React, Supabase, Tailwind CSS, and TypeScript.

## 🌐 Project Overview
This project provides a UI and backend system for users to:
- Register and manage organisations and users
- Add and configure IoT agents
- View telemetry and device status
- Configure alerts, automations, and integrations

## ⚙️ Tech Stack
- **Frontend**: React + Vite + TypeScript + Tailwind CSS + Shadcn/UI
- **Backend**: Supabase (PostgreSQL, Auth, RLS, Edge Functions)
- **Tooling**: ESLint, Vitest, Prettier

## 🚀 Quickstart
```bash
# 1. Clone the repo
$ git clone https://github.com/arilonUK/iotagentmesh.git
$ cd iotagentmesh

# 2. Install dependencies
$ npm install

# 3. Copy and configure environment variables
$ cp .env.example .env
# Fill in SUPABASE_URL and SUPABASE_ANON_KEY

# 4. Start development server
$ npm run dev
