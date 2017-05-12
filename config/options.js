module.exports = {

  options:  {
    options: {
      debug: true
    },
    connection: {
      cluster: "aws",
      reconnect: true
    },
    identity: {
      username: process.env.USER_NAME,
      password: process.env.USER_PASS
    },
    channels: ["#mark_exe"]
  }

}
