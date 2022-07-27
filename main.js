const carCanvas = document.getElementById("carCanvas");
const networkCanvas = document.getElementById("networkCanvas");

carCanvas.height = window.innerHeight;
carCanvas.width = 200;

networkCanvas.height = window.innerHeight;
networkCanvas.width = 500;

const carCtx = carCanvas.getContext("2d");
const networkCtx = networkCanvas.getContext("2d");

let traffic;
let road;
let cars;
let bestCar;
let stoped = true;

let initScene = () => {
    const NB_CARS = parseInt(document.getElementById("nbCars_input").value);
    const MUTATION_AMOUNT = parseFloat(document.getElementById("mutationAmount_input").value);
    const LANES = JSON.parse(document.getElementById("lanes").value);

    road = new Road(carCanvas.width / 2, carCanvas.width * 0.9);
    traffic = generateTraffic(road, { forceLanes: LANES });
    
    cars = Array.from({ length: NB_CARS }, () => new Car(road.getLaneCenter(1), 0, 30, 50, { 
        controlType: "AI", 
        color: "blue",
        networkCounts: JSON.parse(document.getElementById("networkCounts_input").value),
        sensorRayCount: parseInt(document.getElementById("nbSensors_input").value)
    }));
    bestCar = cars[0];
    
    const bestBrain = loadBrain();
    if(bestBrain) {
        cars.forEach((car, i) => {
            car.brain = loadBrain()
            if(i !== 0)
                NeuralNetwork.mutate(car.brain, MUTATION_AMOUNT);
        });
    }
};


const animate = (time) => {
    carCanvas.height = window.innerHeight;
    networkCanvas.height = window.innerHeight;

    const world = {
        roadBorders: road.borders,
        traffic
    };

    // Updating
    traffic.forEach(car => car.update());
    cars.forEach(car => car.update(world));

    const carMinY = Math.min(...cars.map(c => c.y));
    bestCar = cars.find(car => car.y === carMinY);

    // Drawing
    const ctxY = -bestCar.y + carCanvas.height * 0.7;
    world.roadSight = {
        top: -ctxY,
        bottom: -ctxY + carCanvas.height
    };
    carCtx.save();
    carCtx.translate(0, ctxY);

    road.draw(carCtx);
    traffic.forEach(car => car.draw(carCtx, world));

    carCtx.globalAlpha = 0.2;
    cars.forEach(car => car !== bestCar && car.draw(carCtx, world));
    carCtx.globalAlpha = 1.0;
    bestCar.draw(carCtx, world, true);
    
    carCtx.restore();

    networkCtx.lineDashOffset = -time / 50;
    Visualizer.drawNetwork(networkCtx, bestCar.brain, time);

    if(!stoped)
        requestAnimationFrame(animate);
};

const pause = () => {
    stoped = true;
    document.getElementById("playPause_btn").innerHTML = "▶️";
    document.getElementById("playPause_btn").onclick = play;
};

const play = () => {
    stoped = false;
    animate();
    document.getElementById("playPause_btn").innerHTML = "⏸️";
    document.getElementById("playPause_btn").onclick = pause;
};

const reset = () => {
    initScene();
    if(stoped)
        setTimeout(play, 100);
};

loadContext();
initScene();
setTimeout(animate, 100);