const DEFAULT_ROAD_OPTIONS = {
    dashLinePattern: [20, 20],
    lineWidth: 5,
    lineColor: "white",
    laneCount: 3
};


class Road {
    constructor(x, width, options={}) {
        const opt = Object.assign({}, DEFAULT_ROAD_OPTIONS, options);
        const { laneCount, dashLinePattern, lineColor, lineWidth } = opt;

        this.x = x;
        this.width = width;
        this.laneCount = laneCount;
        this.lineColor = lineColor;
        this.lineWidth = lineWidth;
        this.dashLinePattern = dashLinePattern;

        this.left = x - width / 2;
        this.right = x + width /2;

        this.top = -100000;
        this.bottom = 100000;

        const topLeft = { x: this.left, y: this.top };
        const topRight = { x: this.right, y: this.top };
        const bottomLeft = { x: this.left, y: this.bottom };
        const bottomRight = { x: this.right, y: this.bottom };

        this.borders = [
            [ topLeft, bottomLeft ],
            [ topRight, bottomRight ]
        ];
    }

    getLaneCenter(idx) {
        const laneWidth = this.width / this.laneCount;
        return this.left + laneWidth / 2 + (Math.min(idx, this.laneCount - 1) * laneWidth);
    }

    draw(ctx){
        ctx.lineWidth = this.lineWidth;
        ctx.strokeStyle = this.lineColor;

        for(let i = 0; i <= this.laneCount; i++) {
            const x = lerp(this.left, this.right, i / this.laneCount);

            ctx.setLineDash(this.dashLinePattern);
            ctx.beginPath();
            ctx.moveTo(x, this.top);
            ctx.lineTo(x, this.bottom);
            ctx.stroke();
        }

        ctx.setLineDash([]);
        this.borders.forEach(([X, Y]) => {
            ctx.beginPath();
            ctx.moveTo(X.x, X.y);
            ctx.lineTo(Y.x, Y.y);
            ctx.stroke();
        });
    }
}