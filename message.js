
const net = require('net')
class Messanger {
    /**
     * 
     * @param {net.Socket} socket 
     */
    constructor(socket) {
        this.socekt = socket;
        this.messageCallbacks = []
        this.fileCallbacks = [];

        this.socekt.on('data', data => {
            this.messageCallbacks.forEach(cb => {
                cb(data.toString());
            })
        })
    }
    
    sendMessage(text) {
        this.socekt.write(text);
    }

    sendFile(filePath) {

    }

    /**
     * @callback dataCallback
     * @param {string|Buffer} data
     */
    
    /**
     * Event listeners for incoming messages or files
     * @param {'message'|'file'} type 
     * @param {dataCallback} cb 
     */
    on(type, cb) {
        if(type == 'message') {
            this.messageCallbacks.push(cb);
        }
        else if(type == 'file') {
            this.fileCallbacks.push(cb);
        }
        return this;
    }
    
    
    
}


module.exports = Messanger;

