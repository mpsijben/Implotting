headerOrientationEnum = {"top":1, "left":2};

const DirectionStart = {"LEFT":0, "RIGHT":1};

const AlignHorizontal = {"CENTER":0, "LEFT":1, "RIGHT":2};
const AlignVertical = {"MIDDLE":0, "TOP":1, "BOTTOM":2};

const HeaderPos = {"TOP":1, "LEFT":2, "RIGHT":4, "BOTTOM":8};
const HeaderType = {"X":0, "Y":1};

var svg;

//--------default functions
assert = function(_condition, _message) {
    if (!_condition) {
        _message = _message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(_message);
        }
        throw _message;
    }
};

getHeaderInfo = function(_headerPos) {
    info = {};
    
    info.isXHeader = _headerPos != HeaderPos.LEFT && _headerPos != HeaderPos.RIGHT;
    info.isTopLeftHeader = _headerPos != HeaderPos.RIGHT && _headerPos != HeaderPos.BOTTOM;
    info.headerType = +!info.isXHeader;
    
    headerTypeKeys = Object.keys(HeaderType);
    info.x = headerTypeKeys[info.headerType].toLowerCase();
    info.y = headerTypeKeys[1 - info.headerType].toLowerCase();
    return info;
};

Object.prototype.merge = function(_options) {
    return  extend(_options, this.clone());
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


var extend = function (from, to){
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
    
    return object;
};

String.prototype.textSize = function(_fontWeight,_fontSize, _fontFamily) {
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
    var defaultSize = window.getComputedStyle(cssBox, null).getPropertyValue('font-size');
    var defaultFamily = window.getComputedStyle(cssBox, null).getPropertyValue('font-family');
    
    var fontSize = parseInt(_fontSize || defaultSize, 10);
    cssBox.style.fontSize = fontSize;
    cssBox.style.fontFamily = _fontFamily || defaultFamily;
    cssBox.style.fontWeight = _fontWeight || 400;
    
    textContainer.style.height = (fontSize + 30) + 'px';
    
    cssBox.innerHTML = this;
    
    returns = {};
    returns.width = cssBox.offsetWidth;
    returns.height = cssBox.offsetHeight;
    returns.baseLineHeight = Math.abs(cssBox.offsetTop - textContainer.offsetHeight - textContainer.offsetTop);
    
    return returns;
};

String.prototype.truncate = function(_options) {
    var options = Options.truncate(_options);
    
    var tmp = this;
    var truncated = this;
    while (truncated.textSize(options.fontWeight).width > options.lenght ) {
        index = options.direction ==  DirectionStart.LEFT ? 1 : 0;
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

String.prototype.truncateWord = function(_options) {
    var options = Options.truncate(_options);
    var tmp = this;
    var truncated = this;
    
    while (truncated.textSize(options.fontWeight).width > options.lenght) {
        var wordSplits = tmp.split(" ");
        index = options.direction == DirectionStart.LEFT ? 0 : wordSplits.length-1;
        if(wordSplits.length == 1){
            truncated = wordSplits[0].truncate(options);
        }
        else{
            wordSplits.splice(index, 1);
            truncated = wordSplits.join(" ");
        }
        truncated = truncated.isTruncated(true);
    }
    return truncated;
};

//--------Settings class
var Settings = function() {

    var global = {
        padding:{
            top:5,
            right:5,
            bottom:5,
            left:5,
        },
        size:{width:0, height:0}
    }
    
    var header = {};
    header.global = {
        alignment: AlignHorizontal.CENTER,
        verticalAlign: AlignVertical.TOP,
        truncateGroup:true
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
    
    this.setGlobal = function(_options) {
        global = global.merge(_options);
        resetHeaderCache();
    }.bind(this);

    this.setHeader = function(_options, _type) {
        var mergeOptions = _options;
        
        if(!isNaN(_type)){
            var typeSetting = _type != HeaderPos.LEFT && _type != HeaderPos.RIGHT ? header.x : header.y
            mergeOptions = typeSetting.merge(header[_type].merge(mergeOptions));
        }else if (_type == "x" || _type == "y"){
            mergeOptions = header[_type].merge(mergeOptions);
        }
        
        header[_type] = global.merge(header.global.merge(mergeOptions));
        resetHeaderCache();
    }.bind(this);
    
    this.getGlobal = function() {
        return global;
    }.bind(this);
    
    this.getHeader = function(_headerPos, _isXHeader) {
        if (getHeadercache[_headerPos] == null){
            var typeSetting = typeof _isXHeader === 'undefined' || _isXHeader === null || _isXHeader ? header.x : header.y;
            getHeadercache[_headerPos] = global.merge(header.global.merge(typeSetting.merge(header[_headerPos])));
        }
        return getHeadercache[_headerPos];
    }.bind(this);
    
    
};


//--------Data class
var Data = new function() {
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
                arr[key] = new HeaderLabel(value);
            }
        });
        header[Object.keys(HeaderType)[headerType].toLowerCase()].labels = _data; 
    };
    
     this.getHeaderData = function(_headerType) {
         var headerType = _headerType ? (HeaderType.length()>_headerType ? _headerType : 0) : 0;
         return header[Object.keys(HeaderType)[headerType].toLowerCase()];
     }
};

