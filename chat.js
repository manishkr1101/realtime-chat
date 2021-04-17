const { input } = require('./util')
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
function connect(port) {
    const socket = new net.Socket();
    socket.connect(port);
    
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
        
        var server = net.createServer();
        server.listen(5000);

        server.on('listening', function () {
            
            console.log("Waiting for someone to connect...");
        });
        server.on('error', function (err) {
            console.log("error", err);
        });
        server.on('close', function() {
            console.log('server closed')
        })


        socket = await accept(server);

        console.log('somone got connected')
    }
    else if (ans == "2") {
        // join conversation with given information
        console.log("Enter details to connect");
        const port = await input("Port : ");
        socket = await connect(port);

        console.log('connection established')

    }
    else {
        process.exit(1);
    }

    /**
     * 
     * @param {string} msg Message to print
     * @param {boolean} flag false if printing own message otherwise true
     */
    function renderMessage(msg, flag = true) {
        if (flag == false) {
            process.stdout.moveCursor(0, -1);
        }
        process.stdout.cursorTo(0);
        const dy = Math.ceil(msg.length / process.stdout.columns);
        process.stdout.moveCursor(0, -1 * dy);
        process.stdout.write(msg);
        process.stdout.clearScreenDown();
        process.stdout.moveCursor(0, 1);
        process.stdout.cursorTo(0);
        // process.stdout.clearLine(1);
        process.stdout.write("\n");
        // process.stdout.moveCursor(0,1);
        if (flag) {
            process.stdout.write("> ");
        }
    }


    function closeApp() {
        if(server) server.close();
        socket.destroy()
        process.exit(0);
    }

    socket.on('close', function() {
        renderMessage('connection closed')
    })

    process.stdout.write('\n');
    while (true) {
        const res = await input("> ");
        if (res == 'exit') {
            closeApp();
        }
        renderMessage(`me  : ${res}`, false);
    }

}

app();