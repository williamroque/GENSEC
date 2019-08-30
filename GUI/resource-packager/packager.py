import os
import sys

if len(sys.argv) < 2:
    print('Enter directory.')
    sys.exit(0)

t_dir = sys.argv[1]

files = os.listdir(t_dir)

template = 'module.exports = [{}]';

contents = []
for file in files:
    with open('{}/{}'.format(t_dir, file), 'r') as f:
        contents.append('[\'{}\', `{}`]'.format(file, f.read()))

template = template.format(', '.join(contents))

with open('appdata-resources.js', 'w+') as f:
    f.write(template)
