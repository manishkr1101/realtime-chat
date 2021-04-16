const {input} = require('./util')

async function app() {
    // ask for initialisation
    console.log("1. Start conversation.");
    console.log("2. Join conversation.")
    const ans = await input("Enter choice : ")
    if(ans == "1") {
        // start server and listen for other party to join
        console.log("Waiting for someone to connect...");
    }
    else if(ans == "2") {
        // join conversation with given information
        console.log("Enter details to connect");
    }


    /**
     * 
     * @param {string} msg Message to print
     * @param {boolean} flag false if printing own message otherwise true
     */
    function renderMessage(msg, flag=true) {
        if(flag == false) {
            process.stdout.moveCursor(0,-1);
        }
        process.stdout.cursorTo(0);
        process.stdout.moveCursor(0,-1);
        process.stdout.write(msg);
        process.stdout.moveCursor(0,1);
        process.stdout.cursorTo(0);
        process.stdout.clearLine(1);
        process.stdout.write("\n");
        // process.stdout.moveCursor(0,1);
        if(flag) {
            process.stdout.write("> ");
        }
    }
    // simulating incoming message
    setTimeout(() => {
        renderMessage("new message 1")
        renderMessage("message 2");
    }, 1000);

    setTimeout(() => {
        renderMessage("bob : new message 3");
    }, 10000);
    
    process.stdout.write('\n');
    while(true) {
        const res = await input("> ");
        if(res == 'exit') {
            process.exit(0);
        }
        renderMessage(`me  : ${res}`,false);
    }
}

app();