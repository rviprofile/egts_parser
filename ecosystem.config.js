module.exports = {
  apps: [
    {
      name: "taxi-gps",
      script: "server.js",
      env: {
        SOCKET_PORT: 8002,
        REST_PORT: 3077,
        CONSOLE_EGTS: false,
        CONSOLE_WIALON: true,
      },
    },
  ],
};
