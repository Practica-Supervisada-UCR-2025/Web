// This is here because it fixes an appdynamics library error
module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, 'appdynamics', 'appdynamics-libagent-napi', 'appdynamics-native'];
    }
    return config;
  },
  typescript: {
    // WARNING: This allows production builds to complete even if there are type errors.
    ignoreBuildErrors: true,
  },
  eslint: {
    // WARNING: This allows production builds to complete even if there are ESLint errors.
    ignoreDuringBuilds: true,
  },
}
