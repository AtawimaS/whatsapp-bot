const qrcodeTerminal = require('qrcode-terminal');
const fs = require('fs/promises');
const { Client, LocalAuth } = require('whatsapp-web.js');


const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('loading_screen', (percent, message) => {
    console.log('LOADING SCREEN', percent, message);
});

client.on('qr', async (qr) => {
    console.log('QR RECEIVED\n');
    qrcodeTerminal.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('✅ WhatsApp client is ready!');
});

client.on('message', async msg => {
    if (msg.body == "!ping") {
        msg.reply("P P P!")
    }
    else if (msg.body == '!comic' && msg.hasMedia) {
        const attachmentData = await msg.downloadMedia();
        const buffer = Buffer.from(attachmentData.data, 'base64');
        const filename = "testing"
        await fs.writeFile(`./downloads/${filename}.jpg`, buffer);
        msg.reply(`
            *Media info*
            MimeType: ${attachmentData.mimetype}
            Filename: ${attachmentData.filename}
            Data (length): ${attachmentData.data.length}
        `);
        client.sendMessage("⚙️⚙️⚙️")
    }
    else if (msg.body == "!patungan") {
        const all_kah = msg.body.split(' ')[1];
        if (all_kah.toLowerCase() == 'all') {
            let chat = await msg.getChat();
            if (chat.isGroup) {
                harga = harga/chat.participants.length
            } else {
                msg.reply('This command can only be used in a group!');
            }
        }
    }
        
});


client.initialize();