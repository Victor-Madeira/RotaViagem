/*
Origem: GRU, Destino: BRC, Valor: 10
Origem: BRC, Destino: SCL, Valor: 5
Origem: GRU, Destino: CDG, Valor: 75
Origem: GRU, Destino: SCL, Valor: 20
Origem: GRU, Destino: ORL, Valor: 56
Origem: ORL, Destino: CDG, Valor: 5
Origem: SCL, Destino: ORL, Valor: 20
*/

var api = require('../api');

module.exports = (app) => {
    //put - reset - $ curl -X PUT localhost:8080/rota/reset
    app.route('/rota/reset').put(api.reset);

    //get - lista rotas - $ curl localhost:8080/rota/lista
    app.route('/rota').get(api.lista);

    //GRU para CDG
    //get - rota mais barata - $ curl localhost:8080/rota/GRU/CDG
    app.route('/rota/:origem/:destino').get(api.maisBarata);

    //post - insert - $ curl -X POST localhost:8080/rota/ORA/ORG/75
    app.route('/rota/:origem/:destino/:valor').post(api.insert);

    //delete - delete - $ curl -X DELETE localhost:8080/rota/8
    app.route('/rota/:id').delete(api.delete);

    //put - update - $ curl -X PUT localhost:8080/rota/1/ORA/ORG/75
    app.route('/rota/:id/:origem/:destino/:valor').put(api.update);

    return app;
};