const readline = require("readline");
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

/**
 * 
 * @param {string} msg 
 * @returns {string}
 */
async function input(msg) {
    return new Promise((resolve, reject) => {
        rl.question(msg, function(answer) {
            resolve(answer)
        })
    })
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

function pad(text, len, char='0') {
    const s = Math.max(len - text.length, 0);
    return char.repeat(s) + text;
}

module.exports = {
    input,
    renderMessage,
    pad
}