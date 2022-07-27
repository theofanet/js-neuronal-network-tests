const DEFAULT_SENSOR_OPTIONS = {
    rayCount: 4,
    rayLength: 150,
    raySpread: Math.PI / 2
};

class Sensor {
    constructor(car, options) {
        const { rayCount, rayLength, raySpread } = Object.assign({}, DEFAULT_SENSOR_OPTIONS, options);
  
        this.car = car;
        this.rayCount = rayCount;
        this.rayLength = rayLength;
        this.raySpread = raySpread;

        this.rays = [];
        this.readings = [];
    }

    update(world) {
        this.#castRays();

        this.readings = this.rays.map(ray => this.#getReading(ray, world));
    }

    #getReading(ray, world) {
        const { roadBorders, traffic } = world;

        const [ start, end ] = ray;
        let touches = [];

        let minOffset = undefined;
        (roadBorders || []).forEach(([borderStart, borderEnd]) => {
            const touch = getIntersection(start, end, borderStart, borderEnd);
            if(touch){
                const { offset } = touch;
                if(minOffset === undefined || offset < minOffset)
                    minOffset = offset;
                touches.push(touch);
            }
        });

        (traffic || []).forEach(({ polygon }) => polygon.forEach((x, i) => {
            const touch = getIntersection(start, end, x, polygon[(i + 1) % polygon.length]);
            if(touch){
                const { offset } = touch;
                if(minOffset === undefined || offset < minOffset)
                    minOffset = offset;
                touches.push(touch);
            }
        }));

        if(!touches.length)
            return null;

        return touches.find(({offset}) => offset === minOffset);
    }

    #castRays() {
        this.rays = [];

        for(let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount === 1 ? .5 : i / (this.rayCount - 1)
            ) + this.car.angle;

            const start = {
                x: this.car.x, 
                y: this.car.y
            };

            const end = {
                x: this.car.x - Math.sin(rayAngle) * this.rayLength,
                y: this.car.y - Math.cos(rayAngle) * this.rayLength
            };

            this.rays.push([start, end]);
        }
    }

    draw(ctx) {
        ctx.lineWidth = 2;

        this.rays.forEach(([start, end], i) => {
            let ending = end;
            if(this.readings[i])
                ending = this.readings[i];

            ctx.strokeStyle ="yellow";
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(ending.x, ending.y);
            ctx.stroke();

            if(this.readings[i]) {
                ctx.strokeStyle ="black";
                ctx.beginPath();
                ctx.moveTo(end.x, end.y);
                ctx.lineTo(ending.x, ending.y);
                ctx.stroke();
            }
        });
    }
};
