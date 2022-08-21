// @ts-check
import { env } from './src/env/server.mjs';
import { withPlausibleProxy } from 'next-plausible';
/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config;
}

export default withPlausibleProxy({ customDomain: 'https://plausible.augie.gg' })(
  defineNextConfig({
    reactStrictMode: true,
    swcMinify: true,
    images: {
      domains: ['cdn.discordapp.com'],
    },
    experimental: {
      images: {
        allowFutureImage: true,
      },
    },
  })
);
