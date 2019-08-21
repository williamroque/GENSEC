import sys

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
    '\n',
    *u_chars
]

lines = sys.stdin.readlines()

key, *msg = lines
e, n = list(map(int, key.split(':')))

msg = ''.join(msg)

def to_n(s):
    s_n = ''
    for char in s:
        if char in CHAR_TABLE:
            i = CHAR_TABLE.index(char)
            s_n += str(i).zfill(2)
    return int(s_n)

def split(s):
    return [s[i:i+64] for i in range(0, len(s), 64)]

cipher_sections = []

for section in split(msg):
    b = to_n(section)
    cipher_sections.append(str(pow(b, e, n)))

print('-'.join(cipher_sections))
