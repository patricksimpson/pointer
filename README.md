# pointer

A scrum pointing tool.

## Installing

### Requires 

- node 12+ 
- npm 6+

`npm install`

### Running

To start the react server (client side):

`npm run server` 

To start the socket server (server): 

`node app.js`

## Default Settingss

By default, the socketio connection will be on port `4002` and React will run on `9000`.

Both client and server will be running on `localhost`.


### Env File

You can setup a `.env` file that changes the default settings:

``` shell
cat >> .env<< EOF
END_POINT=<YOUR_CUSTOM_ENDPOINT>
PORT=<YOUR_CUSTOM_PORT>
EOF
```

## Tech

[socketio](https://socket.io/)

[React](https://reactjs.org/)

## Authors

[Patrick Simpson](https://github.com/patricksimpson)
