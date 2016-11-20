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
    
    var verticalHeader = null;
    var horizontalHeader = null; 
    
    var nodes = [];
    var links = [];
    
    
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
    
    imDiagram.link = function() {
        var curvature = .5;

        function link(_link) {
          var x0 = _link.source.x + _link.source.dx,
              x1 = _link.target.x,
              xi = d3.interpolateNumber(x0, x1),
              x2 = xi(curvature),
              x3 = xi(1 - curvature),
              y0 = _link.source.y + _link.sy,
              ytr = _link.target.y + _link.ety,
              ybr = ytr + _link.edy,
              ybl = y0 + _link.dy;
          return "M" + x0 + "," + y0
               + "C" + x2 + "," + y0
               + " " + x3 + "," + ytr
               + " " + x1 + "," + ytr
               + "L" + x1 + "," + ybr
               + "C" + x3 + "," + ybr
               + " " + x2 + "," + ybl
               + " " + x0 + "," + ybl
               + "L" + x0 + "," + (y0);
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
    var options = Options.returnHeaderOrientationFunction(orientation)({});
    var size = {
        width:options.size.width == "max" ? _distance : options.size.width,
        height:options.size.height == "max" ? _distance : options.size.height
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
        Compute.Headers(headerLabels, distance, options);
        
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

Compute.verticalHeaders = function(_headers, _height, _options) {
	var options = Options.verticalHeaders(_options);
    
    return Compute.Headers(_headers, _height, options, options.horizontalHeadersWidth);
};

Compute.horizontalHeaders = function(_headers, _width, _options) {
	var options = Options.horizontalHeaders(_options);
    
    return Compute.Headers(_headers, _width, options, options.verticalHeadersWidth);
};

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
    return _headers;
}

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
    
    
    imPlotting.layout = function(_orientation) {
        for (var key in headers) {
            if (headers.hasOwnProperty(key)) {
                headers[key].layout();
                data = headers[key].headerLabels();
                
                xHeaders = svg.selectAll(".horizontalHeader").data(data).enter();
                xHeaders.append("text").style("fill", "#1976D2").style("font-weight", 400).attr("y", function(header){ 
                            return header.y();
                        }).attr("x", function(header) {
                           return header.x();
                       }).text(function(a, b) {
                            return a.text();
                    });
            }
        }
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