//--------ImDiagram class
d3.ImDiagram = function() {
    var imDiagram = {};
    
    var diagramHeight = 0;
    var diagramWidth = 0;
    
    var nodeHeight = 50;
    var nodeWidth = 8;
    var nodePadding = 8;
    var nodeOptions = [];
    
    var verticalHeader = null;
    var horizontalHeader = null; 
    
    var nodes = [];
    var nodesList = {};
    var links = [];
    
    var data = [];
    
    imDiagram.diagramHeight = function(_height) {
        if (!arguments.length) return diagramHeight;
        diagramHeight = _height;
        return imDiagram;
    };
    
    imDiagram.diagramWidth = function(_width) {
        if (!arguments.length) return diagramWidths;
        diagramWidth = _width;
        if (horizontalHeader!= null){
             size = horizontalHeader.size();
            horizontalHeader.size(diagramWidth, size.height);
        }
        return imDiagram;
    };
    
    imDiagram.verticalHeader = function() {
        if(verticalHeader == null){
            verticalHeader = HeaderController(headerOrientationEnum.left, diagramHeight);
            if(horizontalHeader != null){
                options = {otherHeaderDistance:horizontalHeader.size().height};
                verticalHeader.options(options);
                options = {otherHeaderDistance:verticalHeader.size().width};
                horizontalHeader.options(options);
                
            } else {
                options = {otherHeaderDistance:100};
                verticalHeader.options(options);
            }
        }
        return verticalHeader;
    };
    
    imDiagram.horizontalHeader = function() {
        if(horizontalHeader == null){
            horizontalHeader = HeaderController(headerOrientationEnum.top, diagramWidth);
            if(verticalHeader != null){
                options = {otherHeaderDistance:verticalHeader.size().width};
                horizontalHeader.options(options);
                options = {otherHeaderDistance:horizontalHeader.size().height};
                verticalHeader.options(options);
            } else {
                options = {otherHeaderDistance:100};
                horizontalHeader.options(options);
            }
        }
        return horizontalHeader;
    };
    
    imDiagram.nodeWidth = function(_width) {
        if (!arguments.length) return nodeWidth;
        nodeWidth = _width;
        return imDiagram;
    };
    
    imDiagram.nodeHeight = function(_height) {
        if (!arguments.length) return nodeHeight;
        nodeHeight = _height;
        return imDiagram;
    };
    
    imDiagram.nodePadding = function(_padding) {
        if (!arguments.length) return nodePadding;
        nodePadding = _padding;
        return imDiagram;
    };
    
    imDiagram.nodeOptions = function(_options) {
        if (!arguments.length) return nodeOptions;
        nodeOptions.merge(_options);
        return imDiagram;
    };
    
    imDiagram.data = function(_data) {
        if (!arguments.length) return data; 
        data = _data;
        return imDiagram;
    }
    
    imDiagram.nodes = function(_nodes) {
        if (!arguments.length) return nodes;
        nodes = _nodes;
        return imDiagram;
    };
    
    imDiagram.links = function(_links) {
        if (!arguments.length) return links;
        links = _links;
        return imDiagram;
    };
    
    imDiagram.layout = function() {
        info = {};
        info.otherDistance = imDiagram.horizontalHeader().options().otherHeaderDistance;
        info.padding = imDiagram.horizontalHeader().options().padding;
        info.steps = imDiagram.horizontalHeader().steps();
        info.topHeaderCount = imDiagram.horizontalHeader().headerLabels().length;
        
        info.otherDistanceTop = imDiagram.verticalHeader().options().otherHeaderDistance;
        info.Ysteps = imDiagram.verticalHeader().steps();
        if (imDiagram.verticalHeader().headerLabels().length == 0){
            return imDiagram;
        }
        info.nodeHeight = imDiagram.verticalHeader().headerLabels()[0].height();
        
        values = Compute.Nodes(data, info, nodeOptions);
        nodes = values.nodes;
        nodesList = values.nodesList;
        links = values.links;
        return imDiagram;
    };
    
    imDiagram.link = function() {
        var curvature = .5;

        function link(a) {
            var c = a.source.x + a.source.dx
              , d = a.target.x
              , e = d3.interpolateNumber(c, d)
              , f = e(curvature)
              , g = e(1 - curvature)
              , h = a.source.y
              , i = a.target.y
              , j = "M " + c + "," + h + " C " + f + ", " + h + " " + g + ", " + i + " " + d + ", " + i + " L " + d + ", " + (i + a.tdy) + " C " + f + ", " + (i + a.tdy) + " " + f + ", " + (h + a.sdy) + " " + c + ", " + (h + a.sdy) + " L " + c + "," + h;
            return j
        }

        link.curvature = function(_curvature) {
          if (!arguments.length) return curvature;
          curvature = +_curvature;
          return link;
        };

        return link;
      };
    
    return imDiagram;
};

