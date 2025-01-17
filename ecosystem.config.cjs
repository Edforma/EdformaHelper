module.exports = {
  apps : [{
    name: "Edforma Authentication API",
    script: '/home/edforma/pm2Data/EdformaHelper/current/index.ts',
    interpreter: '/home/edforma/.bun/bin/bun',
    watch: '.',
    "env_production": {
      "NODE_ENV": "production",
      "PORT": 3000
    }
  }],

  deploy : {
    production : {
      user : 'edforma',
      host : '45.76.232.86',
      ref  : 'origin/main',
      repo : 'https://github.com/Edforma/EdformaHelper.git',
      path : '/home/edforma/pm2Data/EdformaHelper',
      'pre-setup': "pwd && ls -la && uname -a && /home/edforma/.bun/bin/bun --version",
      "pre-deploy-local": "echo Uploading ecosystem... && scp ecosystem.config.cjs edforma@45.76.232.86:'/home/edforma/' && echo Ecosystem uploaded.",
      'post-deploy' : '/home/edforma/.bun/bin/bun install && /home/edforma/.bun/bin/pm2 reload ~/ecosystem.config.cjs --env production',
      "env": {
        "SENTRY_DSN": "https://dcf35fe725fc46babcfeace2f5dd3db2@o1069103.ingest.sentry.io/6065463",
        "SENTRY_TRACESAMPLERATE": 0.5,
        "SENTRY_TRACEPROFILERATE": 0.6,
        "SERVER_ANNOUNCEMENT": ""
      }
    }
  }
};
