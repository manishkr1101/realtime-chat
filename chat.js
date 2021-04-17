const { input, renderMessage } = require('./util')
const net = require('net')

// accepts incoming socket connection asynchronously
function accept(server) {
    return new Promise((resolve, reject) => {
        server.on('connection', socket => {
            resolve(socket)
        })
    })
}

// connects to a socket server asynchronously
function connect(port, host) {
    const socket = new net.Socket();
    socket.connect(port, host);
    
    return new Promise((resolve, reject) => {
        socket.on('connect', function() {
            resolve(socket)
        })
        socket.on('error', function(err) {
            reject({err: err})
        })
    })
}

async function app() {
    // ask for initialisation
    // console.clear();
    console.log("1. Start conversation.");
    console.log("2. Join conversation.")
    const ans = await input("Enter choice : ")
    let socket = new net.Socket();
    if (ans == "1") {
        // start server and listen for other party to join
        // const host = await input("Enter host : ");
        var server = net.createServer();
        server.listen(5000);

        server.on('listening', function () {
            console.log('Connection Details ');
            console.log('host :', server.address().family, server.address().address);
            console.log('port :', server.address().port);
            console.log("Waiting for someone to connect...");
        });
        server.on('error', function (err) {
            console.log("error", err);
        });
        server.on('close', function() {
            console.log('server closed')
        })


        socket = await accept(server);
        server.close();

        console.log('someone got connected', socket.remoteAddress)
    }
    else if (ans == "2") {
        // join conversation with given information
        console.log("Enter details to connect");
        const port = 5000 || await input("Port : ");
        const host = await input("Host : ");
        try {
            socket = await connect(port, host);
            
        } catch (error) {
            console.log(error)
            closeApp();
        }

        console.log('connection established')

    }
    else {
        process.exit(1);
    }

    function closeApp() {
        if(server) server.close();
        socket.destroy()
        process.exit(0);
    }

    socket.on('close', function() {
        renderMessage('connection closed')
        closeApp();
    })

    socket.on('data', data => {
        renderMessage(`frnd: ${data.toString()}`)
    })

    process.stdout.write('\n');
    while (true) {
        const res = await input("> ");
        if (res == 'exit') {
            closeApp();
        }
        if(res[0] == ":") {
            // parse command
            renderMessage('command')
        }
        else {
            // send message
            socket.write(res);
            renderMessage(`me  : ${res}`, false);
        }
    }

}

app();