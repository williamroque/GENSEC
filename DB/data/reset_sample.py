import numpy as np

with open('integrante.csv', 'w+') as f:
    string_length = 15
    rows = 5000
    row_length = 9

    data = [[''.join([chr(x) for x in text]) for text in row] for row in np.random.randint(65, 90, (rows, row_length, string_length))]

    f.write('\n'.join([';'.join(row) for row in data]))
