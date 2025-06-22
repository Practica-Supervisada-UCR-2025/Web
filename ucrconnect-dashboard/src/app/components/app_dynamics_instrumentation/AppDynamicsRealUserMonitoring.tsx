import Head from 'next/head';

export default function AppDynamicsRealUserMonitoring() {
  const appKey = process.env.APP_DYNAMICS_REAL_USER_MONITORING_KEY;
  
  const htmlString = `<script charset="UTF-8" type="text/javascript">
window["adrum-start-time"] = new Date().getTime();
(function(config){
    config.appKey = "${appKey}";
    config.adrumExtUrlHttp = "http://cdn.appdynamics.com";
    config.adrumExtUrlHttps = "https://cdn.appdynamics.com";
    config.beaconUrlHttp = "http://pdx-col.eum-appdynamics.com";
    config.beaconUrlHttps = "https://pdx-col.eum-appdynamics.com";
    config.resTiming = {"bufSize":200,"clearResTimingOnBeaconSend":true};
    config.maxUrlLength = 512;
})(window["adrum-config"] || (window["adrum-config"] = {}));
</script>
<script src="//cdn.appdynamics.com/adrum/adrum-24.4.0.4454.js"></script>`;

  return (
    <Head>
      <div dangerouslySetInnerHTML={{ __html: htmlString }} />
    </Head>
  );
}
