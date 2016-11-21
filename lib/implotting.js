alignmentEnum = {"left":1, "right":2, "center":3};
headerOrientationEnum = {"top":1, "left":2};
directionEnum = {"startToEnd":1, "endToStart":2};

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
    var textAlignmentPos = 0;
    
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
    
    headerLabel.textAlignmentPos = function(_alignment) {
        centrum = (width-headerLabel.textSize().width);
        if(_alignment == alignmentEnum.left){
            textAlignmentPos = 0;;
        }else if(_alignment == alignmentEnum.right){
            textAlignmentPos = centrum;
        }else if (_alignment == alignmentEnum.center){
            textAlignmentPos = centrum/2;
        }
        return headerLabel;
    };
    
    headerLabel.x = function(_x) {
        if (!arguments.length) return x + textAlignmentPos;
        x = _x;
        return headerLabel;
    };
    
    headerLabel.y = function(_y) {
        if (!arguments.length) return y;
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
        
        extra = 0;
        
        if(options.orientation == headerOrientationEnum.left){
            extra = beforeTruncateTextSize.height;
        }
        mainSteps =  options.otherHeaderDistance + options.padding*(i+1) + steps*i +  extra;
        otherSteps = beforeTruncateTextSize.height + options.padding;
        
        X = (options.orientation == headerOrientationEnum.left) ? otherSteps : mainSteps;
        Y = (options.orientation == headerOrientationEnum.left) ? mainSteps : otherSteps;
        _headers[i].text(text);
        _headers[i].x(X);
        _headers[i].y(Y);
        _headers[i].width(steps);
        _headers[i].height(beforeTruncateTextSize.height);
    }
    
    for (var i = 0; i < count; i++) {
        if(options.truncateGroup && oneOrMoreTruncated){
            _headers[i].text(_headers[i].text().truncateWord({lenght:smallestLabelWidth-1}));
        }
        _headers[i].textAlignmentPos(options.alignment);
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
        node.x = info.otherDistance + info.padding*(node.topHeaderKey+1) + info.steps*node.topHeaderKey;  
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
            direction:directionEnum.startToEnd
		}.merge(_options);
    return options;
};

Options.horizontalHeaders = function(_options) {
    var options = {
			padding: 5,
			alignment: alignmentEnum.left,
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
            alignment: alignmentEnum.left,
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
    
    var diagram = d3.ImDiagram().diagramWidth(width).diagramHeight(height);

    var svg = d3.select('.implotting-canvas').append('svg').attr("width", width).attr("height", height);

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
    
    imPlotting.layout = function(_orientation) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                headers[key].layout();
                data = headers[key].headerLabels();
                
                var xHeaders = svg.selectAll(".horizontalHeader").data(data).enter();
                xHeaders.append("text").style("fill", "#1976D2").style("font-weight", 400).attr("y", function(header){ 
                            return header.y();
                        }).attr("x", function(header) {
                           return header.x();
                       }).text(function(a, b) {
                            return a.text();
                    });
            }
        }
        diagram.layout();
        
        var link = diagram.link();
        
        //alert(diagram.links()[0]);
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

    
    return imPlotting;
};

//--------default functions below

assert = function(_condition, _message) {
    if (!_condition) {
        _message = _message || "Assertion failed";
        if (typeof Error !== "undefined") {
            throw new Error(_message);
        }
        throw _message;
    }
}

Object.prototype.merge = function(_options) {
    var options = this; 

    for (key in _options) {
        if (_options.hasOwnProperty(key)) {
            options[key] = _options[key];
        }
    }
    
    return options;
};


String.prototype.textSize = function(_fontWeight) {
    if (!arguments.length) _fontWeight = 400;
    
    var cssBox = document.getElementById("textLength");
    if (cssBox === null) {
        cssBox = document.createElement('span');
        document.body.appendChild(cssBox);
        cssBox.id = "textLength";
    }
    
    cssBox.style.fontWeight = _fontWeight;
    cssBox.innerHTML = this;
    
    returns = {};
    returns.width = cssBox.offsetWidth;
    returns.height = cssBox.offsetHeight;
    
    return returns;
};

String.prototype.truncate = function(_options) {
    var options = Options.truncate(_options);
    
    var tmp = this;
    var truncated = this;
    while (truncated.textSize(options.fontWeight).width > options.lenght ) {
        index = options.direction == directionEnum.startToEnd ? 1 : 0;
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
        wordSplits = tmp.split(" ");
        index = options.direction == directionEnum.startToEnd ? 0 : wordSplits.length-1;
        wordSplits.splice(index, 1);
        truncated = wordSplits.join(" ");
        truncated = truncated.isTruncated(true);
    }
    return truncated;
};