//--------HeaderManager class
var HeaderManager = function() {
    var headers = {};
    var sizeHeaders = [];
    var posWidths = [];
    
    HeaderPos.forEach(function(value){
        posWidths[value] = 0;
    });
    
    var ecexuteFunctionForHeaders = function(_headerPos, func) {
        maxNumber = Math.pow(2, HeaderPos.length());
        var headerPos = _headerPos ? (maxNumber > _headerPos ? _headerPos : 1) : 1;
        
        HeaderPos.forEach(function(value, key, arr){
            if(headerPos & value){
                func(value);
            }
        });
    };
    
    this.addHeader = function(_headerPos) {
        ecexuteFunctionForHeaders(_headerPos, function(value){
            if(!headers[value]){
                headers[value] = new Header(value);
            }  
        });
    };
    
    this.removeHeader = function(_headerPos) {
        ecexuteFunctionForHeaders(_headerPos, function(value){
            delete headers[value]; 
        });
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

//--------ImGraph singleton class
var ImGraph = new function() {
    this.settings = new Settings();
    this.headerManager = new HeaderManager();
    
    this.layout = function() {
        this.headerManager.layout();
    }.bind(this);
};
    

//--------Header class
var Header = function(_headerPos) {
    var info = getHeaderInfo(_headerPos);
    
    this.pos = _headerPos;
    this.type = info.headerType;
    
    this.preLayout = function(){
        this.settings = ImGraph.settings.getHeader(this.pos, info.isXHeader);
        this.settings = ImGraph.settings.getHeader(this.pos, info.isXHeader);
        this.globalSettings = ImGraph.settings.getGlobal();
        this.globalSize = this.globalSettings.size;
        this.width = this.settings.size.width == "max" ? this.globalSize.width : this.settings.size.width;
        this.height = this.settings.size.height == "max" ? this.globalSize.height : this.settings.size.height;
    }.bind(this);
    this.preLayout();
    
    this.layout = function(){
        var data = Data.getHeaderData(info.headerType);
        if (data.length < 1) return;
        
        var count = data.labels.length;
        var NumberOfPaddings = count-1;
        
        var totalWidth = this.settings.size.width == "max" ? this.globalSize.width : this.settings.size.width;
        var totalHeight = this.settings.size.height == "max" ? this.globalSize.height : this.settings.size.height;
        
        var totalLongestSide = totalWidth > totalHeight ? totalWidth : totalHeight;
        
        var padding = this.settings.padding;
        
        var extraWidth = ImGraph.headerManager.getOtherTypesWidth(info.isXHeader);
        
        var paddingStart = info.isXHeader ? padding.left : padding.top;
        var paddingEnd = info.isXHeader ? padding.right : padding.bottom;
       
        var textSize = data.labels[0].textSize();
        
        var longestSide = totalLongestSide - paddingStart - (paddingStart*NumberOfPaddings*0.5) - paddingEnd - (paddingEnd*NumberOfPaddings*0.5) - extraWidth.start - extraWidth.end;
        
        var steps = longestSide / count;
        
        var maxWidthlength = info.isXHeader ? steps : this.settings.size.width;
        
        var oneOrMoreTruncated = false;
        var smallestLabelWidth = steps;//_width;
        
        var width = info.isXHeader ? steps : totalWidth;
        var height = info.isXHeader ? totalHeight : steps;
        
        var headerWidth = getLowestSizePos(textSize); 
        
        data.labels.forEach(function(value, key, array) {
            var label = array[key];
            var beforeTruncateTextSize = label.textSize();
            
            
            var text = label.text().truncateWord({lenght:maxWidthlength});

            smallestLabelWidth = smallestLabelWidth > beforeTruncateTextSize.width ? beforeTruncateTextSize.width : smallestLabelWidth;
            if (text.truncated) {
                oneOrMoreTruncated = true;
            }
            
            label.text(text);
            
            label[info.x](paddingStart + paddingStart*(key)*0.5 + paddingEnd*(key)*0.5 + steps*key + extraWidth.start);
            label[info.y](headerWidth);
            
            label.width(width);
            label.height(height);
        }.bind(this));
        
        data.labels.forEach(function(value, key, array) {
            
            var label = array[key];
            if(this.settings.truncateGroup && oneOrMoreTruncated){
                
                label.text(label.text().truncateWord({lenght:smallestLabelWidth-1}));
            }
            label.horizontalAlign(this.settings.alignment, padding);
            label.verticalAlign(this.settings.verticalAlign, padding);
        }.bind(this));
        
        headerBar = svg.selectAll(".horizontalHeader").data(data.labels).enter();
        
        headerBar.append("text").style("fill", "#1976D2").style("font-weight", 400).attr("y", function(label){ 
                    return label.y();
                }).attr("x", function(label) {
                   return label.x();
               }).text(function(label, key) {
                    return label.text();
            });
    }.bind(this);
    
    var getLowestSizePos = function(_textSize) {
        var globalSize = ImGraph.settings.getGlobal().size;
        side = info.isXHeader ? globalSize.height  : globalSize.width;

        lowestSide = this.getLowestSide();
        return (info.isTopLeftHeader ? 0: side - lowestSide);
    }.bind(this);
    
    this.getLowestSide = function(){
        return this.width < this.height ? this.width : this.height;
    }.bind(this);
};

//--------HeaderController class
HeaderController = function(_orientation, _distance) {
    var controller = {};
    
    var orientation = _orientation;
    var distance = _distance;
    var headerLabels = [];
    var steps;
    var options = Options.returnHeaderOrientationFunction(orientation)({});
    var size = {
        width:options.size.width == "max" ? _distance : options.size.width,
        height:options.size.height == "max" ? _distance : options.size.height
    };
    
    controller.steps = function() {
        return steps;
    };
    
    controller.headerLabels = function(_headerLabels) {
        if (!arguments.length) return headerLabels;
        headerLabels = _headerLabels;
        return controller;
    };
    
    controller.options = function(_options) {
        if (!arguments.length) return options;
        options.merge(_options);
        return controller;
    };
    
    controller.size = function(width, height) {
        if (!arguments.length) return size;
        size.width = width;
        size.height = height;
        return size;
    };
    
    controller.layout = function() {
        steps = Compute.Headers(headerLabels, distance, options);
        
        return controller;
    };
    
    
    return controller;
};

//--------HeaderLabel class
HeaderLabel = function(text) {
    var headerLabel = {};
    var text = text;
    var textSize = {};
    var horizontalAlign = 0;
    var verticalAlign = 0;
    
    var x = 0;
    var y = 0;
    
    var height = 50;
    var width = 100;
    
    headerLabel.text = function(_text) {
        if (!arguments.length) return text;
        text = _text;
        textSize = {};
        return headerLabel;
    };
    
    headerLabel.textSize = function(_fontWeight) {
        if(textSize.width == null || textSize.height == null){
            textSize = text.textSize(_fontWeight);  
        }
        return textSize;
    };
    
    headerLabel.horizontalAlign = function(_alignment, _padding) {
        var padding = _padding || ImGraph.settings.getGlobal().padding;
        var textSize = headerLabel.textSize();

        var middle = (width-(padding.left+padding.right)-textSize.width);
 
        var total = padding.left;
        
        if(_alignment == AlignHorizontal.RIGHT){
            total = middle;
        }else if (_alignment == AlignHorizontal.CENTER){
            total = middle/2;
        }
        horizontalAlign = total;
        return headerLabel;
    };
    
    headerLabel.verticalAlign = function(_alignment, _padding) {
        var padding = _padding || ImGraph.settings.getGlobal().padding;
        var textSize = headerLabel.textSize();
        
        var middle = height-(padding.top+padding.bottom)-textSize.height;
        var total = padding.top + textSize.baseLineHeight;
        if(_alignment == AlignVertical.BOTTOM){
            total += middle;
        }else if (_alignment == AlignVertical.MIDDLE){
            total += middle/2;
        }
        verticalAlign = total;
        return headerLabel;
    };
    
    headerLabel.x = function(_x) {
        if (!arguments.length) return x + horizontalAlign;
        x = _x;
        return headerLabel;
    };
    
    headerLabel.y = function(_y) {
        if (!arguments.length) return y + verticalAlign;
        y = _y;
        return headerLabel;
    };
    
    headerLabel.width = function(_width) {
        if (!arguments.length) return width;
        width = _width;
        return headerLabel;
    };
    
    headerLabel.height = function(_height) {
        if (!arguments.length) return height;
        height = _height;
        return headerLabel;
    };
    
    return headerLabel;
};

//--------Compute static class
var Compute = {};

Compute.Headers = function(_headers, _distance, _options){
    var options = _options;
    var count = _headers.length;
    var paddingSidesCount = count+1;
    var distance = _distance - options.padding*paddingSidesCount - options.otherHeaderDistance;
    var steps = (distance / (count));
    var maxWidthlength = options.orientation == headerOrientationEnum.top ? steps : options.size.width;
    
    var oneOrMoreTruncated = false;
    var smallestLabelWidth = steps;//_width;
    
    for (var i = 0; i < count; i++) {
        var beforeTruncateTextSize = _headers[i].textSize();
        var text = _headers[i].text().truncateWord({lenght:maxWidthlength});
        
        smallestLabelWidth = smallestLabelWidth > beforeTruncateTextSize.width ? beforeTruncateTextSize.width : smallestLabelWidth;
        if (text.truncated) {
            oneOrMoreTruncated = true;
        }
        
        mainSteps =  options.otherHeaderDistance + options.padding*(i+1) + steps*i;
        otherSteps = options.padding;
        
        X = (options.orientation == headerOrientationEnum.left) ? otherSteps : mainSteps;
        Y = ((options.orientation == headerOrientationEnum.left) ? mainSteps : otherSteps) + beforeTruncateTextSize.height;
        _headers[i].text(text);
        _headers[i].x(X);
        _headers[i].y(Y);
        
        
        _headers[i].width((options.orientation == headerOrientationEnum.left) ? options.size.width : steps);
        _headers[i].height((options.orientation == headerOrientationEnum.left) ? steps : options.size.height);
    }
    
    for (var i = 0; i < count; i++) {
        if(options.truncateGroup && oneOrMoreTruncated){
            _headers[i].text(_headers[i].text().truncateWord({lenght:smallestLabelWidth-1}));
        }
        _headers[i].horizontalAlign(options.alignment);
        _headers[i].verticalAlign(options.verticalAlign);
    }
    return steps;
}

Compute.Nodes = function(_data, _info, _options){
    var options = _options;
    var info = _info;
    
    var values = {};
    var nodes = [];
    var nodesList = {};
    
    
    _data.forEach(function(nodeObject) {
        nodeObject.locations.forEach(function(loc) {
            node = {};
            node.key = nodeObject.key;
            node.topHeaderKey = loc.topHeaderKey;
            node.leftHeaderKey = loc.leftHeaderKey;
            node.value = nodeObject.value;
            node.color = nodeObject.color;
            node.targetLinks = [];

            if (!(node.topHeaderKey in nodesList)){
                nodesList[node.topHeaderKey] = {};
            }
            if (!(node.leftHeaderKey in nodesList[node.topHeaderKey])){
                nodesList[node.topHeaderKey][node.leftHeaderKey] = [];
            }
            nodesList[node.topHeaderKey][node.leftHeaderKey].push(node);
            nodes.push(node);
        });
    });
    
    var getTargets = function(node) {
         var targets = [];
         var key = node.topHeaderKey
         
         var getNextXWithNodes = function(){
            var xPos = Number.MAX_VALUE;
            
            for (var k in nodesList){
                if (nodesList.hasOwnProperty(k) && k > key && k < xPos) {
                    xPos = k;
                }
            }
            return xPos == Number.MAX_VALUE ? -1 : xPos;
         };
         var xPos = getNextXWithNodes();
         if (xPos != -1){
             for (var yPos in  nodesList[xPos]){
                  for (var i in nodesList[xPos][yPos]){
                      tempNode = nodesList[xPos][yPos][i];
                      if(tempNode.key == node.key){
                            targets.push(tempNode);
                       }
                  }
             }
         }
        
         return targets;
    };
    
    nodes.forEach(function(node){
        node.x = info.otherDistance + info.padding*(node.topHeaderKey+1) + info.steps*node.topHeaderKey + (info.steps - 8)/2;  
        node.dx = 1;
        node.y = info.otherDistanceTop + info.padding*(node.leftHeaderKey+1) + info.Ysteps*node.leftHeaderKey;
        node.dy = info.Ysteps;
    });
    
    var links = [];
    
    nodes.forEach(function(node) {
            var targets = getTargets(node);
            
            if (targets.length > 0) {
                targets.forEach(function(target) {
                    var link = {};
                    link.source = node;
                    link.target = target;
                    link.sy = link.source.y;
                    link.ty = link.target.y;
                    link.sdy = link.source.dy;
                    link.tdy = link.target.dy;
                    link.dy = node.dy;
                    link.key = node.key;
                    link.value = link.target.value;
                    link.color = node.color;
                    links.push(link);
                });
            }
        })
    
    values.nodes = nodes;
    values.nodesList = nodesList;
    values.links = links;
    
    return values;
};

//--------Options static class
Options = {};

Options.truncate = function(_options) {
    var options = {
			lenght: 30,
			fontWeight: 400,
            direction:DirectionStart.LEFT
		}.merge(_options);
    return options;
};

Options.horizontalHeaders = function(_options) {
    var options = {
			padding: 5,
			alignment: AlignHorizontal.CENTER,
            verticalAlign: AlignVertical.MIDDLE,
            truncateGroup:true,
            size:{width:"max", height:40},
            orientation:headerOrientationEnum.top,
            otherHeaderDistance:0
		}.merge(_options);
    return options;
};

Options.verticalHeaders = function(_options) {
    var options = {
            padding: 5,
            alignment: AlignHorizontal.CENTER,
            verticalAlign: AlignVertical.MIDDLE,
            truncateGroup:true,
            size:{width:80, height:"max"},
            otherHeaderDistance:0,
            orientation:headerOrientationEnum.left
        }.merge(_options);
    return options;
};

Options.returnHeaderOrientationFunction = function(_orientation) {
    funcions = [];
    funcions[headerOrientationEnum.top] = Options.horizontalHeaders;
    funcions[headerOrientationEnum.left] = Options.verticalHeaders;
    
    return funcions[_orientation];
};

//--------imPlotting class
ImPlotting = function(width, height) {
    imPlotting = {};
    
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = w.innerWidth || e.clientWidth || g.clientWidth,
    y = w.innerHeight|| e.clientHeight|| g.clientHeight,
    ratioX = x/width,
    ratioY = y/height;
    
    ImGraph.settings.setGlobal({size:{width:width,height:height}});

    svg = d3.select('.implotting-canvas').append('svg').attr("width", x/ratioX).attr("height", y/ratioY);
    var diagram = d3.ImDiagram().diagramWidth(x/ratioX).diagramHeight(y/ratioY);

    function updateWindow(){
        x = w.innerWidth || e.clientWidth || g.clientWidth;
        y = w.innerHeight|| e.clientHeight|| g.clientHeight;

        svg.attr("width", x/ratioX).attr("height", y/ratioY);
        diagram.diagramWidth(x/ratioX);
        diagram.diagramHeight(y/ratioY);
        imPlotting.layout();
    }
    //w.onresize = updateWindow;

    var headers = {};
    
    imPlotting.addHeader = function(orientation) {
        if (orientation == headerOrientationEnum.left){
            headers[headerOrientationEnum.left] = diagram.verticalHeader();
        } else {
            headers[headerOrientationEnum.top] = diagram.horizontalHeader();   
        }
        return headers[orientation];
    };
    
    imPlotting.addHeaderOptions = function(_orientation, _options) {
        headers[_orientation].options = _options;
    };
    
    imPlotting.addHeaderData = function(_orientation, _data) {
        headers[_orientation].headerLabels(_data);
    };
    
    imPlotting.addNodeData = function(_data) {
        diagram.data(_data);
    };
    
    imPlotting.genLocationsDataset = function(topHeader, leftHeader) {
        locations = [];
        for (var i = 0; i < topHeader.length; i++) {
            dic = {};
            dic.topHeaderKey = topHeader[i];
            dic.leftHeaderKey = leftHeader[i];
            locations.push(dic);
        }
        return locations;
    };
    
    imPlotting.reLayout = function() {
        
        
    }
    
    imPlotting.layout = function() {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                headers[key].layout();
                data = headers[key].headerLabels();
                
               // var xHeaders = svg.selectAll(".horizontalHeader").data(data).enter();
//xHeaders.append("text").style("fill", "#1976D2").style("font-weight", 400).attr("y", function(header){ 
              //              return header.y();
              //          }).attr("x", function(header) {
             //              return header.x();
             //          }).text(function(a, b) {
             //               return a.text();
            //        });
            }
        }
        diagram.layout();
        
        var link = diagram.link();
        
        svg.append("g").selectAll(".link").data(diagram.links()).enter().append("path").attr("class", function(a) {
                        return "link " + a.key;
                    }).attr("d", link).style("fill", function(a) {
                        return a.color;
                    }).style("fill-opacity", 0).style("stroke", function(a) {
                        return  a.color;
                    }).style("stroke-width",0.5).style("stroke-opacity", 0.3);
        
                                         
        var nodes = svg.append("g").selectAll(".node").data(diagram.nodes()).enter().append("g").attr("class", "node").attr("transform", function(a) {
                    return "translate(" + a.x + "," + a.y + ")";
                }); 
        
        nodes.append("rect").attr("class", function(a) {
                return "game " + a.key;
            }).attr("height", function(a) {
                return a.dy
            }).attr("width", diagram.nodeWidth()).style("fill", function(a) {
                return a.color;
            }).style("fill-opacity", function(a) {
                return 8;
            }).style("stroke", function(a) {
                return a.color;
            }).style("stroke-opacity", 0);
    };
    
    ImGraph.headerManager.addHeader(HeaderPos.BOTTOM | HeaderPos.TOP | HeaderPos.LEFT | HeaderPos.RIGHT);
    
    ImGraph.headerManager.removeHeader(HeaderPos.TOP | HeaderPos.BOTTOM);
    
    h = [];
    h.push(HeaderLabel("goodbye"));
    h.push("goodbye");
    
    k = [];
    k.push(HeaderLabel("werkt 1"));
    k.push("wertk 2");
    k.push("wertk 3");
    
    Data.addHeader(h, HeaderType.X);
    Data.addHeader(k, HeaderType.Y);
    ImGraph.settings.setHeader({verticalAlign:AlignVertical.BOTTOM, alignment:AlignHorizontal.RIGHT, padding:{bottom:0, top:0, left:0, right:0}},HeaderPos.TOP);
    ImGraph.settings.setHeader({verticalAlign:AlignVertical.TOP, alignment:AlignHorizontal.RIGHT, padding:{bottom:0, top:0, left:0, right:0}},HeaderPos.BOTTOM);
    ImGraph.settings.setHeader({verticalAlign:AlignVertical.TOP, alignment:AlignHorizontal.RIGHT, padding:{bottom:0, top:0, left:0, right:0}},HeaderPos.LEFT);
    ImGraph.settings.setHeader({verticalAlign:AlignVertical.TOP, alignment:AlignHorizontal.LEFT, padding:{bottom:0, top:0, left:0, right:0}},HeaderPos.RIGHT);
    ImGraph.layout();
    
    
    
    return imPlotting;
};