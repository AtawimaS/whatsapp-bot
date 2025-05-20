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

const parts = [
    '!patunganme',
    '@6281234240095',
    '25000',
    '@62895360654959',
    '55000',
    '#testing',
    '2'
]
const string = "!patunganme @Nicholas Tristandi 25000 @Ini Edrico 55000 #testing 2"
const string_without_desc = string.split("#")[0]
const splitParts = string_without_desc.split(' ')
console.log(getMentionInGrub(splitParts))
