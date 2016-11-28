const DirectionStart = {"LEFT":0, "RIGHT":1};

const AlignHorizontal = {"CENTER":0, "LEFT":1, "RIGHT":2};
const AlignVertical = {"MIDDLE":0, "TOP":1, "BOTTOM":2};

const HeaderPos = {"TOP":1, "LEFT":2, "RIGHT":4, "BOTTOM":8, "ALL":15};
const HeaderType = {"X":0, "Y":1};

//--------default functions
var assert = function(_condition, _message) {
    if (!_condition) {
        _message = _message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(_message);
        }
        throw _message;
    }
};

var unloadScrollBars = function () {
    document.documentElement.style.overflow = 'hidden';  // firefox, chrome
    document.body.scroll = "no"; // ie only
}

Object.prototype.merge = function(_obj) {
    return  extend(_obj, this.clone());
};

Object.prototype.clone = function() {
    return extend(this);
}

Object.prototype.length = function() {
    var length = 0;
    this.forEach(function(value, key, arr){
        length++;
    });
    return length;
}

extend = function (from, to){
    if (from == null || typeof from != "object") return from;
    if (from.constructor != Object && from.constructor != Array) return from;
    if (from.constructor == Date || from.constructor == RegExp || from.constructor == Function ||
        from.constructor == String || from.constructor == Number || from.constructor == Boolean)
        return new from.constructor(from);
    
    to = to || {}; 
    
    for (var name in from)
    {
        if (!from.hasOwnProperty(name)) continue;
        to[name] = extend(from[name], to[name]);
    }
    return to;
}


Object.prototype.forEach = function(f) {
    var object = this; 

    for (var key in object) {
        if (!object.hasOwnProperty(key)) continue;
        f(object[key], key, object);
    }
};

String.prototype.textSize = function(_settings) {
    var settings = _settings || DefaultGlobal.getSettings().text;

    var cssBox = document.getElementById("textLength");
    var textContainer = document.getElementById("textcontainer");

    if (textContainer == null || cssBox === null) {
        textContainer = document.createElement('div');
        textContainer.id = "textcontainer";
        document.body.appendChild(textContainer);

        cssBox = document.createElement('span');
        cssBox.id = "textLength";
        textContainer.appendChild(cssBox);
    }

    cssBox.style.fontSize = settings.fontSize;
    cssBox.style.fontFamily = settings.fontFamily;
    cssBox.style.fontWeight = settings.fontWeight;

    textContainer.style.height = (settings.fontSize + 30) + 'px';
    
    cssBox.innerHTML = this;
    
    return {    width:          cssBox.offsetWidth,
                height:         cssBox.offsetHeight,
                baseLineHeight: Math.abs(cssBox.offsetTop - textContainer.offsetHeight - textContainer.offsetTop)
    };
};

String.prototype.truncate = function(_settings) {
    var settings = _settings || DefaultGlobal.getSettings().text;
    var tmp = this;
    var truncated = this;

    while (truncated.textSize(settings).width > settings.truncate.lenght ) {
        index = settings.truncate.direction ==  DirectionStart.LEFT ? 1 : 0;
        tmp = tmp.substring(0+index, tmp.length-1+index);
        truncated = index ? "..." + tmp : tmp + "...";
    }
    return truncated;
};

String.prototype.truncated = false;
    
String.prototype.isTruncated= function(_value) {
    this.truncated = _value;
    return this;
};

String.prototype.truncateWord = function(_settings) {
    var settings = _settings || DefaultGlobal.getSettings().text;
    var tmp = this;
    var truncated = this;
    
    while (truncated.textSize(settings).width > settings.truncate.lenght) {
        var wordSplits = tmp.split(" ");
        index = settings.truncate.direction == DirectionStart.LEFT ? 0 : wordSplits.length-1;
        if(wordSplits.length == 1){
            truncated = wordSplits[0].truncate(settings);
        }
        else{
            wordSplits.splice(index, 1);
            truncated = wordSplits.join(" ");
        }
        truncated = truncated.isTruncated(true);
    }
    return truncated;
};

//--------ImGraph class
ImGraph = function(width, height) {
    var settings = new Settings();
    var data = new Data();
    this.svg = d3.select('.implotting-canvas').append('svg').attr("width", width).attr("height", height);
    this.headerManager = new HeaderManager(settings, data, this);

    unloadScrollBars();

    this.getGlobalSettings = function() {
        return settings.getGlobal();
    };

    this.setGlobalSettings = function(_settings) {
        return settings.setGlobal(_settings);
    };

    this.layout = function() {
        this.headerManager.layout();
    }.bind(this);

    
    this.setGlobalSettings({size:{width:width,height:height}});
};

