change = value => {
    const http = require('http');

    let data = '';

    http.get('http://viacep.com.br/ws/'+value+'/json/', resp => {
        resp.on('data', chunk => {
            data += chunk;
        });
        resp.on('end', () => {
            data = JSON.parse(data);

            let dom = {
                'Rua': {},
                'complemento': {},
                'Bairro': {},
                'Cidade': {},
                'Estado': {}
            };

            const { logradouro, complemento, bairro, localidade, uf } = data;
            dom['Rua'].value = logradouro || dom['Rua'].value;
            dom['complemento'].value = complemento || dom['Complemento'].value;
            dom['Bairro'].value = bairro || dom['Bairro'].value;
            dom['Cidade'].value = localidade || dom['Cidade'].value;
            dom['Estado'].value = uf || dom['Estado'].value;

            console.log(dom);
        });
    });

};

change('80530010');
