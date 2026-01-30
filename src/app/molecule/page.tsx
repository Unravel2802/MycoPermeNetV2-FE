"use client"
import { Slider } from 'primereact/slider';
import {moleculeDescriptorsInfo, descriptor, descriptorNames} from './consts'
import { useEffect, useState } from 'react';
import { InputNumber } from 'primereact/inputnumber';
import { gql, useQuery } from '@apollo/client';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Chart } from 'primereact/chart';
import { Message } from 'primereact/message';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { RDKitModule } from '@rdkit/rdkit';
import { defaultGradientConfig } from '@/lib/consts';
import {SingleView, Molecule} from '@/lib/xsmiles/src/modules/SingleView';
import { Method } from '@/lib/xsmiles/src/types/molecule.types';

export default function MoleculeDescriptors() {
    const [rdkit, setRDKit] = useState<RDKitModule>();
    const queryInterpret = gql`query ($descriptors: Descriptors!){ interpretPermeabilityByMolecularDescriptors(descriptors:$descriptors) }`
    const queryPredict = gql`query ($descriptors: Descriptors!){ predictPermeabilityByMolecularDescriptors(descriptors:$descriptors) }`
    const querySimilar = gql`query ($descriptors: Descriptors!){ findSimilarMoleculesByMolecularDescriptors(descriptors:$descriptors) }`
    const [descriptorInputs, setDescriptorInputs] = useState(moleculeDescriptorsInfo)
    
    const {loading: loadingInterpret, error: errorInterpret, data: dataInterpret} = useQuery(queryInterpret, {variables:{descriptors: descriptorInputs.map((e) => e.value)}})
    const {loading: loadingPredict, error: errorPredict, data: dataPredict} = useQuery(queryPredict, {variables:{descriptors: descriptorInputs.map((e) => e.value)}})
    const {loading: loadingSimilar, error: errorSimilar, data: dataSimilar} = useQuery(querySimilar, {variables:{descriptors: descriptorInputs.map((e) => e.value)}})
    
    const chartData = {labels: moleculeDescriptorsInfo.map((e)=> e.descriptor), datasets: [{label: 'Interpretation Values', data: dataInterpret && dataInterpret.interpretPermeabilityByMolecularDescriptors}]}
    
    const handleInputChange = (index: number, val: number) => {
        const newdescriptorInputs = [...descriptorInputs];
        newdescriptorInputs[index].value = val;
        setDescriptorInputs(newdescriptorInputs);
    };

    useEffect(() => {
        window.initRDKitModule().then((RDKit: RDKitModule) => {
            window.RDKit = RDKit
            setRDKit(RDKit);
        });
    }, []);

    function mapFunc(row:any) {
        if (rdkit) {
            let mol = rdkit.get_mol(row[0]);
            if (mol) {
                let svg = mol.get_svg();
                return {'smile':svg, 'distance':row[1]}
            }  
        }
    }

    function renderMolImage (rowData:any) {
        if (rdkit) {
            const met: Method = {
                name: "Permeability",
                scores: [],
                attributes: {}
            }

            const molView: Molecule = {
                string: rowData.smile,
                method: met,
                attributes: {}
            }
            return (
                <SingleView molecule={molView} drawerType='RDKitDrawer' gradientConfig={defaultGradientConfig} hideAttributesTable hideBarChart/>
            )
        }
        else {
            return rowData.smile
        }
    }

    return (
        <div>
            <h1>Molecule MycoPermeNet</h1>
            <div className="flex flex-column-2">
                <div className="flex flex-column gap-2 w-3 m-1">
                    {descriptorInputs.map((desc, idx) => (
                        <div className="flex flex-column gap-2 m-2" key={desc.descriptor+'div'}>
                            <label htmlFor={desc.descriptor} key={desc.descriptor+'label'}>{desc.descriptor}</label>
                            <InputNumber value={desc.value} id={desc.descriptor} min={desc.info.min}  max={desc.info.max} step={desc.info.step} onChange={(event) => handleInputChange(idx, event.value!)} key={desc.descriptor+'input'}/>
                            <Slider value={desc.value} min={desc.info.min} max={desc.info.max} step={desc.info.step} required onChange={(event) => handleInputChange(idx, typeof event.value == 'number' ? event.value: event.value[0])} key={desc.descriptor+'slider'}/>
                        </div>
                    ))
                    }
                </div>
                <div className="flex flex-column gap-2 h-2 w-7 m-1">
                    <div className="flex flex-column gap-2 m-1">
                        {errorPredict &&  <Message severity="error" text={errorPredict.message} />}
                        { loadingPredict && <ProgressSpinner />}
                            { dataPredict &&
                            <div style={{alignItems: 'center'}}>
                                <h2 style={ {textAlign: 'center'} }>
                                    { dataPredict.predictPermeabilityByMolecularDescriptors.toFixed(2) + " / 3.0" }
                                </h2>
                            </div> 
                                
                            }
                    </div>
                    <div className='align-items-center'>
                        { errorInterpret &&  <Message severity="error" text={errorInterpret.message} /> }
                        { loadingInterpret && <ProgressSpinner />}
                        { dataInterpret && 
                        <Chart type='bar' data={chartData} height='175%' options={{indexAxis: 'y'}}></Chart>
                        }
                    </div>

                    <div className='align-items-center'>
                        { errorSimilar &&  <Message severity="error" text={errorSimilar.message} /> }
                        { loadingSimilar && <ProgressSpinner />}
                        { dataSimilar &&
                        <DataTable value={dataSimilar.findSimilarMoleculesByMolecularDescriptors.map((row: any) => ({"smile": row[0], "distance": row[1]}))}>
                            <Column field="smile" header="Smile" body={renderMolImage}></Column>
                            <Column field="distance" header="Distance"></Column>
                        </DataTable>
                        }
                    </div>
                    
                </div>
            </div>
        </div>
    ); 
}