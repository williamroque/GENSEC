import numpy as np
import os.path as op
import sys

with open(op.join(op.abspath(op.dirname(__file__)), 'integrante.csv'), 'w+') as f:
    string_length = 15
    rows = int(sys.argv[1])
    row_length = 9

    data = [[''.join([chr(x) for x in text]) for text in row] for row in np.random.randint(65, 90, (rows, row_length, string_length))]

    f.write('\n'.join([';'.join(row) for row in data]))
