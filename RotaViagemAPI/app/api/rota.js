const fs = require('fs');
const api = {};

api.reset = function(req, res) {
    fs.readFile('rotasBase.csv', 'utf-8', function(err, data) {
        if (err) {
            erro();
            return;
        };

        fs.writeFile('rotas.csv', data, err => {
            if (err) {
                erro()
                return;
            }

            res.status(200).send({
                message: 'registros resetados com sucesso!'
            });
        });
    
    });

    function erro() {
        res.status(400).send({
            message: 'Não foi possível resetar o registro!'
        });
        return;
    }
}

api.lista = function(req, res) {
    fs.readFile('rotas.csv', 'utf-8', function(err, data) {
        if (err) {
            erro();
            return;
        };
        var re = new RegExp('\r', 'g');
    
        res.status(200).send({
            rotas: data.replace(re, '').split('\n'),
            message: 'Rotas carregadas com sucesso!'
        });
    });

    function erro() {
        res.status(400).send({
            message: 'Não foi possível resetar o registro!'
        });
        return;
    }
}

api.maisBarata = function(req, res) {
    var linhas = [];
    var re = new RegExp('\r', 'g');

    fs.readFile('rotas.csv', 'utf-8', function(err, data) {
        if (err) {
            erro();
            return;
        };

        linhas = data.replace(re, '').split('\n');

        proximaParada(req.params.origem, -1);
    });

    var possiveisRotas = [];
        
    function proximaParada(origem, index) {
        var preenchida = false;
        for (var a = 0 ; a < linhas.length ; a++) {
            var linha = linhas[a].split(';');
            if (linha[1] == origem && index == -1) {
                possiveisRotas[possiveisRotas.length] = linha[1] + '-' + linha[2] + '$' + linha[3];
                if (linha[2] != req.params.destino) {
                    proximaParada(linha[2], possiveisRotas.length -1);
                }
            } else if (linha[1] == origem && !possiveisRotas[index].includes(linha[2])) {
                var editaRota = possiveisRotas[index].split('$');
                var valor = Number(linha[3]) + Number(editaRota[1]);
                if (!preenchida) {
                    possiveisRotas[index] = editaRota[0] + '-' + linha[2] + '$' + valor;
                    if (linha[2] != req.params.destino) {
                        proximaParada(linha[2], index);
                    }
                } else {
                    possiveisRotas[possiveisRotas.length] = editaRota[0] + '-' + linha[2] + '$' + valor;
                    if (linha[2] != req.params.destino) {
                        proximaParada(linha[2], possiveisRotas.length -1);
                    }
                }
                preenchida = true;
            }
        }

        if (index == -1) {
            calculaMaisBarata()
        }
    }

    function calculaMaisBarata() {
        if (possiveisRotas.length == 0) {
            erro();
        }

        var vlrMaisBaixo = -1;
        var posicao = -1;

        for (var b = 0 ; b < possiveisRotas.length ; b ++) {
            var rotaAnalise = possiveisRotas[b].split('$');
            if (rotaAnalise[0].split('-').splice(-1)[0] == req.params.destino) {
                if (posicao == -1 || rotaAnalise[1] < vlrMaisBaixo) {
                    posicao = b;
                    vlrMaisBaixo = rotaAnalise[1];
                }
            }
        }

        if (posicao != -1) {
            res.status(200).send({
                message: 'Rota mais barata: ' + possiveisRotas[posicao].split('$')[0] + ' ao custo de $' + possiveisRotas[posicao].split('$')[1]
            });
        } else {
            erro();
        }
    }

    function erro() {
        res.status(400).send({
            message: 'Não foi possível encontrar rota!'
        });
        return;
    }
}

api.insert = function(req,res) {
    var file = "";

    if (isNaN(req.params.valor)) {
        erro();
        return;
    }

    const insertValue = req.params.origem + ";" + req.params.destino + ";" + req.params.valor;

    fs.readFile('rotas.csv', 'utf-8', function(err, data) {
        if (err) {
            erro();
            return;
        };

        var linhas = data.split('\n');
        var ultimaLinha = linhas.slice(-1)[0];

        var id = Number(ultimaLinha.split(';')[0]) + 1;

        file = data + "\n" + id + ";" + insertValue;

        fs.writeFile('rotas.csv', file, err => {
            if (err) {
                erro()
                return;
            }

            res.status(200).send({
                message: 'registros incluídos com sucesso!'
            });
        });
            
    });

    function erro() {
        res.status(400).send({
            message: 'Não foi possível incluir o registro!'
        });
        return;
    }
}

api.delete = function(req,res) {
    const apagaId = Number(req.params.id);

    fs.readFile('rotas.csv', 'utf-8', function(err, data) {
        if (err) {
            erro();
            return;
        };

        resposta = "";

        var linhas = data.split('\n');
        for (var a = 0 ; a < linhas.length ; a++) {
            if (linhas[a].split(';')[0] == apagaId) {
                if (a == 0) {
                    resposta = linhas.slice(1).join('\n');
                }
                else {
                    resposta = linhas.slice(0, a).join('\n')
                    if (linhas.slice(a+1) != ""){
                        resposta = resposta + '\n' + linhas.slice(a+1).join('\n');
                    }
                }
            }
        }

        if (resposta == "") {
            res.status(400).send({
                message: 'Registro com Id selecionado não encontrado!'
            });
        } else {
            fs.writeFile('rotas.csv', resposta, err => {
                if (err) {
                    erro()
                    return;
                }
    
                res.status(200).send({
                    message: 'registro excluído com sucesso!'
                });
            });
        }
    });

    function erro() {
        res.status(400).send({
            message: 'Não foi possível incluir o registro!'
        });
        return;
    }
}

api.update = function(req,res) {
    if (isNaN(req.params.valor) || isNaN(req.params.id)) {
        erro();
        return;
    }

    const attId = Number(req.params.id);
    const attOrigem = req.params.origem;
    const attDestino = req.params.destino;
    const attValor = req.params.valor;
    const attResgistro = [attId, attOrigem, attDestino, attValor];

    fs.readFile('rotas.csv', 'utf-8', function(err, data) {
        if (err) {
            erro();
            return;
        };

        resposta = "";

        var linhas = data.split('\n');
        for (var a = 0 ; a < linhas.length ; a++) {
            if (linhas[a].split(';')[0] == attId) {
                if (a == 0) {
                    resposta = attResgistro.join(';') + '\n' + linhas.slice(1).join('\n');
                }
                else {
                    resposta = linhas.slice(0, a).join('\n')
                    if (linhas.slice(a+1) != ""){
                        resposta = resposta + '\n' + attResgistro.join(';') + '\n' + linhas.slice(a+1).join('\n');
                    } else {
                        resposta = resposta + '\n' + attResgistro.join(';');
                    }
                }
            }
        }

        if (resposta == "") {
            res.status(400).send({
                message: 'Registro com Id selecionado não encontrado!'
            });
        } else {
            fs.writeFile('rotas.csv', resposta, err => {
                if (err) {
                    erro()
                    return;
                }
    
                res.status(200).send({
                    message: 'registro editado com sucesso!'
                });
            });
        }
    });

    function erro() {
        res.status(400).send({
            message: 'Não foi possível incluir o registro!'
        });
        return;
    }
}

module.exports = api;