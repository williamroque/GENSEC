import re
import os

with open('bench.txt','r') as f:
    vs = list(map(float, re.findall('\d{2}\.\d{2}', f.read())))

t = sum(vs) / len(vs)
b_size = os.path.getsize('../../data/integrante.csv') * 8
v = b_size / t

print('Body size: {}\nAverage time: {}\nAverage transmission speed: {} bits/s'.format(b_size, t, v))
