import { defaultLoginRoute } from './config'

export interface LoginUrlOptions {
    loginRoute?: string,
    sourceUrl: string
}

export const buildLoginRoute = ({
    loginRoute: loginRouteOverride,
    sourceUrl
}: LoginUrlOptions) => {
    const loginRoute = loginRouteOverride || process.env.NEXT_PUBLIC_HELLO_LOGIN_API_ROUTE as string || defaultLoginRoute
    const loginParams = new URLSearchParams({ sourceUrl }).toString()
    return loginRoute + '?' + loginParams
}
