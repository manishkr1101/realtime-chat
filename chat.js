const { input, renderMessage, init, setConfig, debug, getConfig } = require('./util')
const Channel = require('./message')
const net = require('net')
const fs = require('fs')
const path = require('path')

init();
/**
 * accepts incoming socket connection asynchronously
 * @param {net.Server} server 
 * @returns {Promise<net.Socket>}
 */
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
            console.log('connection established');
            
        } catch (error) {
            console.log(error)
            closeApp();
        }


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

    const channel = new Channel(socket);

    channel.on('message', function(text) {
        renderMessage(`frnd: ${text}`)
    })

    channel.on('file', buffer => {
        const filePath = path.resolve(getConfig('DOWNLOAD') || '', 'vid.mkv');
        fs.writeFileSync(filePath, buffer);
        renderMessage('file recieved : '+filePath)
    })

    async function parseCommand(command, arg) {
        switch(command) {
            case 'file': {
                await channel.sendFile(arg);
                renderMessage(`me  : file sent ${arg}`, false);
                break;
            }
            case 'set': {
                debug("set value : ", renderMessage, arg);
                const [key, value] = arg.split('=');
                setConfig(key, value);
                renderMessage(`config set : ${key} = ${value}`, false);
                break;
            }
            case 'get': {
                const key = arg.trim();
                renderMessage(`${key} : ${getConfig(key)}`, false);
                break;
            }
            default: 
                renderMessage('command not found', false);
                break;
        }
    }


    process.stdout.write('\n');
    while (true) {
        const res = await input("> ");
        if (res == 'exit') {
            closeApp();
        }
        if(res[0] == ":") {
            // parse command
            const index = res.indexOf(' ');
            if(index == -1) {
                parseCommand(res.substr(1).trim());
            }
            else {
                parseCommand(res.substring(1, index), res.substring(index+1).trim());
            }
        }
        else {
            // send message
            channel.sendMessage(res);
            renderMessage(`me  : ${res}`, false);
        }
    }

}

app();