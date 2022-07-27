const DEFAULT_CAR_OPTIONS = {
    acceleration: 0.3,
    friction: 0.05,
    maxSpeed: 3,
    rotationSpeed: 0.02,
    color: undefined,
    controlType: "DUMMY",
    textureSrc: "car.png",
    networkCounts: [4, 6, 4],
    sensorRayCount: 4
};

const DEFAULT_WORD = {
    roadBorders: []
};

class Car {
    constructor(x, y, width, height, options={}) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        const { 
            acceleration, 
            friction,
            maxSpeed, 
            rotationSpeed, 
            color,
            controlType,
            textureSrc,
            networkCounts,
            sensorRayCount
        } = Object.assign({}, DEFAULT_CAR_OPTIONS, options);

        this.color = color || getRandomColor();

        this.speed = 0;
        this.angle = 0;
        this.polygon = [];
        this.damaged = false;

        this.acceleration = acceleration;
        this.friction = friction;
        this.maxSpeed = maxSpeed;
        this.rotationSpeed = rotationSpeed;

        this.controls = new Controls(controlType);
        if(controlType !== "DUMMY") 
            this.sensor = new Sensor(this, { rayCount: sensorRayCount });
        if(controlType === "AI")
            this.brain = new NeuralNetwork([this.sensor.rayCount, ...networkCounts, 4]);

        if(textureSrc) {
            this.texture = new Image();
            this.texture.src = textureSrc;
    
            this.mask = document.createElement("canvas");
            this.mask.width = width;
            this.mask.height = height;
    
            const maskCtx = this.mask.getContext("2d");
            this.texture.onload = () => {
                maskCtx.fillStyle = this.color;
                maskCtx.rect(0, 0, this.width, this.height);
                maskCtx.fill();
                maskCtx.globalCompositeOperation = "destination-atop";
                maskCtx.drawImage(this.texture, 0, 0, this.width, this.height);
            };
        }
    }

    draw(ctx, world, drawSensors = false){
        const { roadSight } = world;
        if(roadSight) {
            if(this.y > roadSight.bottom || this.y < roadSight.top)
                return;
        }

        if(this.sensor && drawSensors)
            this.sensor.draw(ctx);

        if(this.texture) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(-this.angle);
            if(!this.damaged) {
                ctx.drawImage(
                    this.mask, 
                    -this.width / 2, -this.height / 2, 
                    this.width, this.height
                );
                ctx.globalCompositeOperation = "multiply";
            }

            ctx.drawImage(
                this.texture, 
                -this.width / 2, -this.height / 2, 
                this.width, this.height
            );

            ctx.restore();
        }
        else {
            const pts = [...this.polygon];
            if(pts.length) {
                const first = pts.shift();
    
                if(this.damaged)
                    ctx.fillStyle = "gray";
                else  
                    ctx.fillStyle = this.color;
    
                ctx.beginPath();
                ctx.moveTo(first.x, first.y);
                pts.forEach(({x, y}) => ctx.lineTo(x, y));
                ctx.fill();
            }
        }
    }

    #createPolygon() {
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);

        return [
            {
                x: this.x - Math.sin(this.angle - alpha) * rad,
                y: this.y - Math.cos(this.angle - alpha) * rad
            },
            {
                x: this.x - Math.sin(this.angle + alpha) * rad,
                y: this.y - Math.cos(this.angle + alpha) * rad
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
                y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
            },
            {
                x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
                y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
            }
        ];
    }

    #move() {
        if(this.controls.forward)
            this.speed += this.acceleration;
        if(this.controls.backward)
            this.speed -= this.acceleration;

        if(this.speed > this.maxSpeed)
            this.speed = this.maxSpeed;
        else if(this.speed < -this.maxSpeed/2)
            this.speed = -this.maxSpeed / 2;

        if(this.speed != 0){
            this.speed += this.friction * (this.speed > 0 ? -1 : 1);
            if(Math.abs(this.speed) < this.friction)
                this.speed = 0;
        }

        if(this.speed != 0){
            const flip = this.speed > 0 ? 1 : -1;
            if(this.controls.right)
                this.angle -= this.rotationSpeed * flip;
            if(this.controls.left)
                this.angle += this.rotationSpeed * flip;
        }

        this.y -= Math.cos(this.angle) * this.speed;
        this.x -= Math.sin(this.angle) * this.speed;
    }

    update(world={}){
        if(this.damaged)
            return;

        const actualWorld = Object.assign({}, DEFAULT_WORD, world);

        this.#move();
        this.polygon = this.#createPolygon();
        this.damaged = this.#assessDamage(actualWorld);
        
        if(this.sensor) {
            this.sensor.update(actualWorld);

            if(this.brain){
                const offsets = this.sensor.readings.map(s => s === null ? 0 : 1 - s.offset);
                const outputs = NeuralNetwork.feedForward(offsets, this.brain);
                [ 
                    this.controls.forward, 
                    this.controls.left, 
                    this.controls.right, 
                    this.controls.backward 
                ] = outputs;
            }
        }
    }

    #assessDamage(world) {
        if((world.roadBorders || []).findIndex(border => polysIntersect(this.polygon, border)) !== -1)
            return true;
        if((world.traffic || []).findIndex(car => polysIntersect(this.polygon, car.polygon)) !== -1)
            return true;
        return false;
    }
}