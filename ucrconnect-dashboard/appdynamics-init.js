require('appdynamics').profile({
  controllerHostName: process.env.APP_DYNAMICS_HOST,
  controllerPort: 443,
  controllerSslEnabled: true,
  accountName: process.env.APP_DYNAMICS_ACCOUNT_NAME,
  accountAccessKey: process.env.APP_DYNAMICS_KEY,
  applicationName: 'Backend-user-app',
  tierName: 'Web-tier',
  nodeName: 'Web-node'
});
