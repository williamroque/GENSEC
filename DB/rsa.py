import random
import math

u_chars = []
with open('ucharlist.txt', 'r') as f:
    u_chars = f.read().split(' ')

char_range = lambda a, b: [chr(x) for x in range(ord(a), ord(b) + 1)]

CHAR_TABLE = [
    '§',
    *char_range('A', 'Z'),
    *char_range('a', 'z'),
    *map(str, range(10)),
    ';',
    ' ',
    '-',
    '_',
    '|',
    '%',
    ':',
    '@',
    '\n',
    *u_chars
]

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

####### taken from rosettacode.org #######\
                                          #
def egcd(a, b):                           #
    if a == 0:                            #
        return (b, 0, 1)                  #
    else:                                 #
        g, x, y = egcd(b % a, a)          #
        return (g, y - (b // a) * x, x)   #
                                          #
def mulinv(a, b):                         #
    g, x, _ = egcd(a, b)                  #
    if g == 1:                            #
        return x % b                      #
                                          #
#######----------------------------#######/

def to_n(s):
    s_n = ''
    for char in s:
        if char in CHAR_TABLE:
            i = CHAR_TABLE.index(char)
            s_n += str(i).zfill(2)
    return int(s_n)

def to_s(n):
    n_s = str(n)
    l_s = len(n_s)
    s = ''
    if l_s % 2 > 0:
        n_s = n_s.zfill(l_s + (2 - l_s % 2))
    for i in range(0, l_s, 2):
        s += CHAR_TABLE[int(n_s[i:i + 2])]
    return s

def generate_keys():
    global p, q
    p = generate_prime(150)
    q = generate_prime(100)
    n = p * q
    λ = (p - 1) * (q - 1) // egcd(p - 1, q - 1)[0]

    e = 65537
    d = mulinv(e, λ)

    return ((e, n), (d, n))

def encrypt(t, pub_key):
    cipher_sections = []

    e = int(pub_key[0])
    n = int(pub_key[1])

    for section in split(t):
        b = to_n(section)
        cipher_sections.append(str(pow(b, e, n)))

    return '-'.join(cipher_sections)

def decrypt(t, prv_key, is_reversed=False):
    d = int(prv_key[0])
    n = int(prv_key[1])

    t = t.split('-')

    plain_sections = []

    if is_reversed:
        for section in t:
            section = int(section)
            plain_sections.append(to_s(int(pow(section, d, n))))
    else:
        for section in t:
            section = int(section)

            dp = d % (p - 1)
            dq = d % (q - 1)
            qinv = mulinv(q, p)

            m1 = pow(section, dp, p)
            m2 = pow(section, dq, q)

            h = qinv * (m1 - m2) % p

            plain_sections.append(to_s(int(m2 + h * q)))

    return ''.join(plain_sections)

def split(s):
    return [s[i:i+64] for i in range(0, len(s), 64)]
