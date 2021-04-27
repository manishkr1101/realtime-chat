const fs = require('fs')
const net = require('net');
const path = require('path')
const { renderMessage, pad, debug } = require('./util');
const h = require('./headers')

class Packet {
    static from(header, data='') {
        const head = Buffer.from(header);

        const chunk = Buffer.from(data);

        let sizeHex = chunk.length.toString(16);
        sizeHex = pad(sizeHex, 4);
        const size = Buffer.from(sizeHex);

        const delimiter = Buffer.from('@');

        const packet = Buffer.concat([head, size, chunk, delimiter]);

        return packet;
    }
}

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
        /** @type {Array<Buffer>} */
        this.fileBuffers = [];
        /** @type {File} */
        this.file = {}
        
        this.i = 1;
        this.socket.on('data', data => {
            this.processBuffer(data);
            if(this.i%100==0) {
                debug('data came '+data.length + ` ${this.i} BufferLen : ${this.buffer.length} file: ${this.fileBuffers.length}`, renderMessage)
            }
            this.i++;
        })

    }

    sendMessage(text) {

        const packet = Packet.from(h.TEXT, text);
        this.socket.write(packet);

        return this;
    }

    sendFile(filePath) {
        return new Promise((resolve, reject) => {
            const metadata = {
                name: path.basename(filePath),
                ext: path.extname(filePath),
                size: fs.statSync(filePath).size
            }

            debug(metadata, renderMessage, false);

            const metadataPacket = Packet.from(h.FILE_START, JSON.stringify(metadata));
            this.socket.write(metadataPacket);
            
            const CHUNK_SIZE = 16 * 1024;

            const readStream = fs.createReadStream(filePath, { highWaterMark: CHUNK_SIZE });

            readStream.on('data', chunk => {
                const packet = Packet.from(h.FILE, chunk);

                this.socket.write(packet);
            })

            readStream.on('end', () => {
                const packet = Packet.from(h.FILE_END);
                this.socket.write(packet);
                resolve()
            })
        })

    }

    /**
     * @typedef {Object} Metadata
     * @property {string} name
     * @property {string} ext
     * @property {number} size
     * @typedef {Object} File
     * @property {Metadata} metadata
     * @property {Buffer} data
     */

    /**
     * @callback dataCallback
     * @param {string|File} data
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

            if (head == h.TEXT) {
                const content = this.buffer.slice(8, 8 + size);
                this.emit('message', content.toString());
            }
            else if(head == h.FILE_START) {
                const content = this.buffer.slice(8, 8+size).toString();
                debug(content, renderMessage);
                this.file.metadata = JSON.parse(content);
            }
            else if (head == h.FILE) {
                const content = this.buffer.slice(8, 8 + size);
                const delimiter = this.buffer.slice(8 + size, 9 + size).toString();

                this.fileBuffers.push(content)
                // renderMessage("delm "+delimiter);
                
            }
            else if(head == h.FILE_END) {
                this.file.data = Buffer.concat(this.fileBuffers);
                this.fileBuffers = [];
                this.emit('file', this.file);
                this.file = {};
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

