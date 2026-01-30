"use client"
import { FormEvent, useEffect, useState } from 'react';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { gql, useApolloClient, useLazyQuery, useQuery } from '@apollo/client';
import {SingleView, Molecule} from '@/lib/xsmiles/src/modules/SingleView';
import { Method } from '@/lib/xsmiles/src/types/molecule.types';
import { defaultGradientConfig } from '@/lib/consts'
import { ProgressSpinner } from 'primereact/progressspinner';
import { InputTextarea } from 'primereact/inputtextarea';
import { DataView } from 'primereact/dataview';
import { classNames } from 'primereact/utils';
import { MoleculeItem } from './types';
import { RDKitModule } from '@rdkit/rdkit';


export default function Home() {
    const [molListString, setMolListString] = useState("")
    const [moleculeList, setMoleculeList] = useState<string[]>([])
    const [errorMol, setErrorMol] = useState(false)
    const [rdkit, setRDKit] = useState<RDKitModule>();

    const queryInterpret = gql`query ($molList: [String]!){ interpretPermeabilityOfListByAtoms(molList:$molList) }`
    const queryPredict = gql`query ($molList: [String]!){ predictPermeabilityOfListByAtoms(molList:$molList) }`
    const [getInterpret, {loading: loadingInterpret, error: errorInterpret, data: dataInterpret}] = useLazyQuery(queryInterpret) 
    const [getPredict, {loading: loadingPredict, error: errorPredict, data: dataPredict}] = useLazyQuery(queryPredict) 


    useEffect(() => {
        window.initRDKitModule().then((RDKit: RDKitModule) => {
            window.RDKit = RDKit
            setRDKit(RDKit);
        });
    }, []);

    function handleInputSubmit(e: FormEvent) {
        e.preventDefault();
        const molList: string[] = molListString.split("\n")

        molList.forEach((molSmile) => {
            if (rdkit) {
                let rdkitMol = rdkit.get_mol(molSmile)
                if (rdkitMol == null) {
                    setErrorMol(true)
                    return
                }
            }
        })
        getInterpret({variables:{molList: molList}})
        getPredict({variables:{molList: molList}})
    
        setErrorMol(false)

        setMoleculeList(molList)
    }

    const itemTemplate = (molecule: MoleculeItem, index: number) => {
        const met: Method = {
            name: "Permeability",
            scores: molecule.interpretScores,
            attributes: {}
        }

        const molView: Molecule = {
            string: molecule.smile,
            method: met,
            attributes: {}
        }

        return (
            <div className="col-12 card shadow-2 h-15rem mx-auto border-round" key={molecule.smile}>
                <div className={classNames('flex flex-column xl:flex-row xl:align-items-center p-4 gap-4', { 'border-top-1 surface-border': index !== 0 })}>
                    <div className="flex flex-row align-items-center xl:align-items-start flex-1 gap-4">
                        <div className="text-l font-bold text-600 align-items-center">{molecule.smile}</div>
                        <div className="w-8 justify-content-center h-9rem flex flex-row vertical-align-middle">
                            <SingleView molecule={molView} drawerType='RDKitDrawer' gradientConfig={defaultGradientConfig} width={1000} height={120} hideAttributesTable hideBarChart/>
                        </div>
                        <span className="text-l font-semibold vertical-align-middle">{molecule.predictScore}</span>
                    </div>

                </div>
                
            </div>
        );  
    };

    const multipleSpeciesTemplate = (molList: string[]) => {
        if (!molList || molList.length === 0) return null;

        const molListData: MoleculeItem[] = []
        molList.forEach((smile: string, index: number) => {
            const molItem: MoleculeItem = {
                smile: smile,
                predictScore: dataPredict ? dataPredict.predictPermeabilityOfListByAtoms[index]: undefined,
                interpretScores: dataInterpret ? dataInterpret.intepretPermeabilityOfListByAtoms[index]: undefined
            }
            molListData.push(molItem)
        })
    }

    const listTemplate = (molList: string[]) => {
        if (!molList || molList.length === 0) return null;
        
        const molListData: MoleculeItem[] = []
        molList.forEach((smile: string, index: number) => {
            const molItem: MoleculeItem = {
                smile: smile,
                predictScore: dataPredict ? dataPredict.predictPermeabilityOfListByAtoms[index]: undefined,
                interpretScores: dataInterpret ? dataInterpret.interpretPermeabilityOfListByAtoms[index]: undefined,
            }
            molListData.push(molItem)
        })


        let list = molListData.map((molecule, index) => {
            return itemTemplate(molecule, index);
        });

        return <div className="grid grid-nogutter">{list}</div>;
    };

    return (
    <div>
        <h1>MycoPermeNet</h1>
        <div className="card flex justify-content">
        <form onSubmit={handleInputSubmit}>
            <div className="flex flex-column gap-2">
            <label htmlFor="molSmile">List of Molecule SMILES</label>
            <div className='flex flex-row gap-2'>
                <InputTextarea invalid={errorMol} id="molSmile" name='molSmile' value={molListString} onChange={e => setMolListString(e.target.value)}/>
                <Button type='submit'>Submit</Button>
            </div>
            {errorMol && <Message severity="error" text="Invalid Molecule" />}
            </div>
        </form>
        </div>

        <div className="card b-1">
            { errorInterpret &&  <Message severity="error" text={errorInterpret.message} /> }
            { errorPredict &&  <Message severity="error" text={errorPredict.message} /> }
            { (loadingInterpret || loadingPredict) && <ProgressSpinner />}
            {dataInterpret && dataPredict && 
                <DataView value={moleculeList} listTemplate={listTemplate} />
            }
        </div>
        
    </div>

    );
}
