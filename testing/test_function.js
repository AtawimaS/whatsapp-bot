// function isStringAngka(str) {
//     if (typeof str !== 'string') {
//       return false; // Bukan string, jadi bukan string angka
//     }
//     return !isNaN(parseFloat(str)) && isFinite(Number(str));
// }

// function getMentionInGrub(parts) {
//     const people = []
//     const price = []
//     for (let i = 1; i < parts.length; i++){
//         if (parts[i].startsWith("@")) {
//             people.push(parts[i].trim().split(' ')[0])
//         } else if(isStringAngka(parts[i])){
//             price.push(parts[i].trim())
//         }
//     }
//     if (price.length != 0) {
//         return { people, price }
//     } else {
//         return people
//     }
// }

// const parts = [
//     '!patunganme',
//     '@6281234240095',
//     '25000',
//     '@62895360654959',
//     '55000',
//     '#testing',
//     '2'
// ]
// const string = "!patunganme @Nicholas Tristandi 25000 @Ini Edrico 55000 #testing 2"
// const string_without_desc = string.split("#")[0]
// const splitParts = string_without_desc.split(' ')
// console.log(parts.slice(0,3))


// test = [
//     {
//       id: {
//         server: 'c.us',
//         user: '6285155496775',
//         _serialized: '6285155496775@c.us'
//       },
//       isAdmin: true,
//       isSuperAdmin: true
//     },
//     {
//       id: {
//         server: 'c.us',
//         user: '62895360654959',
//         _serialized: '62895360654959@c.us'
//       },
//       isAdmin: false,
//       isSuperAdmin: false
//     },
//     {
//       id: {
//         server: 'c.us',
//         user: '6289619963377',
//         _serialized: '6289619963377@c.us'
//       },
//       isAdmin: false,
//       isSuperAdmin: false
//     },
//     {
//       id: {
//         server: 'c.us',
//         user: '6281234240095',
//         _serialized: '6281234240095@c.us'
//       },
//       isAdmin: false,
//       isSuperAdmin: false
//     }
//   ]

//   console.log(test)

// const input = "27-10-2024:12-00";
// const pattern = /^(\d{2})-(\d{2})-(\d{4}):(\d{2})-(\d{2})$/;
// if (patern.test(input)){
//     const now = new Date
//     const iso = now.toISOString()
//     const [date, time] = iso.split('T')
//     console.log(date)
// }

function change_to_utc(datestr, utc = 7){
    const datetime = datestr.split(':');
    const [day, month, year] = datetime[0].split('-');
    const [hour, minute] = datetime[1].split('-');
    const localdate = new Date(
        parseInt(year),
        parseInt(month) - 1, // bulan di JS dimulai dari 0
        parseInt(day),
        parseInt(hour),
        parseInt(minute)
    );
    localdate.setHours(localdate.getHours() - (utc));
    return localdate.toISOString();
}
change_to_utc('12-06-2025:10-11')
const now = new Date()
console.log(now)