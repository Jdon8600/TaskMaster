# TaskMaster

TaskMaster is a full-stack task app with:

- a Rails back-end
- an Angular front-end
- Capacitor support for Android builds

## Prerequisites

Install these first:

- Ruby 3.x
- Bundler
- PostgreSQL
- Node.js
- npm
- Angular CLI if you want to run `ng` directly:

```bash
npm install -g @angular/cli
```

Docs for rails install:
https://guides.rubyonrails.org/install_ruby_on_rails.html



## Repository Layout

- `taskmaster-backend` - Rails API
- `taskmaster-frontend` - Angular client

## Backend Setup

Navigate to `/taskmaster-backend` and run:

```bash
bundle install
bin/rails db:create db:migrate db:seed
bin/rails server -b 0.0.0.0 -p 3000
```

Notes:

- The default development database is `taskmaster_backend_development`.
- If PostgreSQL auth or host settings differ on your machine, update `taskmaster-backend/config/database.yml`.

## Frontend Setup

Navigate to `/taskmaster-frontend` and run:

```bash
npm install
ng serve --host 0.0.0.0 --port 4200
```

Open the app at:

- `http://localhost:4200`

The frontend uses this API by default:

- `http://localhost:3000/api`

That value is defined in `taskmaster-frontend/src/environments/environment.ts`.

## Running on Android or Another Device

If the frontend is not running in the same environment as the Rails server, update the API URL to your machine's local IP:

```ts
apiUrl: 'http://<YOUR_LOCAL_IP>:3000/api'
```

Example:

```ts
apiUrl: 'http://192.168.x.x:3000/api'
```

For the Android emulator, use:

```ts
apiUrl: 'http://10.0.2.2:3000/api'
```

After changing the API URL, rebuild the frontend.

## Android Build

From `taskmaster-frontend`:

```bash
ng build
npx cap sync android
npx cap open android
```

Run the app from Android Studio.

## Tests

Backend:

```bash
cd taskmaster-backend
rails test
```

Frontend:

```bash
cd taskmaster-frontend
ng test
```