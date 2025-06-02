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
            people.push(parts[i].trim().split(' ')[0])
        } else if(isStringAngka(parts[i])){
            price.push(parts[i].trim())
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
    bot_num = client.info.me._serialized
    bot_num_user = client.info.me.user
    console.log(bot_num)
    console.log(bot_num_user)
});

client.on('message', async msg => {
    if (msg.body == "!ping") {
        msg.reply("P P P!")
    }

/*
    Comic translation
*/
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
            // console.log(parts)
            creditor = msg.author;
            message = msg.body;
            let parts = message.split(" ")
            desc = `Split Bill to ${creditor}`;
            if (msg.body.match(/#.*/) != null) {
                desc = msg.body.match(/#.*/)[0].substring(1);
                message_without_desc = message.split("#")[0]
                parts = message_without_desc.split(" ")
            }
            let chat = await msg.getChat();
            if (parts[1].toLowerCase() == 'all') {
                if (chat.isGroup) {
                    total_people = chat.participants.length - 1
                    debtors = chat.participants.map(p => p.id._serialized);
                    debtor_list = debtors.filter(p => p != bot_num && p != creditor);
                    console.log(debtor_list)
                    if (!isNaN(harga)) {
                        total = harga / (total_people);
                        msg.reply(`total harga : ${harga} dibagi ${total_people} = ${total}`);
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
                if (chat.isGroup) {
                    console.log("test1")
                    const data_mention_with_price = getMentionInGrub(parts)
                    console.log(data_mention_with_price)
                    send_json = {
                        "debtors": data_mention_with_price.people,
                        "creditors": Array(data_mention_with_price.people.length).fill(creditor),
                        "value": data_mention_with_price.price,
                        "description": desc,
                        "type": "Debt"
                    }
                    console.log(send_json)
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
                        msg.reply(`Success add transaction to ${data_mention_with_price.people.length} people`)
                    })
                } else {
                    msg.reply("Price is invalid!")
                }
            } else {
                msg.reply("This command can only used in a group")
            }
        } catch (err) {
            console.error(err);
            msg.reply("wrong input : '!patunganme <all> <price> or !patunganme <people> <price>'")
        }
    }
    /*
        This function is using for split bill, if your friend is paying
    */
    else if (msg.body.startsWith("!patunganto")) {
        try {
            let parts = msg.body.split(" ")
            creditor = parts[1];
            // message = msg.body;
            desc = `Split Bill to ${creditor}`; 
            if (msg.body.match(/#.*/) != null) {
                desc = msg.body.match(/#.*/)[0].substring(1);
                message_without_desc = msg.body.split("#")[0]
                parts = message_without_desc.split(" ")
            }
            let chat = await msg.getChat();
            if (parts[2].toLowerCase() == 'all') {
                if (chat.isGroup) {
                    total_people = chat.participants.length - 1
                    creditor_without_ad = creditor.split('@')[1]
                    debtors = chat.participants.map(p => p.id.user);
                    debtor_list = debtors.filter(p => p != bot_num_user && p != creditor_without_ad);
                    const harga = parts[3] 
                    if (!isNaN(harga)) {
                        total = harga / (total_people);
                        msg.reply(`total harga : ${harga} dibagi ${total_people} = ${total}`);
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
                              console.log('Network response was not ok (PatunganTo)');
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
            } else if (parts[2].startsWith('@')) {
                parts = parts.slice(2,parts.length)
                if (chat.isGroup) {
                    console.log(parts)
                    const data_mention_with_price = getMentionInGrub(parts)
                    console.log(data_mention_with_price)
                    send_json = {
                        "debtors": data_mention_with_price.people,
                        "creditors": Array(data_mention_with_price.people.length).fill(creditor),
                        "value": data_mention_with_price.price,
                        "description": desc,
                        "type": "Debt"
                    }
                    console.log(send_json)
                    const url = "http://127.0.0.1:5000/add_trx"
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body:JSON.stringify(send_json)
                    }).then(response => {
                        if (!response.ok) {
                            console.log('Network response was not ok (PatunganTo)');
                        }
                        return response.json();
                    }).then(responseData => {
                        console.log('Success:', responseData);
                        msg.reply(`Success add transaction to ${data_mention_with_price.people.length} people`)
                    })
                } else {
                    msg.reply("Price is invalid!")
                }
            } else {
                msg.reply("This command can only used in a group")
            }
        } catch (err) {
            console.error(err);
            msg.reply("wrong input : '!patunganto <creditor> <all> <price> or !patunganto <creditor> <people> <price>'")
        }
    }
/*
    To see all debt in group
*/
    else if (msg.body == "!viewdebt") {
        let chat = await msg.getChat();
        all_participant = chat.participants
        peoples = chat.participants.map(p => p.id._serialized); 
        people_list = peoples.filter(p => p != bot_num);
        send_json = {
            "people": people_list
        }
        console.log(people_list)
        console.log(send_json)
        if (chat.isGroup) {
            const url = "http://127.0.0.1:5000/viewing_debt"
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body:JSON.stringify(send_json)
            }).then(response => {
                if (!response.ok) {
                  console.log('Network response was not ok (ViewDebt)');
                }
                return response.json();
            }).then(responseData => {
                let grouped = {};
                for (let item of responseData.result) {
                    if (!grouped[item.debtor]) {
                        grouped[item.debtor] = [];
                    }
                    grouped[item.debtor].push(`@${item.creditor} => ${item.net_value}`);
                }
                let all_text = "";
                for (let debtor in grouped) {
                    all_text += `num : @${debtor}\nHas Debt to :\n`;
                    all_text += grouped[debtor].join("\n") + "\n\n";
                }
                const mention = chat.participants.map(p => p.id._serialized);
                client.sendMessage(msg.from, all_text,
                    {mentions: mention}
                )
                // msg.reply(all_text)
            })
        }
    }
/*
    Mention all people in group
*/
    else if (msg.body == "!all") {
        let chat = await msg.getChat();
        if (chat.isGroup) {
            const mention = chat.participants.map(p => p.id._serialized);
            const mentions = mention.filter(m => m !== bot_num);
            const mention_text = mentions.map(m => `@${m.split('@')[0]}`).join(' ');
            client.sendMessage(msg.from, `${mention_text}`, {
                mentions: mentions
            });
        } else {
            msg.reply('This command can only be used in a group!');
        }
    }
/*
    split bill using invoice or Receipt
*/
    else if (msg.body.startsWith("$"), msg.hasMedia) {
        let chat = await msg.getChat();
        const attachmentData = await msg.downloadMedia();
        if (chat.isGroup) {
            const message_splitting = msg.body.split('$')
            const message_delete_first_index = message_splitting.slice(1)
            const message_cleaned = message_delete_first_index.join('')
            console.log(message_cleaned)
        } else {
            msg.reply("Must in Group!!!")
        }
    }
/*
    Create group
    note : under development
*/
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


client.initialize();


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