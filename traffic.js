const DEFAULT_TRAFFIC_OPTIONS = {
    nbCars: 1,
    stepLength: 200,
    nbLanes: 3,
    maxCarPerLane: 2,
    maxSpeed: 2, 
    forceFirstLane: undefined,
    forceLanes: undefined,
    carsColor: undefined
};

const generateTraffic = (road, options) => {
    const { 
        stepLength, 
        maxCarPerLane, 
        nbLanes, 
        maxSpeed, 
        forceFirstLane, 
        forceLanes, 
        carsColor, 
        ...opt 
    } = Object.assign({}, DEFAULT_TRAFFIC_OPTIONS, options);

    const traffic = [];
    let nbCars = opt.nbCars;
    let step = 1;
    let laneAvailable = Array.from({length: nbLanes}, (_, i) => i);

    if(forceLanes){
        nbCars = 0;
        forceLanes.forEach(l => l.forEach(() => nbCars++));
        laneAvailable = forceLanes[step - 1];
    }

    for(let i = 0; i < nbCars; i++) {
        if((!forceLanes && i % maxCarPerLane === 0) || !laneAvailable.length){
            step++;
            if(forceLanes.length < step)
                return traffic;
            laneAvailable = forceLanes ? [...forceLanes[step - 1]] : Array.from({length: nbLanes}, (_, i) => i);
        }
        
        const laneIdx = forceLanes ? 0 : (i == 0 && forceFirstLane !== undefined ? 
            laneAvailable.findIndex(l => l === forceFirstLane) 
            : Math.floor(Math.random() * laneAvailable.length));

        const [ lane ] = laneAvailable.splice(laneIdx, 1);

        traffic.push(new Car(
            road.getLaneCenter(lane),
            -stepLength * step,
            30, 50,
            { color: carsColor, maxSpeed }
        ));
    }

    return traffic;
};