import re
import os
import sys

with open('bench.txt','r') as f:
    vs = list(map(float, re.findall('\d{2}\.\d{2}', f.read())))

t = sum(vs) / len(vs)
b_size = os.path.getsize(sys.argv[1]) * 8
v = b_size / t

print('Body size: {}'.format(b_size))
print('Average time: {}'.format(t))
print('Average transmission speed: {} bits/s'.format(v))
