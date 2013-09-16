module.exports = function () {
    var _tempRes, _result;

    var _recursiveAny = function (items, tag, options) {
        if(items === null || items === undefined) {
            return;
        }

        items.forEach(function (item) {
            if(item.name === tag) {
                if('class' in options) {
                    if(item.attribs.class === options.class) {
                        _tempRes.push(item);
                    }
                }
                else {
                    _tempRes.push(item);
                }
            }

            _recursiveAny(item.children, tag, options);
        });
    };

    var _start = function (dom) {
        this._result = dom;
        return this;
    };

    var _any = function (tag, options) {
        _tempRes = [];
        options = options || {};

        _recursiveAny(this._result, tag, options);
        
        _result = _tempRes;

        return this;
    };

    var _end = function () {
        this._tempRes = [];
        return _result;
    };

    return {
        start: _start,
        any: _any,
        end: _end
    };
}();