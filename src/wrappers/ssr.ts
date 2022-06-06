import { GetServerSidePropsContext, GetServerSidePropsResult } from 'next'
import { withIronSessionSsr } from 'iron-session/next'

import { buildLoginRoute } from '../lib/login'
import type { Config } from '../lib/config'

export interface SsrOptions {
    sourceUrl: string
}

const withHelloSsrFactory = (config: Config) =>
    <P extends { [key: string]: unknown } = { [key: string]: unknown },>(
        handler: (context: GetServerSidePropsContext) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
        options: SsrOptions
    ) => withIronSessionSsr(async (context) => {
        const user = context.req.session.user

        if (!user) {
            return {
                redirect: {
                    statusCode: 302,
                    destination: buildLoginRoute({ loginRoute: config.loginRoute, sourceUrl: options.sourceUrl })
                }
            }
        }

        return handler(context)
    }, config.sessionOptions)

export default withHelloSsrFactory