//--------Default settings for all the Graphs 
DefaultGlobal = new function() {
    var settings = 
    { 
        padding:{
            top:5,
            right:5,
            bottom:5,
            left:5,
        },
        size:{width:0, height:0},
        text:{fontWeight:400,fontSize:16,fontFamily:"Time New Roman"}
    };

    this.getSettings = function(){
        return settings.clone();
    }

    this.mergeSettings = function(_settings){
        return settings.merge(_settings);
    }
};

//--------Settings class    (Default settings for current Graph(every ImGraph has his own setting))
var Settings = function() {
    var global = {};
    
    var header = {};
    header.global = {
        alignment: AlignHorizontal.CENTER,
        verticalAlign: AlignVertical.TOP,
        text:{truncate:{ lenght:30, direction:DirectionStart.LEFT, enable:true}}
    };
    header.x = {
        size:{width:"max", height:40},
    };
    header[HeaderPos.TOP] = {};
    header[HeaderPos.BOTTOM] = {};
    header.y = {
        size:{width:80, height:"max"},
    };
    header[HeaderPos.LEFT] = {};
    header[HeaderPos.RIGHT] = {};

    var getHeadercache = {};
    var resetHeaderCache = function(){
        getHeadercache.forEach(function(value, key, arr){
            arr[key] = null;
        });
    };
  
    this.setGlobal = function(_settings) {
        global = global.merge(_settings);
        resetHeaderCache();
    }.bind(this);

    this.setHeader = function(_settings, _headerPos) {
        maxNumber = Math.pow(2, HeaderPos.length()-1);
        var headerPos = _headerPos ? (maxNumber > _headerPos ? _headerPos : HeaderPos.ALL) : HeaderPos.ALL;
        
        if((headerPos & HeaderPos.ALL) == HeaderPos.ALL){
            header.global = header.global.merge(_settings);
        } else {
            var setSettingsFor = HeaderPos.clone();
            if((headerPos & (HeaderPos.LEFT | HeaderPos.RIGHT)) == (HeaderPos.LEFT | HeaderPos.RIGHT)){
                header.y = header.y.merge(_settings);
                delete setSettingsFor.LEFT;
                delete setSettingsFor.RIGHT;
            } else if((headerPos & (HeaderPos.TOP | HeaderPos.BOTTOM)) == (HeaderPos.TOP | HeaderPos.BOTTOM)){
                header.x = header.x.merge(_settings);
                delete setSettingsFor.TOP;
                delete setSettingsFor.BOTTOM;
            } 

            setSettingsFor.forEach(function(value, key, arr){
                if(headerPos & value && key != "ALL"){
                    header[value] = header[value].merge(_settings);
                }
            });
        }
        resetHeaderCache();
    }.bind(this);
    
    this.getGlobal = function() {
        return global;
    }.bind(this);
    
    this.getHeader = function(_headerPos) {
        if (getHeadercache[_headerPos] == null){
            var typeSetting = Boolean(_headerPos & (HeaderPos.LEFT | HeaderPos.RIGHT)) ? header.y : header.x;
            getHeadercache[_headerPos] = DefaultGlobal.mergeSettings(global.merge(header.global.merge(typeSetting.merge(header[_headerPos]))));
        }
        return getHeadercache[_headerPos];
    }.bind(this);
};

//--------Data class
var Data = function(_imGraph) {
    var imGraph = _imGraph;
    var header = {};
    header.x = {};
    header.x.labels = [];
    header.x.title = "default X";
    header.y = {};
    header.y.labels = [];
    header.y.title = "default Y";
    
    var nodes = {};
    
    this.addHeader = function(_data, _headerType) {
        if (_data.lenght == 0) return;
        
        var headerType = _headerType ? (HeaderType.length()>_headerType ? _headerType : 0) : 0;
        
        _data.forEach(function(value, key, arr){
            if(typeof(value) == "string"){
                arr[key] = new HeaderLabel(value, imGraph);
            } else {
                arr[key].setImGraph(imGraph);
            }
        });
        header[Object.keys(HeaderType)[headerType].toLowerCase()].labels = _data; 
    };
    
    this.getHeader = function(_headerType) {
         var headerType = _headerType ? (HeaderType.length()>_headerType ? _headerType : 0) : 0;
         return header[Object.keys(HeaderType)[headerType].toLowerCase()];
    };
};

