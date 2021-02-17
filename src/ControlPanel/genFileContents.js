export function genFileContents(electrodes) {
    let newContents = []
    // for (var i = 0; i < combined.length; i++) {
    //     var pos = combined[i].split(/,\s/)
    //     let boop = "combine" + i + " " + pos[0] + " " + pos[1]
    //     newContents.push(boop)
    //     console.log(boop)
    // }

    for (var j = 0; j < electrodes.initPositions.length; j++) {
        const x = electrodes.initPositions[j][0] + electrodes.deltas[j][0]
        const y = electrodes.initPositions[j][1] + electrodes.deltas[j][1]
        let boop = "square " + x + " " + y
        newContents.push(boop)
    }
    return newContents
}