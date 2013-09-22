// found this from stackoverflow
// http://stackoverflow.com/a/281335/210391
Array.prototype.clean = function(deleteValue) {
  for (var i = 0; i < this.length; i++) {
    if (this[i] == deleteValue) {
      this.splice(i, 1);
      i--;
    }
  }
  return this;
};

(function () {
    /* jslint node: true */
    'use strict';

    var url = require('url'),
        htmlParser = require('htmlparser'),
        http = require('http'),
        async = require('async'),
        domSelector = require('./dom-selector'),
        encoder = require('turkish-char-encoding'),
        mvArray = [];

        async.timesSeries(24, function (n, next) {
            var req, urlHandler, urlParser,
            link = 'http://www.tbmm.gov.tr/develop/owa/milletvekillerimiz_sd.mv_liste?p_donem_kodu=' + (n + 1),
            reqOptions = url.parse(link);

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

                    if(regNo in mvArray) {
                        // console.log(regNo + ': ' + name + ' was added before');
                    }
                    else {
                        mvArray[regNo] = {
                            "sicil": regNo,
                            "isim": name,
                            "donem": (n + 1)
                         };
                    }
                });

                console.log('found ' + mvList.length + ' results for ' + (n + 1));
                next();
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
        }, function (err) {
            if(err) {
                throw err;
            }

            mvArray.clean(undefined);

            console.log('a total of ' + mvArray.length + ' records');
            console.log(JSON.stringify(mvArray, null, ' '));
        });
})();