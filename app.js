(function () {
    /* jslint node: true */
    'use strict';

    var url = require('url'),
        htmlParser = require('htmlparser'),
        http = require('http'),
        domSelector = require('./dom-selector'),
        encoder = require('turkish-char-encoding'),
        link = 'http://www.tbmm.gov.tr/develop/owa/milletvekillerimiz_sd.mv_liste?p_donem_kodu=1',
        reqOptions = url.parse(link),
        req, urlHandler, urlParser;

        urlHandler = new htmlParser.DefaultHandler(function (err, dom) {
            if(err) {
                throw err;
            }

            var mvList = domSelector.start(dom).any('div', {'class': 'grid_12'}).any('TABLE').any('TR').any('TD').any('A').end();
            mvList.forEach(function (mv) {
                // ok, being a maverick here...
                var link = mv.attribs['href'] || mv.attribs['HREF'],
                    regNo = link.match(/.*p_sicil=(\d+).*/)[1],
                    name = mv.children[0].data;

                console.log(regNo + ': ' + name);
            });
        });

        urlParser = new htmlParser.Parser(urlHandler);

        req = http.request(reqOptions, function (res) {
            if(res.statusCode !== 200) {
                throw {code: res.statusCode};
            }

            var content_type = null;
            res.setEncoding('utf-8');
            if(res.headers['content-type']) {
                // console.log(res.headers['content-type']);
                var encMatchResult = res.headers['content-type'].match(/charset=([^;]*)([;]+|$)/);
                if(encMatchResult !== null && encMatchResult.length > 1 && encMatchResult[1].toLowerCase().indexOf('utf') < 0) {
                    content_type = encMatchResult[1].toLowerCase();
                    res.setEncoding('binary');
                }

            }

            res.on('data', function (chunk) {
                if(content_type) {
                    chunk = encoder(content_type).toUTF8(chunk);
                }
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