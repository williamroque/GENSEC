import numpy as np

with open('integrantes-operacao.csv', 'w+') as f:
    data = np.random.randint(1, 50000, (100, 9))
    f.write('\n'.join([';'.join([str(x) for x in row]) for row in data]))
