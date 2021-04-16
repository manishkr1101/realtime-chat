const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function input(msg) {
    return new Promise((resolve, reject) => {
        rl.question(msg, function(answer) {
            resolve(answer)
        })
    })
}


module.exports = {
    input
}