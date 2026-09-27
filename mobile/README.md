# Portfolio Analytics (Android)

The analytics dashboard from `backend-service/`, as a phone app. Expo + React
Native + TypeScript.

## What it shows

Everything the web dashboard does: today / this week / this month, averages,
busiest day, repeat visitors, the four time ranges (7 days, 30 days, 12 months,
5 years), top countries, top sources, mobile-vs-desktop split, top cities, and
the full visitor list with search.

## Running it

```bash
cd mobile
npm install
npx expo start
```

Install **Expo Go** from the Play Store and scan the QR code. No Android Studio
needed for day-to-day work.

## Building an installable APK

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

`preview` produces an APK you can sideload. A Play Store release needs an
`.aab`, which is the `production` profile.

## How it talks to the server

`src/config.ts` points at the analytics server. The app signs in with the same
`ADMIN_PASSWORD` the web dashboard uses and trades it for a bearer token, which
is kept in the device keystore via `expo-secure-store` rather than plain
storage.

The token is signed with the server's secret key and lasts 30 days. Rotating
that key on PythonAnywhere signs every device out at once.

## Why the API exists

The web dashboard is server-rendered and authenticated with a session cookie
and a CSRF form, neither of which a native client can use, and it sends every
visitor row to the browser to build its charts — 1.4MB on a recent check. The
app uses `/api/analytics`, which aggregates server-side and answers in about
3KB, and a paginated `/api/visitors`.
