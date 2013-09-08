(function () {
    /* jslint node: true */
    'use strict';

    var url = require('url'),
        htmlParser = require('htmlparser'),
        http = require('http'),
        select = require('soupselect').select,
        link = 'http://www.tbmm.gov.tr/develop/owa/milletvekillerimiz_sd.mv_liste?p_donem_kodu=24',
        reqOptions = url.parse(link),
        req, urlHandler, urlParser;

        urlHandler = new htmlParser.DefaultHandler(function (err, dom) {
            if(err) {
                throw err;
            }

            // there should be only one...
            select(dom, 'div.grid_12').forEach(function (item){
                item.children.forEach(function (child) {
                    if(child.name === "TABLE") {
                        console.log(child.children);
                    }
                });
            });
        });

        urlParser = new htmlParser.Parser(urlHandler);

        req = http.request(reqOptions, function (res) {
            if(res.statusCode !== 200) {
                throw {code: res.statusCode};
            }

            res.on('data', function (chunk) {
                urlParser.parseChunk(chunk);
            });

            res.on('end', function () {
                urlParser.done();
            });
        });

        req.on('error', function (err) {
            throw err;
        });

        req.end();

})();