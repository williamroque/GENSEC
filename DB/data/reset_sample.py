import numpy as np

with open('integrante.csv', 'w+') as f:
    string_length = 15
    num_length = 16
    rows = 100
    row_length = 9

    data = [[[np.random.randint(10 ** (string_length - 1), 10 ** string_length)]] + list(row) for row in np.random.randint(65, 90, (rows, row_length, string_length))]
    f.write('\n'.join([';'.join(['|'.join([str(char) for char in col]) for col in row]) for row in data]))
