# nextjs-hello
This package includes a Next.js SDK for signing in with [Hellō](https://www.hello.dev/), an OpenID Connect Provider that simplifies user registration and login.

`nextjs-hello` aims to be the fastest way to add user sign-in to a Next.js app. It enables sign-in through popular social login providers with no additional setup. Just add the included sign-in button component and authentication APIs to your app - your users will be able to sign in through their preferred provider, and you'll be able to pull user data on the client via the `useUser` hook, or on the server via the request.

## Getting Started

### Example
For example usage in a Next.js app, see [`next-with-hello`](https://github.com/irrelevelephant/next-with-hello).

### Environment Setup
To add sign-in and session capability to your Next.js application, take a dependency on `nextjs-hello` (`npm install nextjs-hello` or `yarn add nextjs-hello`) and follow these steps:

1. Create a new application in the [Hellō Developer Console](https://console.hello.dev/), or navigate to an existing application you want to use. Copy the **Client ID**. In your application, define a new environment variable (e.g., using a `.env.` file) called `HELLO_CLIENT_ID`, and set its value to the **Client ID** you copied.

2. Navigate to your application in the [Hellō Developer Console](https://console.hello.dev/), and add the your app's callback URL to the **Production Redirect URIs**. For example, if your domain is `example.com`, this would be `https://example.com/api/auth/callback`.

3. Define an environment variable called `HELLO_SESSION_SECRET`, and set its value to a random string. This value should kept safe; i.e., not checked into source control. For example, this could be stored in a Vercel environment variable.

You can generate an appropriate salt by executing `node -e "console.log(crypto.randomBytes(32).toString('hex'))"`.

4. Define an environment variable called `HELLO_BASE_URL`. In a local development environment, this is usually `http://localhost:3000`. In a production environment, this should include the protocol and domain name, e.g. `https://example.com`.

5. Create a directory called `auth` in `/pages/api/`. In this new directory, create a file called `[...hello].js` with the following contents:

```js
 export { handleAuth as default } from 'nextjs-hello'
```

### Sign In and Profile Update
Add the **Sign In**, and optionally **Update Profile** buttons to your app.

```jsx
import { SignInButton, UpdateProfileButton } from 'nextjs-hello'

export default function Page() {
    return (
        ...
        <SignInButton />
        ...
        <UpdateProfileButton />
        ...
    )
}
 ```

These buttons require the Hellō CSS for styling, which can be included as follows in the `_document.jsx` page:

```jsx
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
    return (
        <Html>
            <Head>
                <link href="https://cdn.hello.coop/css/hello-button.css" rel="stylesheet" />
            </Head>
            <body>
                <Main />
                <NextScript />
            </body>
        </Html>
    )
}
```

### Statically-generated Pages
For statically-generated pages, the `useUser` hook will return user data from the current session, including a unique identifier called `sub`.

```jsx
import { useUser } from 'nextjs-hello`

export default function StaticallyGeneratedPage() {
    const { user: { sub, name, email } } = useUser()

    ...
}
```

If the user is not logged in, they will be redirected to Hellō, which will return the user to the initially requested page after authenticating. To disable the redirect behavior, pass `redirect: false` to the hook, e.g.:

```jsx
const { user } = useUser({ redirect: false })
```

### Server-side Rendered Pages
For server-side rendered pages, use `withHelloSsr`.

```jsx
import { InferGetServerSidePropsType } from 'next'
import { withHelloSsr, getUser, UpdateProfileButton } from 'nextjs-hello'

// assuming this file is located at pages/ssr-page.tsx
export default function SsrProfile({ user }: InferGetServerSidePropsType<typeof getServerSideProps>) {
    const { sub, name, email } = user

    ...
}

export const getServerSideProps = withHelloSsr(async ({ req }) => ({
    props: {
        user: getUser(req)
    }
}), { sourceRoute: '/ssr-page })
```

If the user is not logged in, they will be redirected to Hellō, which will return the user to `sourceRoute` after authenticating.

### API Rotues
To require authentication for API routes, use `withHelloApi`.

```jsx
import { NextApiRequest, NextApiResponse } from 'next'
import { getUser, withHelloApi } from 'nextjs-hello'

function handleApi(req: NextApiRequest, res: NextApiResponse) {
    const { sub, name, email } = getUser(req)

    ...
}

export default withHelloApi(handleApi)
```

## Documentation

### What is Hellō?
[Hellō](https://www.hello.dev/) is an OpenID Connect Provider that simplifies user registration and login. It handles login for all major providers such as Google, Apple, and Facebook, allowing your users to sign in without requiring you to set up applications with each provider. `nextjs-hello` simplifies sign-in and session management, with the goal of adding social login to your application with minimal effort.

### Scopes/Claims
By default, `nextjs-hello` will request `openid`, `name`, and `email` scopes from Hellō. The list of possible scopes is documented [here](https://www.hello.dev/documentation/hello-claims.html#current-scopes). To request additional scopes, use the `HELLO_SCOPES` environment variable.

The requested claims will appear in the user data, which can be retrieved by calling `useUser` or `getUser`.

For example, to request the `picture` scope as well, update `HELLO_SCOPES`:

`HELLO_SCOPES=openid,name,email,picture`

The `picture` field will now be populated:

```js
const { user: { sub, name, email, picture } } = useUser()
```

### Environment Variables
`nextjs-hello` can be configured via environment variables, or optionally via code.

* `HELLO_BASE_URL` (**required**)
 * The base URL of the app, used for constructing and validating redirect URLs. In a local development environment, this is usually `http://localhost:3000`. In a production environment, this should include the protocol and domain name, e.g. `https://example.com`.

* `HELLO_CALLBACK_API_ROUTE` (optional)
 * The API route to which Hellō will return after authenticating. This route performs token validation and sets the session cookie. By default, this is `/api/auth/callback`.

* `HELLO_CLIENT_ID` (**required**)
 * The Client ID of the Hellō application associated with your Next.js application. This is the same for both development and production.

* `HELLO_DEFAULT_RETURN_TO_ROUTE` (optional)
 * The route to which the callback route will redirect if the original source URL is not present. By default, this is the root of your domain, i.e. `/`.

* `HELLO_ENABLE_QUICKSTART` (optional)
 * A boolean (`true` or `false`) value indicating whether to enable the [quickstart](https://quickstart.hello.dev/) functionality. If `true` and `HELLO_CLIENT_ID` is not set, the application will automatically redirect the user to create a new application and acquire a new **Client ID**. By default, this is enabled in development but disabled in production.

* `HELLO_QUICKSTART_API_ROUTE` (optional)
 * The API route to which the Hellō [quickstart](https://quickstart.hello.dev/) will return during local development. If specified, this should be implemented by your app - `nextjs-hello` does not include this API route. When calling this route, Hellō will include a `client_id` query parameter, which you can then save to your configuration.

* `HELLO_SCOPES` (optional)
 * A comma-separated list of OpenID Connect scopes/claims to request from Hellō (documented [here](https://www.hello.dev/documentation/hello-claims.html#current-scopes)). By default, this is `openid,name,email`. These claims will be present in the `User` object, as returned by `useUser` or `getUser`.

* `HELLO_SESSION_SECRET` (**required**)
 * A secret string used for sealing session cookies. Sessions are implemented via [`iron-session`](https://github.com/vvo/iron-session).

* `NEXT_PUBLIC_HELLO_LOGIN_API_ROUTE` (optional)
 * The API route that will initiate a Hellō consent flow. By default, this is `/api/auth/login`.

* `NEXT_PUBLIC_HELLO_USER_API_ROUTE` (optional)
 * The API route that will retrieve retrieve JSON-formatted user claims for the current session. By default, this is `/api/auth/me`.

### Code Configuration
To configure `nextjs-hello` via code instead of environment variables, create a new source file and export the return value of the `initHello` function.

See `src/lib/config.ts` for all configuration field names. The `sessionOptions` field allows you to pass custom configuration to [`IronSessionOptions`](https://github.com/vvo/iron-session#ironoptions).

```js
import { initHello } from 'nextjs-hello'

export default initHello({
    baseUrl: ...,
    helloClientId: ...,
    sessionSecret: ...,
    sessionOptions: {
        sameSite: 'lax',
        ...
    }
})
```

All `nextjs-hello` constructs imported from this file will use the provided configuration.

### License
This project is licensed under the MIT license.
