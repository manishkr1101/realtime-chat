const fs = require('fs')
const net = require('net');
const { renderMessage, pad } = require('./util');
class Messanger {
    /**
     * 
     * @param {net.Socket} socket 
     */
    constructor(socket) {
        this.socket = socket;
        this.messageCallbacks = []
        this.fileCallbacks = [];

        this.buffer = Buffer.alloc(0);
        this.fileBuffer = Buffer.alloc(0);

        this.i = 1;
        this.socket.on('data', data => {
            this.processBuffer(data);
            // renderMessage('data came '+data.length + ` ${this.i++} BufferLen : ${this.buffer.length} file: ${this.fileBuffer.length}`)
        })

    }

    sendMessage(text) {
        const head = Buffer.from("TEXT");

        const chunk = Buffer.from(text);

        let sizeHex = chunk.length.toString(16);
        sizeHex = pad(sizeHex, 4);
        const size = Buffer.from(sizeHex);

        const delimiter = Buffer.from('@');

        const packet = Buffer.concat([head, size, chunk, delimiter]);

        this.socket.write(packet);

        return this;
    }

    sendFile(filePath) {
        return new Promise((resolve, reject) => {

            const readStream = fs.createReadStream(filePath, { highWaterMark: 16384 });
            readStream.on('data', chunk => {
                const head = Buffer.from("FILE");

                let sizeHex = chunk.length.toString(16);
                sizeHex = pad(sizeHex, 4);
                const size = Buffer.from(sizeHex);
                // console.log('chunk size', chunk.length)

                if (chunk.length < 16384) {
                    var delimiter = Buffer.from('$');
                }
                else {
                    var delimiter = Buffer.from('@');
                }


                const packet = Buffer.concat([head, size, chunk, delimiter]);

                this.socket.write(packet);
            })

            readStream.on('end', () => {
                resolve()
            })
        })

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
        if (type == 'message') {
            this.messageCallbacks.push(cb);
        }
        else if (type == 'file') {
            this.fileCallbacks.push(cb);
        }
        return this;
    }

    emit(event, args) {
        switch (event) {
            case 'message': {
                this.messageCallbacks.forEach(cb => {
                    cb(args)
                })
                break;
            }
            case 'file': {
                this.fileCallbacks.forEach(cb => {
                    cb(args)
                })
            }
        }
    }

    processBuffer(data) {
        this.buffer = Buffer.concat([this.buffer, data]);

        while (this.buffer.length > 8) { // head+size+delimiter
            const head = this.buffer.slice(0, 4).toString();
            const sizeHex = this.buffer.slice(4, 8);
            const size = parseInt(sizeHex, 16);

            if (this.buffer.length < size + 9) {
                break;
            }

            if (head == 'TEXT') {
                const content = this.buffer.slice(8, 8 + size);
                this.emit('message', content.toString());
            }
            else if (head == 'FILE') {
                const content = this.buffer.slice(8, 8 + size);
                const delimiter = this.buffer.slice(8 + size, 9 + size).toString();
                // renderMessage("delm "+delimiter);
                if (delimiter == '@') {
                    this.fileBuffer = Buffer.concat([this.fileBuffer, content])
                }
                else if (delimiter == '$') {
                    this.emit('file', this.fileBuffer);
                    this.fileBuffer = Buffer.alloc(0);
                }
            }
            else {
                renderMessage('something wrong with header ' + head)
                process.exit(1)
            }

            this.buffer = this.buffer.slice(size + 9);
        }
    }

}


module.exports = Messanger;

