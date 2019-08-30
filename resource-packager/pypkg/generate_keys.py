import random

import os.path as op

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
with open(op.join(op.abspath(op.dirname(__file__)), 'smallprimes.txt'), 'r') as f:
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

p = generate_prime(150)
q = generate_prime(100)
n = p * q
λ = (p - 1) * (q - 1) // egcd(p - 1, q - 1)[0]

e = 65537
d = mulinv(e, λ)

print('{}|{};{}|{};{}'.format(n, e, d, p, q))
