import sys
import multiprocessing as mp

import os.path as op

import re

u_chars = []
with open(op.join(op.abspath(op.dirname(__file__)), 'ucharlist.txt'), 'r') as f:
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
    '\\n',
    *u_chars
]

####### taken from rosettacode.org #######
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
#######----------------------------#######

def to_s(n):
    n_s = str(n)
    l_s = len(n_s)
    s = ''
    if l_s % 2 > 0:
        n_s = n_s.zfill(l_s + (2 - l_s % 2))
    for i in range(0, l_s, 2):
        s += CHAR_TABLE[int(n_s[i:i + 2])]
    return s

lines = sys.stdin.readlines()

key, is_reversed, *msg = lines

def eprint(*args, **kwargs):
    print(*args, file=sys.stderr, **kwargs)

is_reversed = bool(int(is_reversed))

keys = primes = []
d = n = p = q = 0

if not is_reversed:
    keys, primes = key.strip().split(';')
    p, q = list(map(int, primes.split(':')))
else:
    keys = key.strip()

d, n = list(map(int, keys.split(':')))

msg = '\\n'.join(msg).split('-')

plain_sections = []

def decrypt_section(section):
    section = int(section)

    dp = d % (p - 1)
    dq = d % (q - 1)
    qinv = mulinv(q, p)

    m1 = pow(section, dp, p)
    m2 = pow(section, dq, q)

    h = qinv * (m1 - m2) % p

    return to_s(int(m2 + h * q))

if is_reversed:
    for section in msg:
        section = int(section)
        plain_sections.append(to_s(int(pow(section, d, n))))
else:
    with mp.Pool(mp.cpu_count()) as p:
        plain_sections = p.map(decrypt_section, msg)

print(re.sub('\\n{2,}', '\\n', ''.join(plain_sections)), end='')
