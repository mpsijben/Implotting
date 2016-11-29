const DirectionStart = {"LEFT":0, "RIGHT":1};

const AlignHorizontal = {"CENTER":0, "LEFT":1, "RIGHT":2};
const AlignVertical = {"MIDDLE":0, "TOP":1, "BOTTOM":2};

const HeaderPos = {"TOP":1, "LEFT":2, "RIGHT":4, "BOTTOM":8, "ALL":15};
const HeaderType = {"X":0, "Y":1};

const RatioType = {"ORIGIN":0, "ASPECT":1, "WIDTH":2, "HEIGHT":3};
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

var addEvent = function(object, type, callback) {
    if (object == null || typeof(object) == 'undefined') return;
    if (object.addEventListener) {
        object.addEventListener(type, callback, false);
    } else if (object.attachEvent) {
        object.attachEvent("on" + type, callback);
    } else {
        object["on"+type] = callback;
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
        cssBox = document.createElement('span');
        cssBox.id = "textLength";
        textContainer.appendChild(cssBox);
        document.body.appendChild(textContainer);
    }

    cssBox.style.fontSize = settings.fontSize;
    cssBox.style.fontFamily = settings.fontFamily;
    cssBox.style.fontWeight = settings.fontWeight;

    textContainer.style.height = (settings.fontSize + 90) + 'px';
    
    cssBox.innerHTML = this;

    return {    width:          cssBox.offsetWidth,
                height:         cssBox.offsetHeight,
                baseLineHeight: Math.abs(cssBox.offsetTop - textContainer.offsetHeight - textContainer.offsetTop)
    };
};

String.prototype.truncate = function(_settings) {
    var settings = _settings || DefaultGlobal.getSettings().text;

    var truncated = this;
    var dotsWidth = "...".textSize(settings).width;
    var index = settings.truncate.direction == DirectionStart.LEFT ? 1 : 0;
    var didTruncate = false;

    while (truncated.textSize(settings).width + dotsWidth > settings.truncate.lenght && truncated.length > 0) {
        truncated = truncated.substring(0+index, truncated.length-1+index);
        didTruncate = true;
    }

    if(didTruncate){
        truncated = index ? "..." + truncated : truncated + "...";
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
        truncated = truncated.isTruncated(true);
        if(wordSplits.length == 1){
            truncated = wordSplits[0].truncate(settings);
            break;
        }
        else{
            wordSplits.splice(index, 1);
            truncated = wordSplits.join(" ");
        }
        
    }
    return truncated;
};

