((function () {

    // Javascript has no random choice function..........
    function randomChoice(array) {
        return array[Math.floor(array.length * Math.random())];
    }

    // This function register a 'shape' node, which is not really a node, but 
    // a bezier curve attached to it (with some options to animate it)
    function registerShapeNode() {

        function drawBezierCurve(start, wide, height, middle, curve, center) {

            // Move command
            var startx = start.x;
            var starty = start.y;

            if (center) { startx = startx - wide / 2 }

            M = `M ${startx} ${starty}`

            // Curve command
            var topx = startx + wide * middle;
            var topy = starty - height;

            var endx = startx + wide;
            var endy = starty;

            var ldiff = topx - startx;
            var rdiff = startx + wide - topx;

            // Left anchor point
            var lanchorx = startx + ldiff * curve.left;
            var lanchory = starty;

            // Top left anchor point
            var tlanchorx = topx - ldiff * curve.top;
            var tlanchory = topy;

            C = `C ${lanchorx} ${lanchory}, ${tlanchorx} ${tlanchory}, ${topx} ${topy}`

            // Top right anchor point
            var tranchorx = topx + rdiff * curve.top;
            var tranchory = topy;

            // Right anchor point
            var ranchorx = endx - rdiff * curve.right;
            var ranchory = endy;

            S = `C ${tranchorx} ${tranchory}, ${ranchorx} ${ranchory}, ${endx} ${endy}`

            // Finish the shape to the end
            L = `L ${startx} ${starty}`

            // I've spend more than 3 hours on this function
            // https://developer.mozilla.org/en-US/docs/Web/SVG/Tutorial/Paths
            return `${M} ${C} ${S} ${L}`
        }

        function generateRandomProperties() {
            return {
                base: { wide: 60, height: 40, middle: 0.5, curve: { left: 0.85, top: 0.20, right: 0.85, } },
                wide: Math.random() * 40,
                height: Math.random() * 40,
                middle: Math.random() * 0.5,
                curve: { left: 0.3, top: 0.1, right: 0.3 },
                animation: randomChoice(['easeCubicInOut', 'easePolyInOut', 'easeQuadInOut'])
            }
        }

        G6.registerNode('shape-node', {
            drawShape: (cfg, group) => {
                var color = cfg.color ? cfg.color : '#0aa8a7';
                var props = generateRandomProperties()
                var curve = {
                    left: props.base.curve.left + props.curve.left / 2,
                    top: props.base.curve.top - props.curve.top / 2,
                    right: props.base.curve.right + props.curve.right / 2,
                }

                var path = group.addShape('path', {
                    attrs: {
                        fill: color,
                        stroke: color,
                        cursor: 'pointer',
                        opacity: 0.0,
                        path: drawBezierCurve({ x: 0, y: 0 }, props.base.wide, props.base.height + props.height, props.base.middle + props.middle * 1 / 2, curve, true),
                    },
                    name: 'path-shape',
                });

                var animationDelay = 1000 + Math.random() * 1000;

                // In the beginning shapes are not visible
                path.animate((ratio) => ({ opacity: 0.4 * ratio }), { repeat: false, duration: animationDelay, easing: props.animation })

                path.animate((ratio) => {
                    var bratio = Math.sin(ratio * Math.PI);
                    var wide = props.base.wide + props.wide * bratio;
                    var height = props.base.height + props.height * (1 - bratio);
                    var middle = props.base.middle + props.middle * (1 / 2 - bratio);
                    var cleft = props.base.curve.left + props.curve.left * (1 / 2 - bratio);
                    var ctop = props.base.curve.top + props.curve.top * (bratio - 1 / 2);
                    var cright = props.base.curve.right + props.curve.right * (1 / 2 - bratio);
                    var curve = { left: cleft, top: ctop, right: cright };
                    return {
                        path: drawBezierCurve({ x: 0, y: 0 }, wide, height, middle, curve, true),
                    }
                }, { repeat: true, duration: 4000 + Math.random() * 1000, delay: animationDelay / 2, easing: props.animation })

                return path
            },
            setState(name, value, item) {
                var shape = item.get('keyShape');
                if (name === 'hover') {
                    shape.animate((ratio) => ({ opacity: 0.5 + 0.3 * (value ? ratio : (1 - ratio)) }), { repeat: false, duration: 300, easing: 'easeCubic' });
                }
            },
        }, 'rect');
    }

    // This function register a simple fully transparent node, 
    // that can be used to put labels or add dangling edges
    function registerInvisibleNode() {
        var invisibleNodeDefaultSize = 25;
        G6.registerNode('invisible-node', {
            options: { labelCfg: { style: { fill: '#0aa8a7' } } },
            drawShape: (cfg, group) => {
                var size = (cfg.size !== undefined) ? cfg.size : invisibleNodeDefaultSize;
                return group.addShape('rect', {
                    attrs: {
                        x: -size / 2,
                        y: -size / 2,
                        width: size,
                        height: size,
                        fill: 'white',
                        stroke: 'white',
                        opacity: 0.0,
                    },
                    name: 'inode-box'
                });
            },
            getAnchorPoints(cfg) {
                return [[0.5, 0.5], [0.0, 0.5], [0.5, 1.0], [1.0, 0.5], [0.5, 0.0]]
            },
        }, 'rect');
    }

    // This function register a simple generic factor node
    function registerFactorNode() {
        var factorNodeDefaultFillColor = '#f5f7f7';
        var factorNodeDefaultStrokeColor = '#0aa8a7';
        var factorNodeDefaultSize = 50;
        var factorNodeDefaultShadowOffset = 10;
        var factorNodeDefaultShadowBlur = 50;

        G6.registerNode('factor-node', {
            options: { labelCfg: { style: { opacity: 0.0, }, } },
            drawShape: (cfg, group) => {
                var size = (cfg.size !== undefined) ? cfg.size : factorNodeDefaultSize;
                var shape = group.addShape('rect', {
                    attrs: {
                        x: -size / 2,
                        y: -size / 2,
                        width: size,
                        height: size,
                        fill: factorNodeDefaultFillColor,
                        stroke: factorNodeDefaultStrokeColor,
                        radius: 2,
                        lineWidth: 1.5,
                        cursor: 'pointer',
                        opacity: 1.0,
                        shadowColor: '#c2c2c2',
                    },
                    name: 'gnode-box',
                });

                group.addShape('text', {
                    attrs: {
                        y: 0,
                        x: 0,
                        textAlign: 'center',
                        textBaseline: 'middle',
                        lineHeight: 10,
                        text: cfg.label,
                        fill: factorNodeDefaultStrokeColor,
                        fontSize: size / 2.5,
                        fontWeight: 'bold'
                    },
                    name: 'gnode-type-text'
                });

                return shape
            },
            setState(name, value, item) {
                var shape = item.get('keyShape');
                var size = (shape.cfg.attrs.width !== undefined) ? shape.cfg.attrs.width : factorNodeDefaultSize;

                if (name === 'hover') {
                    shape.animate((r) => {
                        var ratio = value ? r : (1 - r);
                        var newsize = size + (size / 10) * ratio;
                        return {
                            height: newsize,
                            width: newsize,
                            x: -newsize / 2,
                            y: -newsize / 2,
                            shadowOffsetX: factorNodeDefaultShadowOffset * ratio,
                            shadowOffsetY: factorNodeDefaultShadowOffset * ratio,
                            shadowBlur: factorNodeDefaultShadowBlur * ratio,
                        }
                    }, { repeat: false, duration: 300, easing: 'easeCubic' });
                }
            },
            getAnchorPoints(cfg) {
                return [[0.5, 0.5], [0.0, 0.5], [0.5, 1.0], [1.0, 0.5], [0.5, 0.0]]
            },
        }, 'rect');
    }

    // This function register a simple equality factor node
    function registerEqualityNode() {
        var equalityNodeDefaultFillColor = '#ffffff';
        var equalityNodeDefaultSize = 20;
        var equalityNodeDefaultStrokeColor = '#0aa8a7';
        var equalityNodeDefaultLabelStrokeColor = '#0aa8a7';
        G6.registerNode('equality-node', {
            drawShape: (cfg, group) => {
                var shape = group.addShape('rect', {
                    attrs: {
                        x: -equalityNodeDefaultSize / 2,
                        y: -equalityNodeDefaultSize / 2,
                        width: equalityNodeDefaultSize,
                        height: equalityNodeDefaultSize,
                        fill: equalityNodeDefaultFillColor,
                        stroke: equalityNodeDefaultStrokeColor,
                        radius: 3,
                        lineWidth: 1.5,
                        cursor: 'pointer',
                        opacity: 0.7
                    },
                    name: 'gnode-box',
                });

                group.addShape('text', {
                    attrs: {
                        y: 0,
                        x: 0,
                        textAlign: 'center',
                        textBaseline: 'middle',
                        lineHeight: 10,
                        text: "=",
                        fill: equalityNodeDefaultLabelStrokeColor,
                        fontSize: equalityNodeDefaultSize / 2.5,
                        fontWeight: 'bold'
                    },
                    name: 'gnode-type-text'
                });

                return shape
            },
            setState(name, value, item) {
                var shape = item.get('keyShape');
                if (name === 'hover') {
                    shape.animate((r) => {
                        var ratio = value ? r : (1 - r);
                        var newsize = equalityNodeDefaultSize + (equalityNodeDefaultSize / 10) * ratio;
                        return { height: newsize, width: newsize, x: -newsize / 2, y: -newsize / 2 }
                    }, { repeat: false, duration: 300, easing: 'easeCubic' });
                }
            },
            getAnchorPoints(cfg) {
                return [[0.5, 0.5], [0.0, 0.5], [0.5, 1.0], [1.0, 0.5], [0.5, 0.0]]
            },
        }, 'rect');
    }

    function registerFactorEdge() {
        var factorEdgeDefaultStrokeColor = '#0aa8a7';
        var animationCircleFillColor = '#edf6f5';
        var animationCircleStrokeColor = '#0aa8a7';
        var animationCircleStrokeColors = ['#17a2b8', '#fd7e14', '#dc3545', '#6f42c1', '#007bff', '#28a745']
        G6.registerEdge('factor-edge', {
            options: { style: { stroke: factorEdgeDefaultStrokeColor, opacity: 0.7, lineWidth: 1.2 } },
            afterDraw(cfg, group) {
                var shape = group.get('children')[0];
                var startPoint = shape.getPoint(0);
                var stroke = animationCircleStrokeColor; // randomChoice(animationCircleStrokeColors);
                var circle = group.addShape('circle', {
                    attrs: {
                        x: startPoint.x,
                        y: startPoint.y,
                        fill: animationCircleFillColor,
                        stroke: stroke,
                        lineWidth: 1.5,
                        opacity: 0.7,
                        r: 3,
                    },
                    name: 'circle-shape',
                });

                circle.animate((ratio) => {
                    var tmpPoint = shape.getPoint(ratio);
                    return { x: tmpPoint.x, y: tmpPoint.y, opacity: Math.sin(ratio * Math.PI), r: Math.sin(ratio * Math.PI) * 3 };
                }, { repeat: true, duration: (500 + 1000 * Math.random()), });
            },
        }, 'line');
    }

    // Register custom nodes and edges
    registerShapeNode();
    registerInvisibleNode();
    registerFactorNode();
    registerEqualityNode();
    registerFactorEdge();

    var data = {
        nodes: [
            // Top shape nodes
            { id: 'shape10', x: -110, y: 80, type: 'shape-node', color: '#17a2b8' },
            // { id: 'shape11', x: -100, y: 70, type: 'invisible-node', label: 'x_t' },
            { id: 'shape12', x: -90, y: 80, type: 'shape-node', color: '#fd7e14' },

            { id: 'shape20', x: 90, y: 80, type: 'shape-node', color: '#dc3545' },
            // { id: 'shape21', x: 100, y: 70, type: 'invisible-node', label: 'x_t' },
            { id: 'shape22', x: 110, y: 80, type: 'shape-node', color: '#17a2b8' },

            { id: 'shape30', x: 290, y: 80, type: 'shape-node', color: '#6f42c1' },
            // { id: 'shape31', x: 300, y: 70, type: 'invisible-node', label: 'x_t' },
            { id: 'shape32', x: 310, y: 80, type: 'shape-node', color: '#007bff' },

            { id: 'shape40', x: 490, y: 80, type: 'shape-node', color: '#28a745' },
            // { id: 'shape41', x: 500, y: 70, type: 'invisible-node', label: 'x_t' },
            { id: 'shape42', x: 510, y: 80, type: 'shape-node', color: '#dc3545' },

            // Bottom shape nodes
            { id: 'shape50', x: -30, y: 270, type: 'shape-node', color: '#28a745' },
            { id: 'shape51', x: 170, y: 270, type: 'shape-node', color: '#6f42c1' },
            { id: 'shape52', x: 370, y: 270, type: 'shape-node', color: '#dc3545' },
            { id: 'shape53', x: 570, y: 270, type: 'shape-node', color: '#007bff' },

            // Top layer
            { id: 'z-e00', x: -1000, y: 100, type: 'invisible-node' },
            { id: 'z-e01', x: 1400, y: 100, type: 'invisible-node' },

            { id: 'z-g0', x: -200, y: 100, type: 'factor-node', label: '𝒩' },
            { id: 'z-g0-i', x: -200, y: 0, type: 'invisible-node' },

            { id: 'z-g1', x: 0, y: 100, type: 'factor-node', label: '𝒩' },
            { id: 'z-g1-i', x: 0, y: 0, type: 'invisible-node' },

            { id: 'z-g2', x: 200, y: 100, type: 'factor-node', label: '𝒩' },
            { id: 'z-g2-i', x: 200, y: 0, type: 'invisible-node' },

            { id: 'z-g3', x: 400, y: 100, type: 'factor-node', label: '𝒩' },
            { id: 'z-g3-i', x: 400, y: 0, type: 'invisible-node' },

            { id: 'z-g4', x: 600, y: 100, type: 'factor-node', label: '𝒩' },
            { id: 'z-g4-i', x: 600, y: 0, type: 'invisible-node' },

            { id: 'z-e0', x: -100, y: 100, type: 'equality-node' },
            { id: 'z-e1', x: 100, y: 100, type: 'equality-node' },
            { id: 'z-e2', x: 300, y: 100, type: 'equality-node' },
            { id: 'z-e3', x: 500, y: 100, type: 'equality-node' },

            // Multiplication layer
            { id: 'm-e00', x: -1000, y: 160, type: 'invisible-node' },
            { id: 'm-e01', x: 1400, y: 160, type: 'invisible-node' },

            { id: 'm-e0', x: -200, y: 160, type: 'equality-node' },
            { id: 'm-e1', x: 30, y: 160, type: 'equality-node' },
            { id: 'm-e2', x: 230, y: 160, type: 'equality-node' },
            { id: 'm-e3', x: 430, y: 160, type: 'equality-node' },
            { id: 'm-e4', x: 630, y: 160, type: 'equality-node' },

            { id: 'm-g00', x: -1000, y: 290, type: 'invisible-node' },
            { id: 'm-g01', x: 1400, y: 290, type: 'invisible-node' },
            { id: 'm-g0', x: -200, y: 290, type: 'factor-node', label: '✕', size: 30 },
            { id: 'm-g1', x: 30, y: 290, type: 'factor-node', label: '✕', size: 30 },
            { id: 'm-g2', x: 230, y: 290, type: 'factor-node', label: '✕', size: 30 },
            { id: 'm-g3', x: 430, y: 290, type: 'factor-node', label: '✕', size: 30 },
            { id: 'm-g4', x: 630, y: 290, type: 'factor-node', label: '✕', size: 30 },

            // Middle layer 
            { id: 'x-g0', x: -100, y: 225, type: 'factor-node', label: 'f', size: 30 },
            { id: 'x-g1', x: 100, y: 225, type: 'factor-node', label: 'f', size: 30 },
            { id: 'x-g2', x: 300, y: 225, type: 'factor-node', label: 'f', size: 30 },
            { id: 'x-g3', x: 500, y: 225, type: 'factor-node', label: 'f', size: 30 },

            { id: 's-g0', x: -100, y: 290, type: 'factor-node', label: '𝒩' },
            { id: 's-g1', x: 100, y: 290, type: 'factor-node', label: '𝒩' },
            { id: 's-g2', x: 300, y: 290, type: 'factor-node', label: '𝒩' },
            { id: 's-g3', x: 500, y: 290, type: 'factor-node', label: '𝒩' },

            { id: 's-e0', x: -30, y: 290, type: 'equality-node' },
            { id: 's-e1', x: 170, y: 290, type: 'equality-node' },
            { id: 's-e2', x: 370, y: 290, type: 'equality-node' },
            { id: 's-e3', x: 570, y: 290, type: 'equality-node' },

            // Bottom layer
            { id: 'b-i0', x: -30, y: 390, type: 'invisible-node' },
            { id: 'b-i1', x: 170, y: 390, type: 'invisible-node' },
            { id: 'b-i2', x: 370, y: 390, type: 'invisible-node' },
            { id: 'b-i3', x: 570, y: 390, type: 'invisible-node' },


        ],
        edges: [


            // Top layer
            { source: 'z-e00', target: 'z-g0', type: 'factor-edge' },
            { source: 'z-g4', target: 'z-e01', type: 'factor-edge' },
            { source: 'z-g0-i', target: 'z-g0', type: 'factor-edge' },
            { source: 'z-g0', target: 'z-e0', type: 'factor-edge' },
            { source: 'z-e0', target: 'z-g1', type: 'factor-edge' },
            { source: 'z-g1-i', target: 'z-g1', type: 'factor-edge' },
            { source: 'z-g1', target: 'z-e1', type: 'factor-edge' },
            { source: 'z-e1', target: 'z-g2', type: 'factor-edge' },
            { source: 'z-g2-i', target: 'z-g2', type: 'factor-edge' },
            { source: 'z-g2', target: 'z-e2', type: 'factor-edge' },
            { source: 'z-e2', target: 'z-g3', type: 'factor-edge' },
            { source: 'z-g3-i', target: 'z-g3', type: 'factor-edge' },
            { source: 'z-g3', target: 'z-e3', type: 'factor-edge' },
            { source: 'z-e3', target: 'z-g4', type: 'factor-edge' },
            { source: 'z-g4-i', target: 'z-g4', type: 'factor-edge' },

            // Multiplication layer
            { source: 'm-e00', target: 'm-e0', type: 'factor-edge' },
            { source: 'm-e4', target: 'm-e01', type: 'factor-edge' },
            { source: 'm-e0', target: 'm-e1', type: 'factor-edge' },
            { source: 'm-e1', target: 'm-e2', type: 'factor-edge' },
            { source: 'm-e2', target: 'm-e3', type: 'factor-edge' },
            { source: 'm-e3', target: 'm-e4', type: 'factor-edge' },
            { source: 'm-e0', target: 'm-g0', type: 'factor-edge' },
            { source: 'm-e1', target: 'm-g1', type: 'factor-edge' },
            { source: 'm-e2', target: 'm-g2', type: 'factor-edge' },
            { source: 'm-e3', target: 'm-g3', type: 'factor-edge' },
            { source: 'm-e4', target: 'm-g4', type: 'factor-edge' },
            { source: 'm-g00', target: 'm-g0', type: 'factor-edge' },
            { source: 'm-g4', target: 'm-g01', type: 'factor-edge' },

            { source: 'm-g0', target: 's-g0', type: 'factor-edge' },
            { source: 's-g0', target: 's-e0', type: 'factor-edge' },
            { source: 's-e0', target: 'm-g1', type: 'factor-edge' },

            { source: 'm-g1', target: 's-g1', type: 'factor-edge' },
            { source: 's-g1', target: 's-e1', type: 'factor-edge' },
            { source: 's-e1', target: 'm-g2', type: 'factor-edge' },

            { source: 'm-g2', target: 's-g2', type: 'factor-edge' },
            { source: 's-g2', target: 's-e2', type: 'factor-edge' },
            { source: 's-e2', target: 'm-g3', type: 'factor-edge' },

            { source: 'm-g3', target: 's-g3', type: 'factor-edge' },
            { source: 's-g3', target: 's-e3', type: 'factor-edge' },
            { source: 's-e3', target: 'm-g4', type: 'factor-edge' },


            // Middle layer
            { source: 'z-e0', target: 'x-g0', type: 'factor-edge' },
            { source: 'z-e1', target: 'x-g1', type: 'factor-edge' },
            { source: 'z-e2', target: 'x-g2', type: 'factor-edge' },
            { source: 'z-e3', target: 'x-g3', type: 'factor-edge' },

            { source: 'x-g0', target: 's-g0', type: 'factor-edge' },
            { source: 'x-g1', target: 's-g1', type: 'factor-edge' },
            { source: 'x-g2', target: 's-g2', type: 'factor-edge' },
            { source: 'x-g3', target: 's-g3', type: 'factor-edge' },

            // Bottom layer
            { source: 's-e0', target: 'b-i0', type: 'factor-edge' },
            { source: 's-e1', target: 'b-i1', type: 'factor-edge' },
            { source: 's-e2', target: 'b-i2', type: 'factor-edge' },
            { source: 's-e3', target: 'b-i3', type: 'factor-edge' },
        ],
    };

    var graph = new G6.Graph({ container: 'landing-graph', fitCenter: true });

    window.addEventListener('resize', () => {
        graph.changeSize(window.innerWidth, 600)
        graph.fitCenter();
        // On resize we zoom without animation, otherwise it looks weird
        graph.zoom(1.25, { x: window.innerWidth / 2, y: 300 });
    })

    graph.on('node:mouseenter', (e) => graph.setItemState(e.item, 'hover', true));
    graph.on('node:mouseleave', (e) => graph.setItemState(e.item, 'hover', false));

    graph.data(data);
    graph.render();

    window.setTimeout(() => {
        graph.zoom(1.5, { x: window.innerWidth / 2, y: 300 }, true, { duration: 2000, easing: 'easeCubic' });
    }, 100)
})())