/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  env: {
    DNS_API_KEY: 'ce302e988afd473c9ee1bf18530054c7',
  },
}

export default nextConfig