//--------ImGraph class
ImGraph = function(_width, _height) {
    var settings = new Settings();
    var data = new Data();
    this.headerManager = new HeaderManager(settings, data, this);
    this.nodeManager = new NodeManager(settings, data, this);

    var width = _width;
    var height = _height;

    var canvas = document.getElementsByClassName('implotting-canvas')[0];
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";

    this.svg = d3.select('.implotting-canvas').append('svg').style("width", width).style("height", height);
    
    var autoResizeSettings = settings.getGlobal().autoResize;
    if(_height-window.innerHeight<1){
        unloadScrollBars();
    }
    this.getGlobalSettings = function() {
        return settings.getGlobal();
    };

    this.setGlobalSettings = function(_settings) {
        var globalSettings = settings.setGlobal(_settings);
        autoResizeSettings = globalSettings.autoResize;

        return globalSettings;
    };


    this.layout = function() {
        this.headerManager.layout();
        this.nodeManager.layout();
    }.bind(this);

   
    var resize = (function () {
        var container = d3.select('.implotting-canvas');
        var svgWidthFullNumber = container.node().clientWidth;
        var svgHeightFullNumber = container.node().clientHeight;
        var originalWidth = window.innerWidth;
        var originalHeight = window.innerHeight;

        addEvent(window, "resize", function(e) { 
            if(!autoResizeSettings.enable) return;

            var newWidth = window.innerWidth;
            var newHeight = window.innerHeight;
            resize(originalWidth, newWidth, originalHeight, newHeight);
            originalWidth = newWidth;
            originalHeight = newHeight;
        }.bind(this));
        setTimeout(
            function() {
                resize(window.innerWidth, window.innerWidth, window.innerHeight, window.innerHeight);
            }, 1);
        

        return function(_originalWidth, _newWidth, _originalHeight, _newHeight) {
            if(autoResizeSettings.type == RatioType.ASPECT){
                var mainDimensions = autoResizeSettings.aspectRatio.x < autoResizeSettings.aspectRatio.y ? 1 : 0;
            }
            var resizeWidth = container.node().clientWidth;
            var resizeHeight = container.node().clientHeight;
            
            var orderResize = [];
            var svgWidthFull = svgWidthFullNumber;
            var svgHeightFull = svgHeightFullNumber;
            orderResize[0] = function(_aspectRatio){
                if(autoResizeSettings.type != RatioType.HEIGHT){
                    var minimalWidth = this.headerManager.getMinimalSizeType(HeaderType.X);
                    if(_aspectRatio){
                        var ratio = (autoResizeSettings.aspectRatio.y/autoResizeSettings.aspectRatio.x);
                        svgWidthFullNumber = svgHeightFull/ratio;
                        resizeWidth = Math.round(svgWidthFullNumber);
                        if(minimalWidth > resizeWidth){
                            resizeWidth = minimalWidth;
                            resizeHeight = resizeWidth*ratio;
                        }
                    } else {
                        var xDelta = _originalWidth - _newWidth;
                        xDelta = svgWidthFullNumber/(_originalWidth/xDelta);

                        svgWidthFullNumber = svgWidthFullNumber - xDelta;
                        resizeWidth = Math.round(svgWidthFullNumber);
                        resizeWidth =  minimalWidth > resizeWidth ? minimalWidth : resizeWidth;
                        svgWidthFull = minimalWidth > svgWidthFullNumber ? minimalWidth : svgWidthFullNumber;
                    }
                }
            }.bind(this);
            orderResize[1] = function(_aspectRatio){
                if(autoResizeSettings.type != RatioType.WIDTH){
                    var minimalHeight = this.headerManager.getMinimalSizeType(HeaderType.Y);
                    if(_aspectRatio){
                        var ratio = (autoResizeSettings.aspectRatio.x/autoResizeSettings.aspectRatio.y);
                        svgHeightFullNumber = svgWidthFull/ratio;
                        resizeHeight = Math.round(svgHeightFullNumber);
                        if(minimalHeight > resizeHeight){
                            resizeHeight = minimalHeight;
                            resizeWidth = resizeHeight*ratio;
                        }
                    } else {
                        var yDelta = _originalHeight - _newHeight;
                        yDelta = svgHeightFullNumber/(_originalHeight/yDelta);
                        svgHeightFullNumber = svgHeightFullNumber - yDelta;
                        resizeHeight = Math.round(svgHeightFullNumber);
                        resizeHeight =  minimalHeight > resizeHeight ? minimalHeight : resizeHeight;
                        svgHeightFull = minimalHeight > svgHeightFullNumber ? minimalHeight : svgHeightFullNumber;
                    }
                }
            }.bind(this);
            
            if(autoResizeSettings.type == RatioType.ASPECT){
                orderResize[mainDimensions]();
                orderResize[1 - mainDimensions](true);
            } else {
                orderResize.forEach(function(value, key, arr){
                    arr[key]();
                });
            }
            
            this.svg.remove();
            canvas.style.width = resizeWidth + "px";
            canvas.style.height = resizeHeight + "px";
            this.svg = d3.select('.implotting-canvas').append('svg').style("width", resizeWidth).style("height", resizeHeight);
            
            this.setGlobalSettings({size:{width:resizeWidth,height:resizeHeight}});
            this.layout();

        }.bind(this);
    }.bind(this))();

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
        text:{fontWeight:400,fontSize:16,fontFamily:"Time New Roman"},
        autoResize: { enable:false, type:RatioType.ORIGIN, aspectRatio:{x:16, y:9}},
        gridLine:{enable:false, color:"black", width:1, dashedLines:0}
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
    var global = {
    };
    
    var header = {};
    header.global = {
        alignment: AlignHorizontal.CENTER,
        verticalAlign: AlignVertical.TOP,
        text:{truncate:{ lenght:30, direction:DirectionStart.LEFT, enable:true}}
    };
    header.x = {
        size:{width:"max", height:40},
        gridLine:{enable:true, color:"black", width:1, dashedLines:5}
    };
    header[HeaderPos.TOP] = {};
    header[HeaderPos.BOTTOM] = {};
    header.y = {
        size:{width:80, height:"max"},
        gridLine:{enable:true, color:"black", width:1, dashedLines:10}
    };
    header[HeaderPos.LEFT] = {};
    header[HeaderPos.RIGHT] = {};

    var getHeadercache = {};
    var resetHeaderCache = function(){
        getHeadercache.forEach(function(value, key, arr){
            arr[key] = null;
        });
    };

    var node = {};
    node.global = {
        alignment: AlignHorizontal.CENTER,
        verticalAlign: AlignVertical.MIDDLE,
        size:{width:10, height:"50%"},
    };

    var getNodecache = null;
  
    this.setGlobal = function(_settings) {
        global = global.merge(_settings);
        resetHeaderCache();
        getNodecache = null;
        return this.getGlobal();
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

    this.setNode = function(_settings) {
        node.global = node.global.merge(_settings);
        getNodecache = null;
        return node.global
    }.bind(this);
    
    this.getGlobal = function() {
        return DefaultGlobal.mergeSettings(global);
    }.bind(this);
    
    this.getHeader = function(_headerPos) {
        if (getHeadercache[_headerPos] == null){
            var typeSetting = Boolean(_headerPos & (HeaderPos.LEFT | HeaderPos.RIGHT)) ? header.y : header.x;
            getHeadercache[_headerPos] = DefaultGlobal.mergeSettings(global.merge(header.global.merge(typeSetting.merge(header[_headerPos]))));
        }
        return getHeadercache[_headerPos];
    }.bind(this);

    this.getHeaderType = function(_headerType) {
        var headerType = _headerType ? (HeaderType.length()>_headerType ? _headerType : 0) : 0;
        var keyName = Object.keys(HeaderType)[headerType].toLowerCase();

        if (getHeadercache[keyName] == null){
            getHeadercache[keyName] = DefaultGlobal.mergeSettings(global.merge(header.global.merge(header[keyName])));
        }
        return getHeadercache[keyName];
    }.bind(this);

    this.getNode = function() {
        if (getNodecache == null){
            getNodecache = DefaultGlobal.mergeSettings(global.merge(node.global));
        }
        return getNodecache;
    }.bind(this);
};

//--------Data class
var Data = function(_imGraph) {
    var imGraph = _imGraph;
    var header = {};
    header.x = {};
    header.x.labels = [];
    header.x.lines = [];
    header.x.title = "default X";
    header.y = {};
    header.y.labels = [];
    header.y.lines = [];
    header.y.title = "default Y";
    
    var nodes = [];

    var links = {};
    
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

    this.addNodes = function(_data) {
        if (_data.lenght == 0) return;

        _data.forEach(function(value, key, arr){
            nodes.push(new Node(value, imGraph));
        });
        return nodes;
    };

    this.getNodes = function() {
         return nodes;
    };

    this.addLinks = function(_links) {
        if (_links.lenght == 0) return;
        links = _links;
    };

    this.getLinks = function() {
         return links;
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

    this.getSettingsType = function(_headerType) {
        return settings.getHeaderType(_headerType);
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

    this.getMinimalSizeType = function(_headerType) {
        var headersTypes = {
            [HeaderType.X]:[HeaderPos.TOP, HeaderPos.BOTTOM],
            [HeaderType.Y]:[HeaderPos.LEFT, HeaderPos.RIGHT]
        };  
        var minimalSize = 0;
        headersTypes[_headerType].forEach(function(value, key, arr){
             tempMinSize = this.getMinimalSizePos(value);
             if(minimalSize == 0 || minimalSize>tempMinSize){
                minimalSize = tempMinSize;
             }
        }.bind(this));
        return minimalSize;
    }.bind(this);

    this.getMinimalSizePos = function(_headerPos) {
        var headerType = +Boolean(_headerPos & (HeaderPos.LEFT | HeaderPos.RIGHT)) || 0;

        var tempSettings = this.getSettings(_headerPos);
        var padding = tempSettings.padding;

        var count = data.getHeader(headerType).labels.length;
        var NumberOfPaddings = count-1;

        var paddingStart = headerType == HeaderType.X ? padding.left : padding.top;
        var paddingEnd = headerType == HeaderType.X ? padding.right : padding.bottom;

        var sidesHeadersSize= this.getOtherTypesWidth(headerType == HeaderType.X);
        var minLabelsSize = count *  (headerType == HeaderType.X  ? ("...".textSize(tempSettings.text).width) : ("J".textSize(tempSettings.text).height));
        return sidesHeadersSize.start + sidesHeadersSize.end + minLabelsSize + paddingStart + paddingStart*NumberOfPaddings*0.5 + paddingEnd + paddingEnd*NumberOfPaddings*0.5 + sidesHeadersSize.lines.total; 
    }.bind(this);

    this.layout = function() {        
        headers.forEach(function(value, key, arr){
            header = arr[key];
            header.preLayout();
            posWidths[header.pos] = header.getLowestSide();
        });
    
        headers.forEach(function(value, key, arr){
            arr[key].layout();
        });

        gridLineLayout();
        
    }.bind(this);

    var gridLineLayout = function() {
        var globalSettings = _imGraph.getGlobalSettings();
        
        HeaderType.forEach(function(typeValue, typeKey, typeArr){
            var _data = this.getData(typeValue);
            var isXHeader = typeArr[typeKey] == HeaderType.X;
            var headerTypeSettings = this.getSettingsType(typeArr[typeKey]);
            if (!(headerTypeSettings.gridLine.enable)){
                return;
            }
            var firstRun = true;
            _data.labels.forEach(function(value, key, arr){
                var label = arr[key];
                var newAdded = true;
                while(firstRun || newAdded){
                    line = {};
                    if(isXHeader){
                        var widthHeight = firstRun ? -headerTypeSettings.gridLine.width*0.5: label.width()+headerTypeSettings.gridLine.width*0.5+1;
                        line["x1"] = label.x()+widthHeight;
                        line["y1"] = 0;
                        line["x2"] = label.x()+widthHeight;
                        line["y2"] = globalSettings.size.height;
                    } else {
                        var widthHeight = firstRun ? -headerTypeSettings.gridLine.width*0.5: label.height()+headerTypeSettings.gridLine.width*0.5+1;
                        line["x1"] = 0
                        line["y1"] = label.y()+widthHeight;
                        line["x2"] = globalSettings.size.width;
                        line["y2"] = label.y()+widthHeight;
                    }
                    line["color"] = headerTypeSettings.gridLine.color;
                    line["width"] = headerTypeSettings.gridLine.width;
                    line["dashedLines"] = headerTypeSettings.gridLine.dashedLines;
                    lines.push(line);
                    newAdded = firstRun;
                    firstRun=false;
                }
            }.bind(this));
        }.bind(this));
        var linesHeader = imGraph.svg.selectAll(".horizontalHeaderLines").data(lines).enter();

        linesHeader.append("line")
                          .attr("x1", function(line){ 
                                return line.x1;
                            })
                          .attr("y1", function(line){ 
                                return line.y1;
                            })
                         .attr("x2", function(line){ 
                                return line.x2;
                            })
                           .attr("y2", function(line){ 
                                return line.y2;
                            })
                           .style("stroke-dasharray",function(line){ 
                                return line.dashedLines;
                            })
                             .attr("stroke-width", function(line){ 
                                return line.width;
                            })
                             .attr("stroke", function(line){ 
                                return line.color;
                            });
    }.bind(this);

    this.getOtherTypesWidth = function(_isXHeader) {
        var lines = 0;
        var typeValue = _isXHeader ? HeaderType.X : HeaderType.Y;
        var _data = this.getData(typeValue);
        var headerTypeSettings = this.getSettingsType(typeValue);
        if (headerTypeSettings.gridLine.enable){
            lines = (_data.labels.length +1) * headerTypeSettings.gridLine.width;
        }

        return {
            start   : posWidths[_isXHeader ? HeaderPos.LEFT : HeaderPos.TOP],
            end     : posWidths[_isXHeader ? HeaderPos.RIGHT : HeaderPos.BOTTOM],
            lines   : {width:headerTypeSettings.gridLine.width, total:lines}
        };
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
        this.width = this.settings.size.width == "max" ? this.globalSettings.size.width : this.settings.size.width;
        this.height = this.settings.size.height == "max" ? this.globalSettings.size.height : this.settings.size.height;
        this.combineSettings = {
            settings:this.settings,
            globalSettings:this.globalSettings,
            width:this.width,
            height:this.height,
            headerPos:this.pos,
            isXHeader:isXHeader,
            type:type
        };
    }.bind(this);
    this.preLayout();
    

    this.layout = function(){
        var data = imGraph.headerManager.getData(type);
        if (data.length < 1) return;
        
        var count = data.labels.length;
        
        var totalWidth = this.settings.size.width == "max" ? this.globalSettings.size.width : this.settings.size.width;
        var totalHeight = this.settings.size.height == "max" ? this.globalSettings.size.height : this.settings.size.height;
        
        var totalLongestSide = totalWidth > totalHeight ? totalWidth : totalHeight;
        
        var extraWidth = imGraph.headerManager.getOtherTypesWidth(isXHeader);

        var longest = totalLongestSide - extraWidth.start - extraWidth.end - extraWidth.lines.total - (count+1);
        var steps = (longest / count);
        
        var maxWidthlength = isXHeader ? steps : this.settings.size.width;
        
        var width = isXHeader ? steps : totalWidth;
        var height = isXHeader ? totalHeight : steps;
        
        var headerWidth = getLowestSizePos(); 
        
        var textSettings = this.settings.text.clone();

        var oneOrMoreTruncated = false;
        var smallestLabelWidth = steps;

        lines = [];
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
            label[x](steps*key + extraWidth.start + (key+1) +  extraWidth.lines.width*(key+1));
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
            label.horizontalAlign(this.settings.alignment, this.settings.padding);
            label.verticalAlign(this.settings.verticalAlign, this.settings.padding);
        }.bind(this));
        
        addDataToSvg(data.labels, lines);
    }.bind(this);
    
    var getLowestSizePos = function() {
        var side = isXHeader ? this.globalSettings.size.height : this.globalSettings.size.width;
        var lowestSide = this.getLowestSide();
        return (isTopLeftHeader ? 0: side - lowestSide);
    }.bind(this);
    
    this.getLowestSide = function(){
        return this.width < this.height ? this.width : this.height;
    }.bind(this);

    var addDataToSvg = function(_data, _lines) {

        var headerBar = imGraph.svg.selectAll(".horizontalHeader").data(_data).enter();

        headerBar.append("text").style("fill", "#1976D2").style("font-weight", 400).attr("y", function(label){ 
                    return label.yLayout();
                }).attr("x", function(label) {
                   return label.xLayout();
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
        var padding = _padding || imGraph.getGlobalSettings().padding;
        var textSize = this.textSize();

        var middle = (width-(padding.left+padding.right)-textSize.width);
        var total = padding.left;

        if(_alignment == AlignHorizontal.RIGHT){
            total += middle;
        }else if (_alignment == AlignHorizontal.CENTER){
            total += middle/2;
        }
        horizontalAlign = total;
        return this;
    };
    
    this.verticalAlign = function(_alignment, _padding) {
        var padding = _padding || imGraph.getGlobalSettings().padding;
        var textSize = this.textSize();
        var middle = height-(padding.top+padding.bottom) - textSize.height;
        var total = padding.top + textSize.baseLineHeight;

        if(_alignment == AlignVertical.BOTTOM){
            total += middle;
        }else if (_alignment == AlignVertical.MIDDLE){
            total += middle/2;
        }
        verticalAlign = Math.floor(total);
        return this;
    };
    this.x = function(_x) {
        if (!arguments.length) return x;
        x = _x;
        return this;
    };

    this.y = function(_y) {
        if (!arguments.length){ return y}
        y = _y;
        return this;
    };
    
    this.xLayout = function(_x) {
        if (!arguments.length) return x + horizontalAlign;
        x = _x;
        return this;
    };
    
    this.yLayout = function(_y) {
        if (!arguments.length){ return y + verticalAlign;}
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


//--------NodeManager class
var NodeManager = function(_settings, _data, _imGraph) {
    var settings = _settings;
    var data = _data;
    var imGraph = _imGraph;


    this.setSettings = function(_settings) {
        return settings.setNode(_settings);
    }

    this.getSettings = function() {
        return settings.getNode();
    }

    this.addData = function(_data) {
        return data.addNodes(_data);
    }

    this.getData = function() {
        return data.getNodes();
    }

    this.addLinks = function(_links) {
        return data.addLinks(_links);
    }

    this.getLinks = function() {
        return data.getLinks();
    }

    this.link = function() {
        var curvature = .5;
        function link(a) {
            var c = a.source.xLayout() + a.source.innerWidth
              , d = a.target.xLayout()
              , e = d3.interpolateNumber(c, d)
              , f = e(curvature)
              , g = e(1 - curvature)
              , h = a.source.yLayout()
              , i = a.target.yLayout()
              , j = "M " + c + "," + h + " C " + f + ", " + h + " " + g + ", " + i + " " + d + ", " + i + " L " + d + ", " + (i + a.target.innerHeight) + " C " + f + ", " + (i + a.target.innerHeight) + " " + f + ", " + (h + a.source.innerHeight) + " " + c + ", " + (h + a.source.innerHeight) + " L " + c + "," + h;
            return j
        }

        link.curvature = function(_curvature) {
          if (!arguments.length) return curvature;
          curvature = +_curvature;
          return link;
        };
        return link;
    };

    var getTargets = function(_node, _nodes) {
        var targets = [];

        var xPos = Number.MAX_VALUE;

        _nodes.forEach(function(nodeValue, nodeKey, nodeArr) {
            var xHeaderPos = nodeArr[nodeKey].xHeaderPos;

            if(_node.xHeaderPos < xHeaderPos && nodeArr[nodeKey].category.id == _node.category.id && xHeaderPos < xPos){
                xPos = xHeaderPos;
            }
        });
        xPos = xPos == Number.MAX_VALUE ? -1 : xPos;
        if (xPos == -1) return targets; 
        _nodes.forEach(function(nodeValue, nodeKey, nodeArr) {
            var xHeaderPos = nodeArr[nodeKey].xHeaderPos;
            
            if(xHeaderPos == xPos && nodeArr[nodeKey].category.id == _node.category.id){
                targets.push(nodeArr[nodeKey]);
            }
        });

        return targets;
    };
    
    this.layout = function(){
        var nodes = this.getData();
        var dataX = imGraph.headerManager.getData(0);
        var dataY = imGraph.headerManager.getData(1);
        
        var nodeSettings = this.getSettings();

        var innerHeight;

        var links = [];
        var multi = {};
        nodes.forEach(function(nodeValue, nodeKey, nodeArr) {
            var node = nodeArr[nodeKey];
            var xLabel = dataX.labels[node.xHeaderPos];
            var yLabel = dataY.labels[node.yHeaderPos];
            node.x = xLabel.x();
            node.y = yLabel.y();//
            node.width = xLabel.width();
            node.height = yLabel.height();
            node.innerWidth = (Object.prototype.toString.call(nodeSettings.size.width) === '[object String]') ? parseInt(nodeSettings.size.width.slice(0, -1))*node.width/100 : nodeSettings.size.width;
            node.innerHeight = (Object.prototype.toString.call(nodeSettings.size.height) === '[object String]') ? parseInt(nodeSettings.size.height.slice(0, -1))*node.height/100 : nodeSettings.size.height;
            innerHeight = node.innerHeight;
            var targets = getTargets(node, nodes);
            targets.forEach(function(value, key, arr) {
                var link = new Link(node, arr[key]);
                links.push(link);
            });
            node.horizontalAlign(nodeSettings.alignment, nodeSettings.padding);
            node.verticalAlign(nodeSettings.verticalAlign, nodeSettings.padding);
            
            if(multi[node.xHeaderPos] == null) { multi[node.xHeaderPos] = {};}
            if(multi[node.xHeaderPos][node.yHeaderPos] == null) { multi[node.xHeaderPos][node.yHeaderPos] = [];}
            multi[node.xHeaderPos][node.yHeaderPos].push(node);

            nodeArr[nodeKey] = node;
        });
        
        multi.forEach(function(value, key, arr){
            arr[key].forEach(function(yValue, yKey, yArr){
                yArr[yKey].forEach(function(nodeValue, nodeKey, nodeArr){
                    if(yArr[yKey].length > 1){
                        var node = nodeArr[nodeKey];
                        node.innerHeight = innerHeight/yArr[yKey].length;
                        node.y = node.y + node.innerHeight*nodeKey;
                    }
                });
                
            });
        });

        imGraph.svg.append("g").selectAll(".link").data(links).enter().append("path").attr("class", function(a) {
            return "link " + a.source.category.id;
        }).attr("d", this.link()).style("fill", function(a) {
            return "000";
        }).style("fill-opacity", 0).style("stroke", function(a) {
            return  "000";
        }).style("stroke-width",0.4).style("stroke-opacity", 0.2);

        var nodes = imGraph.svg.append("g").selectAll(".node").data(nodes).enter().append("g").attr("class", "node").attr("transform", function(a) {
                    return "translate(" + a.xLayout() + "," + a.yLayout() + ")";
                }); 
        
        nodes.append("rect").attr("class", function(a) {
                return "product" + a.category.id;
            }).attr("height", function(a) {
                return a.innerHeight;
            }).attr("width", function(a) {
                return a.innerWidth;
            }).style("fill", function(a) {
                return a.color;
            }).style("fill-opacity", function(a) {
                return 8;
            }).style("stroke", function(a) {
                return a.color;
            }).style("stroke-opacity", 0);
        
    };

};

//--------Node class
var Node = function(_structure, _imGraph) {
    var imGraph = _imGraph;
    this.category = {
        id:_structure.id,
        name:_structure.name
    };
    this.xHeaderPos = _structure.xHeaderPos;
    this.yHeaderPos = _structure.yHeaderPos;
    this.x = 40;
    this.y = 40;
    this.width = 40;
    this.height = 40;
    this.innerWidth = 10;
    this.innerHeight = 50;
    this.color = _structure.color;

    var horizontalAlign = 0;
    var verticalAlign = 0;

    this.horizontalAlign = function(_alignment, _padding) {
        var padding = _padding || imGraph.getGlobalSettings().padding;

        var middle = (this.width-(padding.left+padding.right)-this.innerWidth);
 
        var total = padding.left;
        
        if(_alignment == AlignHorizontal.RIGHT){
            total += middle;
        }else if (_alignment == AlignHorizontal.CENTER){
            total += middle/2;
        }
        horizontalAlign = total;
        return this;
    };

    this.verticalAlign = function(_alignment, _padding) {
        var padding = _padding || imGraph.getGlobalSettings().padding;
        var textSize = "J".textSize();
        
        var middle = this.height-(padding.top+padding.bottom)-this.innerHeight;
        var total = padding.top;

        if(_alignment == AlignVertical.BOTTOM){
            total += middle;
        }else if (_alignment == AlignVertical.MIDDLE){
            total += middle/2;
        }
        verticalAlign = total;

        return this;
    };

    this.xLayout = function() {
        return this.x + horizontalAlign;
    };
    
    this.yLayout = function() {
        return this.y + verticalAlign;
    };
};

//--------Link class
var Link = function(_source, _target) {
    this.source = _source;
    this.target = _target;

};