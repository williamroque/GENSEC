import random
import math

def miller_rabin(n):
    r = 0
    d = n - 1
    while d % 2 == 0:
        r += 1
        d >>= 1
    for _ in range(128):
        a = random.randint(2, n - 2)
        x = pow(a, d, n)
        if x != 1 and x != n - 1:
            skips = False
            for _ in range(r):
                x = pow(x, 2, n)
                if x == 1:
                    return False
                if x == n - 1:
                    skips = True
                    break
            if (not skips) and x != n - 1:
                return False
    return True

small_primes = []
with open('smallprimes.txt', 'r') as f:
    small_primes = f.read().split(';')

def generate_prime(μl):
    while True:
        δp = random.randint(10 ** μl, 10 ** (μl + 1))
        if δp % 2 == 0:
            δp += 1
        for p in small_primes:
            if δp % int(p) == 0:
                continue
        if not miller_rabin(δp):
            continue
        return δp

def egcd(a, b):
    if a == 0:
        return (b, 0, 1)
    else:
        g, x, y = egcd(b % a, a)
        return (g, y - (b // a) * x, x)

def mulinv(a, b):
    g, x, _ = egcd(a, b)
    if g == 1:
        return x % b

def to_n(s):
    s_n = ''
    for char in s:
        n = ord(char)
        if 0 < n < 1000:
            s_n += str(n).zfill(3)
    return int(s_n)

def to_s(n):
    n_s = str(n)
    l_s = len(n_s)
    s = ''
    if l_s % 3 > 0:
        n_s = n_s.zfill(l_s + (3 - l_s % 3))
    for i in range(0, l_s, 3):
        s += chr(int(n_s[i:i + 3]))
    return s

def generate_keys():
    p = generate_prime(150)
    q = generate_prime(100)
    n = p * q
    λ = (p - 1) * (q - 1) // egcd(p - 1, q - 1)[0]

    e = 65537
    d = mulinv(e, λ)

    return ((n, e), (n, d))

def encrypt(t, pub_key):
    return '-'.join([str(int(pow(to_n(section), int(pub_key[1]), int(pub_key[0])))) for section in split(t)])

def decrypt(t, prv_key):
    return ''.join([to_s(int(pow(int(section), int(prv_key[1]), int(prv_key[0])))) for section in t.split('-')])

def split(s):
    return [s[i:i+64] for i in range(0, len(s), 64)]
