const qrcodeTerminal = require('qrcode-terminal');
const fs = require('fs/promises');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');

const express = require('express')
const app = express()
const port = 3000

function isStringAngka(str) {
    if (typeof str !== 'string') {
      return false; // Bukan string, jadi bukan string angka
    }
    return !isNaN(parseFloat(str)) && isFinite(Number(str));
  }

function getMentionInGrub(parts) {
    const people = []
    const price = []
    for (let i = 1; i < parts.length; i++){
        if (parts[i].startsWith("@")) {
            people.push(parts[i])
        } else if(isStringAngka(parts[i])){
            price.push(parts[i])
        }
        else{
            people[people.length-1] = people[people.length-1] + " " + parts[i]
        }
    }
    if (price.length != 0) {
        return { people, price }
    } else {
        return people
    }
}

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
        const parts = msg.body.split(' ');
        const attachmentData = await msg.downloadMedia();
        if (parts.length === 1) {
            send_json = {
                "gambar": attachmentData.data,
                "dest": "id"
            }
        } else {
            send_json = {
                "gambar": attachmentData.data,
                "dest": parts[1]
            }
        }
        const url = "http://127.0.0.1:5000/comic"
        fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body:JSON.stringify(send_json)
        }).then(response => {
            if (!response.ok) {
              throw new Error('Network response was not ok');
            }
            return response.json();
        }).then(responseData => {
            console.log('Success:', responseData);
            const base64Image = responseData.image
            const media = new MessageMedia('image/png', base64Image, 'translated_comic.png');
            client.sendMessage(msg.from,media)
        }).catch(error => {
            console.error('Error:', error);
        });
        // console.log(send_json)
        msg.reply("⚙️Processing Image⚙️")
    }else if (msg.body.startsWith("!pantungan")) {
        try {
            const parts = msg.body.split(' ');
            console.log(parts[1])
            console.log(parts[2])
            if (parts[1].toLowerCase() == 'all') {
                let chat = await msg.getChat();
                if (chat.isGroup) {
                    total_people = chat.participants.length-1
                    harga = parseInt(parts[2]);
                    // console.log(harga)
                    if (!isNaN(harga)) {
                        total = harga / (total_people);
                        msg.reply(`total harga : ${harga} dibagi ${total_people} = ${total}`);
                    } else {
                        msg.reply("Price is not valid")
                    }
                } else {
                    msg.reply('This command can only be used in a group!');
                }
            } else if (parts[1].startsWith('@')) {
                // console.log("Mention terdeteksi:", parts[1]);
                const data_mention_with_price = getMentionInGrub(parts)
                length = data_mention_with_price.people.length
                console.log(data_mention_with_price)
                console.log(length)
                for (let i = 0; i < length; i++){
                    const currentPeople = data_mention_with_price.people[i]
                    const currentPrice = data_mention_with_price.price[i]
                    console.log(i, currentPeople)
                    console.log(i, currentPrice)
                    // if (!isNaN(price)) {
                        // const mentionedContact = getMentionInGrub.people[i].find(contact => contact.id.user === mentionedUser.replace('@', ''));
                    // const phoneNumber = mentionedContact.number;
                    // msg.reply(`Nomor telepon ${mentionedUser}: ${phoneNumber}, dengan harga: ${getMentionInGrub.price[i]}`);
                    msg.reply(`Nomor telepon : ${currentPeople}, dengan harga: ${currentPrice}`);
                    // }
                } 
            } else {
                msg.reply("wrong input : '!patungan <all> <price> or !patungan <people> <price>'")
            }
        } catch (err) {
            msg.reply("wrong input : '!patungan <all> <price> or !patungan <people> <price>'")
        }
    }
    else if (msg.body.startsWith("!creategroup")) {
        try {
            const parts = msg.body.split(' ');
            const titlegroup = parts[1]
            const people = []
            console.log(parts)
            for (let i = 2; i < parts.length; i++){
                people.push(parts[i])
            }
            const result = await client.createGroup(titlegroup, people);
            console.log(`Result make groub "${result}"`)
            msg.reply(`Mencoba membuat grup dengan judul: "${titlegroup}" dan anggota: ${people.join(', ')}`);
        } catch (err) {
            msg.reply("wrong input")
        }
    }
        
});


client.initialize(debug = true);
app.get('/test', async(req, res) => {
    const phoneNumber = 'phonenumber'
    const chatId = phoneNumber.substring(1) + '@c.us';
    const message = 'testing';
    try {
        await client.sendMessage(chatId, message);
        res.send(`berhasil kirim ke nomor ${phoneNumber}`)
    } catch {
        res.send(`gagal`)
    }
  })
  
app.listen(port,debug = true)