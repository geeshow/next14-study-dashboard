/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // loader: 'akamai',
    domains: ['deca-upload-stage-public.s3.ap-northeast-2.amazonaws.com'],
  },
};

module.exports = nextConfig;
