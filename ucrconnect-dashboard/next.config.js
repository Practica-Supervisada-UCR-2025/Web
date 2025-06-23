// This is here because it fixes an appdynamics library error
module.exports = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, 'appdynamics', 'appdynamics-libagent-napi', 'appdynamics-native'];
    }
    return config;
  },
};