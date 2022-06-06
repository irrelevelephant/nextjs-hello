import type { Config } from './config'

export const buildQuickstartUrl = (config: Config) =>
    new URL('https://quickstart.hello.dev/?' + new URLSearchParams({
        ...((process.env.NODE_ENV === 'production' && config.quickstartRoute)
            ? {}
            : { response_uri: config.baseUrl + config.quickstartRoute }),
        suffix: 'Next.js App'
    }))
