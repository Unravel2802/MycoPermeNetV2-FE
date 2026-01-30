type descriptorInfo = {
    min: number
    max: number
    step: number
}

export type descriptor = {
    descriptor: string
    info: descriptorInfo
    value?: number
}

export const moleculeDescriptorsInfo: descriptor[] = [
    {descriptor: 'HBA', info: {min: 1, max: 20, step:1}, value: 3},
    {descriptor: 'HBD', info: {min: 0, max: 10, step:1}, value: 2}, 
    {descriptor: 'HBA+HBD', info: {min: 1, max: 30, step:1}, value: 5},
    {descriptor: 'NumRings', info: {min: 0, max: 10, step:1}, value: 1},
    {descriptor: 'RTB', info: {min: 0, max: 20, step:1}, value: 5},
    {descriptor: 'NumAmideBonds', info: {min: 0, max: 5, step:1}, value: 0},
    {descriptor: 'Globularity', info: {min: 0, max: 1.0, step: 0.05}, value: 0.6425500622726473},
    {descriptor: 'PBF', info: {min: 0, max: 2.0, step: 0.1}, value: 0.7717374411029935},
    {descriptor: 'TPSA', info: {min: 20.0, max: 300.0, step:10.0}, value: 89.22 },
    {descriptor: 'logP', info: {min: -10, max: 10, step:0.5}, value: 1.9506},
    {descriptor: 'MR', info: {min: 10.0, max: 200.0, step: 10.0}, value: 47.2886},
    {descriptor: 'MW', info: {min: 50.0, max: 1000.0, step:50.0}, value: 179.179},
    {descriptor: 'Csp3', info: {min: 0, max: 1, step:0.05}, value: 0.25},
    {descriptor: 'fmf', info: {min: 0, max: 1, step:0.05}, value: 0.4615384615384615}, 
    {descriptor: 'QED', info: {min: 0, max: 1, step:0.05}, value: 0.3211217985566729}, 
    {descriptor: 'HAC', info: {min: 5, max: 50, step:5}, value: 13}, 
    {descriptor: 'NumRingsFused', info: {min: 0, max: 10, step: 1}, value: 1}, 
    {descriptor: 'unique_HBAD', info: {min: 1, max: 20, step:1}, value: 3},
    {descriptor: 'max_ring_size', info: {min: 0, max: 20, step:1}, value: 6},
    {descriptor: 'n_chiral_centers', info: {min: 0, max: 20, step:1}, value: 0},
    {descriptor: 'fcsp3_bm', info: {min: 0.0, max: 5.0, step:1.0}, value: 0.0},
    {descriptor: 'formal_charge', info: {min: -5, max: 5, step:1}, value: 0},
    {descriptor: 'abs_charge', info: {min: 0, max: 5, step:1}, value: 0}
]

export const descriptorNames = ['HBA', 'HBD', 'HBA+HBD', 'NumRings', 'RTB', 'NumAmideBonds',
    'Globularity', 'PBF', 'TPSA', 'logP', 'MR', 'MW', 'Csp3',
    'fmf', 'QED', 'HAC', 'NumRingsFused', 'unique_HBAD', 'max_ring_size',
    'n_chiral_centers', 'fcsp3_bm', 'formal_charge', 'abs_charge']