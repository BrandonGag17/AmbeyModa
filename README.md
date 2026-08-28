# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Supabase setup

1. Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_KEY` with the project's public URL and publishable key.
2. In Supabase Dashboard, open Authentication > Providers > Email and enable Email provider.
3. Create the administrator user in Authentication > Users with the email and password that should access the admin screens.
4. Run `supabase/security_policies.sql` in the Supabase SQL Editor.

The current schema has no verified roles or administrator profile table. Therefore, the client and RLS policies treat every authenticated Supabase user as an administrator. Add a role table and change the policies before creating non-admin accounts.
