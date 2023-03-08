const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

canvas.height = innerHeight;
canvas.width = innerWidth;

const DRAW_WIDTH_MAX = innerWidth-150;
const DRAW_HEIGHT_MAX = innerHeight-150;

var _GRAPH;

var SIZE = 100;
var DISTANCE = 300;

var mouseNode;

class Node {
    constructor(x, y, relatives, radius, id) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.stages = 0;
        this.radius = radius;
        this.relatives = relatives;
        this.isAnchor = false;
        this.state = 2;
        this.nextX = x;
        this.nextY = y;
        this.pathTo = [];
    }

    draw() {
        ctx.fillStyle = "#fff";
        if(this.isAnchor) {
            ctx.fillStyle = "#30d42a";
        }
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI);
        ctx.fill();
    }

}

class Cluster {
    constructor(nodes, relation) {
        this.nodes = nodes;
        this.relation = null;
        this.anchor = null;
    }

    draw() {
        this.nodes.forEach((node) => {
            node.draw();
        })

        for(let i = 0; i < this.nodes.length; i++) {
            
        }


        for(let i = 0; i < this.nodes.length - 1; i++) {
            ctx.beginPath();
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "#fff";
            ctx.moveTo(this.nodes[i].x, this.nodes[i].y);
            ctx.lineTo(this.nodes[i+1].x, this.nodes[i+1].y);
            ctx.stroke();
        }

        if(this.relation && this.anchor.stages > 0) {
            let from = this.anchor;
            let to = this.relation.anchor;
            ctx.beginPath();
            ctx.fillStyle = "#fff";
            ctx.strokeStyle = "#fff";
            ctx.moveTo(from.x, from.y);
            ctx.lineTo(to.x, to.y);
            ctx.stroke();
        }
    }
}

class Graph {
    constructor(size, nodeRadius) {
        this.size = size;
        this.nodeRadius = nodeRadius;
        this.nodes = [];
        this.clusters = [];
    }

    generate() {
        for(let i = 0; i < this.size; i++) {
            let n = new Node(Math.floor(Math.random() * DRAW_WIDTH_MAX + 75) - this.nodeRadius, Math.floor(Math.random() * DRAW_HEIGHT_MAX + 75) - this.nodeRadius, [], this.nodeRadius, i);
            this.nodes.push(n);
        }
    }

    generateClusters() {
        const ANCHOR_MAX_DISTANCE = DISTANCE;
        this.clusters = [];
        let processed = [];
        let remaining = this.nodes;
        let i = 0;

        do {
            let currentAnchor = remaining[i];
            let anchorRelatives = [];

            if(!processed.includes(currentAnchor)) {
                this.nodes.forEach((node) => {
                    if(!processed.includes(node)) {
                        let distance = Math.sqrt(Math.pow((node.x - currentAnchor.x), 2) + Math.pow((node.y - currentAnchor.y), 2));
                        
                        if(distance < ANCHOR_MAX_DISTANCE) {
                            node.isAnchor = false;
                            anchorRelatives.push(node)
                            processed.push(node)
                        }

                    }

                })

                if(anchorRelatives.length > 2) {
                    currentAnchor.isAnchor = true;
                    processed.push(currentAnchor);
                    anchorRelatives.push(currentAnchor);
                    let c = new Cluster(anchorRelatives);
                    c.anchor = currentAnchor;
                    this.clusters.push(c);
                }
            }

            i++;
        } while(i < this.nodes.length);

        for(let i = 0; i < this.clusters.length; i++) {
            try {
                this.clusters[i].anchor.relatives.push(this.clusters[i+1].anchor)
                this.clusters[i].relation = this.clusters[i+1]
            } catch {}
        }
    }

    updateNodeRelations() {
        this.clusters.forEach(cluster => {
            cluster.nodes.forEach(node => {
                node.relatives = cluster.nodes.slice();
                node.relatives.splice(node.relatives.indexOf(node), 1);
            })
        })
    }

    draw() {
        this.clusters.forEach((cluster) => {
            cluster.draw();
        })
    }
}

function lerp(a, b, n) {
    return (1 - n) * a + n * b;
}

const move = () => {
    _GRAPH.nodes.forEach(node => {
        if(node.isAnchor) {
            if(node.state >= 1.2) {
                node.stages++;
                if(node.stages == 10) {
                    node.stages = 0;
                    node.state = 0;
                    node.nextX = node.originalX;
                    node.nextY = node.originalY;
                } else {
                    node.state = 0;
                    node.nextX = (Math.random() * (innerWidth-150 - 150) + 150)
                    node.nextY = (Math.random() * (innerHeight-150 - 150) + 150)
                }
            }
            node.y = lerp(node.y, node.nextY, node.state)
            node.x = lerp(node.x, node.nextX, node.state)
            node.state += 0.025;
            console.log(node.stages)
        }
    })
}


const step = () => {
    move();
    render();
}

const render = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    _GRAPH.draw();
}

const start = () => {
    _GRAPH = new Graph(SIZE, 5);
    _GRAPH.generate();
    _GRAPH.generateClusters();
    _GRAPH.updateNodeRelations();
    setInterval(step, 50)
}

start();