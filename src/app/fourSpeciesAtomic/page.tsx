"use client"
import { FormEvent, useEffect, useState } from 'react';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { gql, useLazyQuery } from '@apollo/client';
import { SingleView, Molecule } from '@/lib/xsmiles/src/modules/SingleView';
import { Method } from '@/lib/xsmiles/src/types/molecule.types';
import { defaultGradientConfig } from '@/lib/consts';
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { RDKitModule } from '@rdkit/rdkit';

type SpeciesKey = 'mtb' | 'mab' | 'mav' | 'msm';

type SpeciesResult = {
    species: SpeciesKey;
    predictScore?: number;
    interpretScores?: number[];
};

const SPECIES_ORDER: SpeciesKey[] = ['mtb', 'mab', 'mav', 'msm'];
const SPECIES_LABELS: Record<SpeciesKey, string> = {
    mtb: 'Mtb',
    mab: 'Mab',
    mav: 'Mav',
    msm: 'Msm',
};

export default function FourSpeciesAtomicPage() {
    const [molSmileString, setMolSmileString] = useState("");
    const [errorMol, setErrorMol] = useState(false);
    const [rdkit, setRDKit] = useState<RDKitModule>();
    const [results, setResults] = useState<SpeciesResult[] | null>(null);

    const queryInterpret = gql`
    query ($molSmile: String!) {
      fourSpeciesInterpretPermeabilityByAtoms(molSmile: $molSmile)
    }`;
    const queryPredict = gql`
    query ($molSmile: String!) {
      fourSpeciesPredictPermeabilityByAtoms(molSmile: $molSmile)
    }`;

    const [getInterpret, { loading: loadingInterpret, error: errorInterpret, data: dataInterpret }] =
        useLazyQuery(queryInterpret);
    const [getPredict, { loading: loadingPredict, error: errorPredict, data: dataPredict }] =
        useLazyQuery(queryPredict);

    useEffect(() => {
        window.initRDKitModule().then((RDKit: RDKitModule) => {
            window.RDKit = RDKit;
            setRDKit(RDKit);
        });
    }, []);

    function handleInputSubmit(e: FormEvent) {
        e.preventDefault();

        if (rdkit) {
            const mol = rdkit.get_mol(molSmileString.trim());
            if (!mol) {
                setErrorMol(true);
                setResults(null);
                return;
            }
        }

        setErrorMol(false);
        setResults(null);

        const molSmile = molSmileString.trim();
        getInterpret({ variables: { molSmile } });
        getPredict({ variables: { molSmile } });
    }

    useEffect(() => {
        if (!dataInterpret || !dataPredict) return;

        // dataInterpret.fourSpeciesInterpretPermeabilityByAtoms -> [[Float]]
        // dataPredict.fourSpeciesPredictPermeabilityByAtoms -> [Float]
        const interps: number[][] = dataInterpret.fourSpeciesInterpretPermeabilityByAtoms || [];
        const preds: number[] = dataPredict.fourSpeciesPredictPermeabilityByAtoms || [];

        const combined: SpeciesResult[] = SPECIES_ORDER.map((sp, i) => ({
            species: sp,
            predictScore: preds?.[i],
            interpretScores: interps?.[i]
        }));

        setResults(combined);
    }, [dataInterpret, dataPredict]);

    const speciesCard = (res: SpeciesResult, index: number) => {
        const met: Method = {
            name: "Permeability",
            scores: res.interpretScores ?? [],
            attributes: {}
        };

        const molView: Molecule = {
            string: molSmileString.trim(),
            method: met,
            attributes: {}
        };

        return (
            <div
                className="card shadow-2 h-20rem border-round surface-card overflow-hidden w-full"
                key={res.species}
            >
                <div className="flex flex-column h-full p-3">
                    <div className="flex justify-content-between align-items-center mb-2">
                        <div className="text-xl font-bold text-700">{SPECIES_LABELS[res.species]}</div>
                        <span className="text-lg font-semibold">
                            {res.predictScore !== undefined ? res.predictScore.toFixed(3) : '-'}
                        </span>
                    </div>
                    <div className="flex-1 w-full flex justify-content-center align-items-center min-w-0">
                        <SingleView
                            molecule={molView}
                            drawerType="RDKitDrawer"
                            gradientConfig={defaultGradientConfig}
                            width={760}
                            height={160}
                            hideAttributesTable
                            hideBarChart
                        />
                    </div>
                </div>
            </div>

        );
    };



    return (
        <div>
            <h1>MycoPermeNet — Four-Species Atomic</h1>

            <div className="card flex justify-content mb-7">
                <form onSubmit={handleInputSubmit}>
                    <div className="flex flex-column gap-2">
                        <label htmlFor="molSmile">Molecule SMILES</label>
                        <div className='flex flex-row gap-2'>
                            <InputText invalid={errorMol} id="molSmile" name='molSmile' value={molSmileString} onChange={e => setMolSmileString(e.target.value)} />
                            <Button type='submit'>Submit</Button>
                        </div>
                        {errorMol && <Message severity="error" text="Invalid Molecule" />}
                    </div>
                </form>
            </div>

            <div className="card b-1">
                {errorInterpret && <Message severity="error" text={errorInterpret.message} />}
                {errorPredict && <Message severity="error" text={errorPredict.message} />}
                {(loadingInterpret || loadingPredict) && <ProgressSpinner />}

                {results && (
                    <div className="grid grid-nogutter">
                        {results.map((r, i) => (
                            <div key={r.species} className="col-12 md:col-6 p-0 md:p-2"> {/* <- gap on md+ */}
                                {speciesCard(r, i)}
                            </div>
                        ))}
                    </div>
                )}

            </div>
        </div>
    );
}
