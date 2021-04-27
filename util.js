const readline = require("readline");
const fs = require('fs');
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

function debug(msg, cb=console.log, ...args) {
    if(process.env.DEBUG) {
        cb(msg, ...args)
    }
}

const config = {};

function init() {
    if(fs.existsSync('config.json')) {
        const content = fs.readFileSync('config.json');
        const data = JSON.parse(content);
        for(const key in data) {
            config[key] = data[key];
        }
        debug(config);
    }
    else {
        fs.writeFileSync('config.json', Buffer.from("{}"));
    }
}

function setConfig(key, value) {
    config[key] = value;
    fs.writeFileSync(
        'config.json',
        Buffer.from(JSON.stringify(config))
    );
}

function getConfig(key) {
    if(key) {
        return config[key];
    }
    else {
        return config;
    }
}


module.exports = {
    input,
    renderMessage,
    pad,
    debug,
    init,
    setConfig,
    getConfig
}