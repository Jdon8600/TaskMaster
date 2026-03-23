# TaskMaster

TaskMaster is a full-stack task app with:

- a Rails back-end
- an Angular front-end
- Capacitor support for Android builds

## Prerequisites

Install these first:

- Ruby 3.x
- Bundler
- PostgreSQL:
```bash
sudo apt install postgresql postgresql-contrib -y
sudo systemctl status postgresql
sudo -i -u postgres
psql
CREATE USER myuser WITH PASSWORD 'aStrongPassword';
\q to exit
```
- Node.js
- npm
- android-studio if you want to emulate on mobile device
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

## Assumptions made


-User wants tasks in order based on status then due date

-there is no current need for cascading operations (Updates/deletes)

-emails wont change in the future. One-to-many relationship wont be disrupted

## Key Decisions 

### User table
email_address defined as a primary key to enforce uniqueness


### Task table
email_address is listed as a foreign key for possible future cascading operations and solidifying a one to many relationship beteewn user table and tasks table

status stored as an enum for space efficiency, consistency, and speed. Also allows for easier extentions of metrics gathering based on the status of tasks in the future. this switched from originally being stored as a string

## Auth
switched from credentials based auth to token based auth for coss-platform capabilites and more flexibilty with session times



