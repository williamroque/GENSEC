const { spawnSync } = require('child_process');

function generateKeys() {
    const process = spawnSync('python3', ['generate_keys.py']);
    const [ n, keys, primes ] = process.stdout.toString().trim().split('|');
    const [ e, d ] = keys.split(';');

    return {
        pub: [e, n],
        prv: [d, n],
        primes: primes.split(';')
    };
}

function encrypt(msg, key) {
    const process = spawnSync('python3', ['encrypt.py', msg, ...key]);
    return process.stdout.toString().trim();
}

function decrypt(msg, key, reversed) {
    const process = spawnSync('python3', ['decrypt.py', msg, ...key, reversed]);
    return process.stdout.toString().trim();
}

module.generateKeys = generateKeys;
module.encrypt = encrypt;
module.decrypt = decrypt;
