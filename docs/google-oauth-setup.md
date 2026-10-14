# Google OAuth setup for eKta Social (একতা)

The app now has a **Continue with Google** button on the Supabase auth screen. The remaining setup requires Google Cloud OAuth credentials.

## 1. Google Cloud Console

Create or select a Google Cloud project, then:

1. Open **APIs & Services → OAuth consent screen**.
2. Configure the app name as `eKta Social` and add the support email. The Bengali product name shown in-app is `একতা`.
3. Add the required scopes: `openid`, `email`, and `profile`.
4. Open **APIs & Services → Credentials → Create credentials → OAuth client ID**.
5. Create a **Web application** client.
6. Add this exact Authorized redirect URI:

```text
https://dfmerurkcxzvhfphgphq.supabase.co/auth/v1/callback
```

7. Copy the generated **Client ID** and **Client Secret**.

## 2. Supabase provider

Open:

```text
https://supabase.com/dashboard/project/dfmerurkcxzvhfphgphq/auth/providers
```

Open **Google**, then:

- Enable **Sign in with Google**.
- Paste the Google Client ID into **Client IDs**.
- Paste the Google Client Secret into **Client Secret**.
- Leave **Skip nonce checks** disabled.
- Leave **Allow users without an email** disabled.
- Save the provider.

## 3. Supabase URL configuration

Open **Authentication → URL Configuration** and add this redirect URL for native Expo builds:

```text
manus024053646483784://oauth/callback
```

For the hosted web build, also add the deployed app origin followed by:

```text
/oauth/callback
```

## 4. App flow

The app uses Supabase Auth's OAuth authorize endpoint and opens the provider in the system browser. After Google returns the access and refresh tokens, the app:

1. Fetches the Supabase user record.
2. Persists the Supabase session in SecureStore on native and localStorage on web.
3. Creates or updates the user's `profiles` row using the authenticated user UUID.
4. Opens the community feed.

The app-side implementation is ready; the Google Client ID and Secret are intentionally not committed to the repository.
