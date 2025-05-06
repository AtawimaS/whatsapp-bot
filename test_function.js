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

// Contoh Penggunaan:
const parts1 = ["!bayar", "@user1 new", "7500", "@user2", "10000"];
const result1 = getMentionInGrub(parts1);
console.log(result1); // Output: { people: [ '@user1', '@user2' ], price: 10000 }

const parts2 = ["!split", "@andi", "5000", "@budi"];
const result2 = getMentionInGrub(parts2);
console.log(result2); // Output: { people: [ '@andi', '@budi' ], price: 5000 }

const parts3 = ["!info", "@group1"];
const result3 = getMentionInGrub(parts3);
console.log(result3); // Output: { people: [ '@group1' ], price: null }

console.log(result1.people[1])
