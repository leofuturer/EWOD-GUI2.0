export function genFileContents(electrodes, allCombined) {
    let newContents = {}, squares = [], combs = []

    for (var i = 0; i < allCombined.length; i++) {
        const comb = allCombined[i]
        let boop = "combine " + comb[0] + " " + comb[1] + " " + comb[2]
        combs.push(boop)
    }

    for (var j = 0; j < electrodes.initPositions.length; j++) {
        const x = electrodes.initPositions[j][0] + electrodes.deltas[j][0]
        const y = electrodes.initPositions[j][1] + electrodes.deltas[j][1]
        let boop = "square " + x + " " + y
        squares.push(boop)
    }
    newContents["squares"] = squares
    newContents["combs"] = combs
    return newContents
}