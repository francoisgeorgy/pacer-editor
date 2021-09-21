// input: hex values separated by spaces
// output: hex values with checksum appended

// node tools/checksum.js  02 01 17 7F
// 67
// sendmidi dev MIDI1 syx hex 00 01 77 7F 02 01 17 7F 67


let args = process.argv.slice(2);

let bytes = [];
for (let i=0; i < (args.length); i++) {
    bytes.push(parseInt(args[i], 16));
}

let sum = bytes.reduce((previousValue, currentValue) => previousValue + currentValue);
sum = (128 - (sum % 128)) % 128;

console.log(sum.toString(16));