//--------HeaderManager class
var HeaderManager = function(_settings, _data, _imGraph) {
    var imGraph = _imGraph;
    var headers = {};
    var sizeHeaders = [];
    var posWidths = [];

    var settings = _settings;
    var data = _data;
    
    HeaderPos.forEach(function(value){
        posWidths[value] = 0;
    });
    
    var ecexuteFunctionForHeaders = function(_headerPos, _func) {
        if (!(_func) || !({}.toString.call(_func) === '[object Function]')) return;

        maxNumber = Math.pow(2, HeaderPos.length()-1);
        var headerPos = _headerPos ? (maxNumber > _headerPos ? _headerPos : 1) : 1;

        HeaderPos.forEach(function(value, key, arr){
            if(headerPos & value && key != "ALL"){
                _func(value);
            }
        });
    };
    
    this.addHeader = function(_headerPos) {
        ecexuteFunctionForHeaders(_headerPos, function(value){
            if(!headers[value]){
                headers[value] = new Header(value, imGraph);
            }  
        });
    };
    
    this.removeHeader = function(_headerPos) {
        ecexuteFunctionForHeaders(_headerPos, function(value){
            delete headers[value]; 
        });
    };
    
    this.getSettings = function(_headerPos) {
        return settings.getHeader(_headerPos);
    };

    this.setSettings = function(_settings, _headerPos) {
        settings.setHeader(_settings, _headerPos);
    };

    this.addData = function(_data, _headerType) {
        data.addHeader(_data, _headerType);
    };

    this.getData = function(_headerType) {
        return data.getHeader(_headerType);
    };
    
    this.layout = function() {        
        headers.forEach(function(value, key, arr){
            header = arr[key];
            header.preLayout();
            posWidths[header.pos] = header.getLowestSide();
        });
    
        headers.forEach(function(value, key, arr){
            arr[key].layout(posWidths);
        });
    };
    
    this.getOtherTypesWidth = function(_isXHeader) {
        extraWidth = {}
        extraWidth.start = posWidths[_isXHeader ? HeaderPos.LEFT : HeaderPos.TOP];
        extraWidth.end = posWidths[_isXHeader ? HeaderPos.RIGHT : HeaderPos.BOTTOM];
        return extraWidth;
    };
}

//--------Header class
var Header = function(_headerPos, _imGraph) {
    var imGraph = _imGraph;
    this.pos = _headerPos;

    var info = {};
    var isXHeader = !Boolean(this.pos & (HeaderPos.LEFT | HeaderPos.RIGHT));
    var isTopLeftHeader = !Boolean(this.pos & (HeaderPos.RIGHT | HeaderPos.BOTTOM));
    var type = +!isXHeader;
    
    var headerTypeKeys = Object.keys(HeaderType);
    var x = headerTypeKeys[type].toLowerCase();
    var y = headerTypeKeys[1 - type].toLowerCase();
    

    this.preLayout = function(){
        this.settings = imGraph.headerManager.getSettings(this.pos);
        this.globalSettings = imGraph.getGlobalSettings();
        this.globalSize = this.globalSettings.size;
        this.width = this.settings.size.width == "max" ? this.globalSize.width : this.settings.size.width;
        this.height = this.settings.size.height == "max" ? this.globalSize.height : this.settings.size.height;
    }.bind(this);
    this.preLayout();
    
    this.layout = function(){
        var data = imGraph.headerManager.getData(type);
        if (data.length < 1) return;
        
        var count = data.labels.length;
        var NumberOfPaddings = count-1;
        
        var totalWidth = this.settings.size.width == "max" ? this.globalSize.width : this.settings.size.width;
        var totalHeight = this.settings.size.height == "max" ? this.globalSize.height : this.settings.size.height;
        
        var totalLongestSide = totalWidth > totalHeight ? totalWidth : totalHeight;
        
        var padding = this.settings.padding;
        
        var extraWidth = imGraph.headerManager.getOtherTypesWidth(isXHeader);
        
        var paddingStart = isXHeader ? padding.left : padding.top;
        var paddingEnd = isXHeader ? padding.right : padding.bottom;
       
        var longestSide = totalLongestSide - paddingStart - (paddingStart*NumberOfPaddings*0.5) - paddingEnd - (paddingEnd*NumberOfPaddings*0.5) - extraWidth.start - extraWidth.end;
        
        var steps = longestSide / count;
        
        var maxWidthlength = isXHeader ? steps : this.settings.size.width;
        
        var width = isXHeader ? steps : totalWidth;
        var height = isXHeader ? totalHeight : steps;
        
        var headerWidth = getLowestSizePos(); 
        
        var textSettings = this.settings.text.clone();

        var oneOrMoreTruncated = false;
        var smallestLabelWidth = steps;

        data.labels.forEach(function(value, key, array) {
            var label = array[key];
            label.setTextSettings(this.settings.text);
            var beforeTruncateTextSize = label.textSize();

            textSettings.truncate.lenght = maxWidthlength;
            var text = label.text().truncateWord(textSettings);

            smallestLabelWidth = smallestLabelWidth > beforeTruncateTextSize.width ? beforeTruncateTextSize.width : smallestLabelWidth;
            if (text.truncated) {
                oneOrMoreTruncated = true;
            }
            
            label.text(text);
            
            label[x](paddingStart + paddingStart*(key)*0.5 + paddingEnd*(key)*0.5 + steps*key + extraWidth.start);
            label[y](headerWidth);
            
            label.width(width);
            label.height(height);
        }.bind(this));
        
        data.labels.forEach(function(value, key, array) {
            var label = array[key];
            if(this.settings.text.truncate.enable && oneOrMoreTruncated){
                textSettings.truncate.lenght = smallestLabelWidth-1;
                label.text(label.text().truncateWord(textSettings));
            }
            label.horizontalAlign(this.settings.alignment, padding);
            label.verticalAlign(this.settings.verticalAlign, padding);
        }.bind(this));
        
        addDataToSvg(data.labels);
    }.bind(this);
    
    var getLowestSizePos = function() {
        var side = isXHeader ? this.globalSize.height : this.globalSize.width;
        var lowestSide = this.getLowestSide();
        return (isTopLeftHeader ? 0: side - lowestSide);
    }.bind(this);
    
    this.getLowestSide = function(){
        return this.width < this.height ? this.width : this.height;
    }.bind(this);

    var addDataToSvg = function(_data) {
        var headerBar = imGraph.svg.selectAll(".horizontalHeader").data(_data).enter();
        
        headerBar.append("text").style("fill", "#1976D2").style("font-weight", 400).attr("y", function(label){ 
                    return label.y();
                }).attr("x", function(label) {
                   return label.x();
               }).text(function(label, key) {
                    return label.text();
            });
    }.bind(this);
};

