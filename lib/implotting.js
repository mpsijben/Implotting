var svg;

var alignmentEnum = {"left":1, "right":2, "center":3};
var directionEnum = {"startToEnd":1, "endToStart":2};

//--------ImDiagram class
d3.ImDiagram = function() {
    var imDiagram = {};
    
    var diagramHeight = 0;
    var diagramWidth = 0;
    
    var nodeHeight = 50;
    var nodeWidth = 8;
    var nodePadding = 8;
    
    var horizontalHeaders = [];
    var horizontalHeaderOptions = {};
    var verticalHeaders = [];
    var verticalHeaderOptions = {};
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
    
    imDiagram.verticalHeaders = function(_headers) {
        if (!arguments.length) return verticalHeaders;
        verticalHeaders = _headers;
        return imDiagram;
    };
    
    imDiagram.horizontalHeaders = function(_headers) {
        if (!arguments.length) return horizontalHeaders;
        horizontalHeaders = _headers;
        Compute.horizontalHeaders(horizontalHeaders, diagramWidth, horizontalHeaderOptions);
        return imDiagram;
    };
    
    imDiagram.horizontalOptions = function(_options) {
        if (!arguments.length) return horizontalHeaderOptions;
        horizontalHeaderOptions = _options;
        return imDiagram;
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

//--------Header class
Header = function(text) {
    var header = {};
    
    var text = text;
    var textSize = {};
    var textAlignmentPos = 0;
    
    var x = 0;
    var y = 0;
    
    var height = 50;
    var width = 100;
    
    header.text = function(_text) {
        if (!arguments.length) return text;
        text = _text;
        textSize = {};
        return header;
    };
    
    header.textSize = function(_fontWeight) {
        if(textSize.width == null || textSize.height == null){
            textSize = text.textSize(_fontWeight);  
        }
        return textSize;
    };
    
    header.textAlignmentPos = function(_alignment) {
        centrum = (width-header.textSize().width);
        if(_alignment == alignmentEnum.left){
            textAlignmentPos = 0;;
        }else if(_alignment == alignmentEnum.right){
            textAlignmentPos = centrum;
        }else if (_alignment == alignmentEnum.center){
            textAlignmentPos = centrum/2;
        }
        
        return header;
    };
    
    header.x = function(_x) {
        if (!arguments.length) return x + textAlignmentPos;
        x = _x;
        return header;
    };
    
    header.y = function(_y) {
        if (!arguments.length) return y;
        y = _y;
        return header;
    };
    
    header.width = function(_width) {
        if (!arguments.length) return width;
        width = _width;
        return header;
    };
    
    header.height = function(_height) {
        if (!arguments.length) return height;
        height = _height;
        return header;
    };
    
    return header;
};

//--------Compute static class
var Compute = {};

Compute.verticalHeaders = function(_headers, _width, _options) {
		var options = {
			padding: 3,
			alignment: alignmentEnum.center
		}.merge(_options);
};

Compute.horizontalHeaders = function(_headers, _width, _options) {
    assert(arguments.length > 1);
    var options = {
			padding: 3,
			alignment: alignmentEnum.center,
            truncateGroup:true
		}.merge(_options);
    
    
    var count = _headers.length;
    var paddingSidesCount = count+1;
    var width = _width - options.padding*paddingSidesCount;
    xSteps = (width / (count));

    oneOrMoreTruncated = false;
    smallestLabelWidth = _width;
    
    for (var i = 0; i < count; i++) {
        var beforeTruncateTextSize = _headers[i].textSize();
        var text = _headers[i].text().truncateWord({lenght:xSteps});
        var textSize = _headers[i].textSize();
        var centrum = (xSteps-textSize.width);
        
        
        smallestLabelWidth = smallestLabelWidth > beforeTruncateTextSize.width ? beforeTruncateTextSize.width : smallestLabelWidth;
        if (text.truncated) {
            oneOrMoreTruncated = true;
        }
        
        _headers[i].text(text);
        _headers[i].x(options.padding*(i+1) + xSteps*i);
        _headers[i].y(options.padding + textSize.height);
        _headers[i].width(xSteps);
        _headers[i].height(textSize.height);
    }
    
    for (var i = 0; i < count; i++) {
        if(options.truncateGroup && oneOrMoreTruncated){
            headers[i].text(_headers[i].text().truncateWord({lenght:smallestLabelWidth-1}));
        }
        _headers[i].textAlignmentPos(options.alignment);
    }
    
    return headers;
};

//--------imPlotting class
ImPlotting = function(width, height) {
    imPlotting = {};
    
    diagram = d3.ImDiagram();
    diagram.diagramWidth(width).diagramHeight(height);

    svg = d3.select('.implotting-canvas').append('svg').attr("width", width).attr("height", height);

    headers = [];
    headers.push(Header("Week 1"));
    headers.push(Header("Week 2"));
    headers.push(Header("Week 3"));
    headers.push(Header("Week 4"));
    headers.push(Header("Week 5"));
    headers.push(Header("Week 6"));
    headers.push(Header("Week 7"));
    headers.push(Header("Week 8"));
    headers.push(Header("Week 9"));
    headers.push(Header("Week 10"));
    headers.push(Header("Week 11"));
    headers.push(Header("Week 12"));
    headers.push(Header("Week 13"));
    headers.push(Header("Week 14"));
    headers.push(Header("Week 15"));
    headers.push(Header("Week 16"));
    diagram.horizontalOptions({alignment:alignmentEnum.center, truncateGroup:false});
    diagram.horizontalHeaders(headers);

    xHeaders = svg.selectAll(".horizontalHeader").data(diagram.horizontalHeaders()).enter();
    xHeaders.append("text").style("fill", "#1976D2").style("font-weight", 400).attr("y", function(header){ 
                return header.y();
            }).attr("x", function(header) {
                return header.x();
            }).text(function(a, b) {
                return a.text();
            });
  
    
    return imPlotting;
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
    options = Options.truncate(_options);
    
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
    options = Options.truncate(_options);
    
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