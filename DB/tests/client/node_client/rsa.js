const { spawn } = require('child_process');

function generateKeys() {
    const subprocess = spawn('python3', ['generate_keys.py']);

    let out = '';

    subprocess.stdout.on('data', data => {
        out += data.toString().trim();
    });

    return new Promise(resolve => {
        subprocess.on('close', () => {
            const [ n, keys, primes ] = out.split('|');
            const [ e, d ] = keys.split(';');

            resolve({
                pub: [e, n],
                prv: [d, n],
                primes: primes.split(';')
            });
        });
    });
}

function encrypt(msg, key) {
    const subprocess = spawn('python3', ['encrypt.py']);

    subprocess.stdin.write(`${key[0]}:${key[1]}\n${msg}`);
    subprocess.stdin.end();

    let out = '';

    subprocess.stdout.on('data', data => {
        out += data.toString().trim();
    });

    return new Promise(resolve => {
        subprocess.on('close', () => {
            resolve(out);
        });
    });
}

function decrypt(msg, key, reversed=false) {
    const subprocess = spawn('python3', ['decrypt.py']);

    subprocess.stdin.write(`${key[0]}:${key[1]}\n${reversed | 0}\n${msg}`);
    subprocess.stdin.end();

    let out = '';

    subprocess.stdout.on('data', data => {
        out += data.toString().trim();
    });

    return new Promise(resolve => {
        subprocess.on('close', () => {
            resolve(out);
        });
    });
}

module.exports = {
    generateKeys: generateKeys,
    encrypt: encrypt,
    decrypt: decrypt
};

