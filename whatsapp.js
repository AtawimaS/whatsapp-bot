const qrcodeTerminal = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia, Poll , PollVote} = require('whatsapp-web.js');

// const express = require('express')
// const app = express()
// const port = 3000

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

// function send_polling() {
//     const poll = new Poll('Cats or Dogs?', ['Cats', 'Dogs'], {
//         allowMultipleAnswers: false 
//     });
//     const pollMessage = await chat.sendMessage(poll);
//     const pollId = pollMessage.id._serialized;
//     console.log(pollMessage)
//     console.log(`Poll created with ID: ${pollId}`);
// }

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
    bot_num =client.info.me._serialized
    console.log(bot_num)
    // console.log(client.info)
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
        msg.reply("⚙️Processing Image⚙️")

    /*
        This function is using for split bill, if you're the one paying
    */
    }else if (msg.body.startsWith("!patunganme")) {
        try {
            const parts = msg.body.split(' ');
            if (parts[1].toLowerCase() == 'all') {
                let chat = await msg.getChat();
                if (chat.isGroup) {
                    total_people = chat.participants.length - 1
                    creditor = msg.author
                    console.log(creditor)
                    // console.log(chat.participants)/
                    debtors = chat.participants.map(p => p.id._serialized);
                    debtor_list = debtors.filter(p => p != bot_num && p != creditor);
                    console.log(debtor_list)
                    harga = parseInt(parts[2]);
                    if (!isNaN(harga)) {
                        total = harga / (total_people);
                        msg.reply(`total harga : ${harga} dibagi ${total_people} = ${total}`);
                        desc = `Split Bill to ${creditor}`
                        if (msg.body.match(/#.*/) != null) {
                            desc = msg.body.match(/#.*/)[0].substring(1)
                        }
                        send_json = {
                            "debtors": debtor_list,
                            "creditors": Array(debtor_list.length).fill(creditor),
                            "value": Array(debtor_list.length).fill(total),
                            "description": desc,
                            "type" : "Debt"
                        }
                        const url = "http://127.0.0.1:5000/add_trx"
                        fetch(url, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body:JSON.stringify(send_json)
                        }).then(response => {
                            if (!response.ok) {
                              console.log('Network response was not ok (PatunganMe)');
                            }
                            return response.json();
                        }).then(responseData => {
                            console.log('Success:', responseData);
                            msg.reply(`Success add transaction to ${debtor_list.length} people`)
                        })
                    } else {
                        msg.reply("Price is not valid")
                    }
                } else {
                    msg.reply('This command can only be used in a group!');
                }
            } else if (parts[1].startsWith('@')) {
                const data_mention_with_price = getMentionInGrub(parts)
                length = data_mention_with_price.people.length
                console.log(data_mention_with_price)
                console.log(length)
                for (let i = 0; i < length; i++){
                    const currentPeople = data_mention_with_price.people[i]
                    const currentPrice = data_mention_with_price.price[i]
                    console.log(i, currentPeople)
                    console.log(i, currentPrice)
                    msg.reply(`Nomor telepon : ${currentPeople}, dengan harga: ${currentPrice}`);
                } 
            } else {
                msg.reply("wrong input : '!patungan <all> <price> or !patungan <people> <price>'")
            }
        } catch (err) {
            msg.reply("wrong input : '!patungan <all> <price> or !patungan <people> <price>'")
        }
    }
    else if (msg.body == "!all") {
        let chat = await msg.getChat();
        if (chat.isGroup) {
            const mention = chat.participants.map(p => p.id._serialized);
            const mention_text = mention.map(m => `@${m.split('@')[0]}`).join(' ');
            client.sendMessage(msg.from, `${mention_text}`, {
                mentions: mention
            });
        } else {
            msg.reply('This command can only be used in a group!');
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


// app.get('/test', async(req, res) => {
//     const phoneNumber = 'phonenumber'
//     const chatId = phoneNumber.substring(1) + '@c.us';
//     const message = 'testing';
//     try {
//         await client.sendMessage(chatId, message);
//         res.send(`berhasil kirim ke nomor ${phoneNumber}`)
//     } catch {
//         res.send(`gagal`)
//     }
//   })
  
// app.listen(port,debug = true)