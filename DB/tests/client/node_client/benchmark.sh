rm -f bench.txt

read -r -d '' avgscript << EOM
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
EOM

if [ ! -f 'avg.py' ]; then
    echo "$avgscript" > avg.py
fi

for i in {1..$1}
do
    echo
    gtime --output=bench.txt -a --format="%E" node db.js>/dev/null
    echo "== $i ==" >> bench.txt
    tail -2 bench.txt
done

echo

python3 avg.py $2

echo