//--------HeaderLabel class
HeaderLabel = function(text, _imGraph) {
    var text = text;
    var textSize = {};
    var horizontalAlign = 0;
    var verticalAlign = 0;
    var imGraph = _imGraph;
    var settings = {};
    
    var x = 0;
    var y = 0;
    
    var height = 50;
    var width = 100;

    this.setImGraph = function(_imGraph){
        imGraph = _imGraph;
    };

    this.setTextSettings = function(_settings){
        settings = _settings;
        textSize = {};
    };

    this.text = function(_text) {
        if (!arguments.length) return text;
        text = _text;
        textSize = {};
        return this;
    };
    
    this.textSize = function() {
        if(textSize.width == null || textSize.height == null){
            textSize = text.textSize(settings);  
        }
        return textSize;
    };
    
    this.horizontalAlign = function(_alignment, _padding) {
        var padding = _padding || ImGraph.getGlobalSettings().padding;
        var textSize = this.textSize();

        var middle = (width-(padding.left+padding.right)-textSize.width);
 
        var total = padding.left;
        
        if(_alignment == AlignHorizontal.RIGHT){
            total = middle;
        }else if (_alignment == AlignHorizontal.CENTER){
            total = middle/2;
        }
        horizontalAlign = total;
        return this;
    };
    
    this.verticalAlign = function(_alignment, _padding) {
        var padding = _padding || ImGraph.getGlobalSettings().padding;
        var textSize = this.textSize();
        
        var middle = height-(padding.top+padding.bottom)-textSize.height;
        var total = padding.top + textSize.baseLineHeight;
        if(_alignment == AlignVertical.BOTTOM){
            total += middle;
        }else if (_alignment == AlignVertical.MIDDLE){
            total += middle/2;
        }
        verticalAlign = total;
        return this;
    };
    
    this.x = function(_x) {
        if (!arguments.length) return x + horizontalAlign;
        x = _x;
        return this;
    };
    
    this.y = function(_y) {
        if (!arguments.length) return y + verticalAlign;
        y = _y;
        return this;
    };
    
    this.width = function(_width) {
        if (!arguments.length) return width;
        width = _width;
        return this;
    };
    
    this.height = function(_height) {
        if (!arguments.length) return height;
        height = _height;
        return this;
    };
};
