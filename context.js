const saveAll = (bestCar) => {
    saveBrain(bestCar);
    saveContext();
};

const saveBrain = bestCar => localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
const discardBrain = () => localStorage.removeItem("bestBrain");
const loadBrain = () => JSON.parse(localStorage.getItem("bestBrain"));

const saveContext = () => localStorage.setItem("context", JSON.stringify({
    lanes: document.getElementById("lanes").value,
    nbSensors: document.getElementById("nbSensors_input").value,
    networkCount: document.getElementById("networkCounts_input").value,
    nbCars: document.getElementById("nbCars_input").value,
    mutationAmount: document.getElementById("mutationAmount_input").value
}));
const discardContext = () => localStorage.removeItem("context");
const loadContext = () => {
    const rawCtx = localStorage.getItem("context");
    if(rawCtx){
        const { lanes, nbSensors, nbCars, networkCount, mutationAmount } = JSON.parse(rawCtx);
        document.getElementById("lanes").value = lanes;
        document.getElementById("nbSensors_input").value = nbSensors;
        document.getElementById("networkCounts_input").value = networkCount;
        document.getElementById("nbCars_input").value = nbCars;
        document.getElementById("mutationAmount_input").value = mutationAmount;
    }
};