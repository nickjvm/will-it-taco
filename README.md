# Will it Taco? 🔮🌮✨

Combining your imagination with the power of AI, find out if your random ingredient has the potential to become the next viral taco sensation!

## Introduction

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

### Environment Variables

Create a `.env` file in the root of the project and add the following variables:

```bash
TURSO_DATABASE_URL=
TURSO_AUTH_TOKEN=
OPENAI_API_KEY=
```

### Database

The database is managed using [Drizzle](https://drizzle ORM). To run migrations, use the following commands:

```bash
npm run db:push
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.