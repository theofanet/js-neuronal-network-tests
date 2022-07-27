class NeuralNetwork {
    constructor(neuronCounts) {
        this.levels = Array.from({ length: neuronCounts.length - 1 }, (_, i) => 
            new Level(neuronCounts[i], neuronCounts[i + 1])
        );
    }

    static feedForward(givenInputs, network) {
        let outputs = givenInputs;
        network.levels.forEach(lvl => {
            outputs = Level.feedForward(outputs, lvl)
        });
        return outputs;
    }

    static mutate(network, amount = 1) {
        network.levels.forEach(level => {
            level.biases = Array.from({ length: level.biases.length }, (_, i) => lerp(
                level.biases[i],
                Math.random() * 2 - 1,
                amount
            ));
            
            level.weights = level.weights.map(liw => liw.map(weight => lerp(
                weight, 
                Math.random() * 2 - 1,
                amount
            )));
        });
    }
}

class Level {
    constructor(inputCount, outputCount) {
        this.inputs = Array.from({ length: inputCount });
        this.outputs = Array.from({ length: outputCount });
        this.biases = Array.from({ length: outputCount });

        this.weights = Array.from({length: inputCount}, () => new Array(outputCount));

        Level.#randomize(this);
    }

    static #randomize(level) {
        level.weights = level.inputs.map(() => level.outputs.map(() => Math.random() * 2 - 1));
        level.biases = Array.from({ length: level.outputs.length }, () => Math.random() * 2 - 1);
    }

    static feedForward(givenInputs, level) {
        level.inputs = Array.from({ length: level.inputs.length }, (_, i) => givenInputs[i]);
        level.outputs = Array.from({ length: level.outputs.length }, (_, i) => {
            let sum = 0;
            level.inputs.forEach((lin, j) => sum += lin * level.weights[j][i]);
            return sum > level.biases[i] ? 1 : 0;
        });
        return level.outputs;
    }
}