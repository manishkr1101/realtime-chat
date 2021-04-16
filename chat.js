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


    while(true) {
        const res = await input("> ");
        if(res == 'exit') {
            process.exit(0);
        }
        console.log(`me : ${res}`);
    }
}

app();