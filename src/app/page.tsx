"use client"
import { InputText } from 'primereact/inputtext';  
import { FormEvent, useEffect, useState } from 'react';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { gql, useApolloClient, useLazyQuery, useQuery } from '@apollo/client';
import {SingleView, Molecule} from '@/lib/xsmiles/src/modules/SingleView';
import { Method } from '@/lib/xsmiles/src/types/molecule.types';
import { ProgressSpinner } from 'primereact/progressspinner';
import { RDKitModule } from '@rdkit/rdkit';
import { defaultGradientConfig } from '@/lib/consts'

export default function Home() {
  const [molSmile, setMolSmile] = useState("")
  const [mol, setMol] = useState<Molecule>()
  const [errorMol, setErrorMol] = useState(false)
  const [rdkit, setRDKit] = useState<RDKitModule>();

  const queryInterpret = gql`query ($molSmile: String!){ interpretPermeabilityByAtoms(molSmile:$molSmile) }`
  const queryPredict = gql`query ($molSmile: String!){ predictPermeabilityByAtoms(molSmile:$molSmile) }`
  const [getInterpret, {loading: loadingInterpret, error: errorInterpret, data: dataInterpret}] = useLazyQuery(queryInterpret) 
  const [getPredict, {loading: loadingPredict, error: errorPredict, data: dataPredict}] = useLazyQuery(queryPredict) 

  const met: Method = {
    name: "Permeability",
    scores: dataInterpret == undefined ? undefined: dataInterpret.interpretPermeabilityByAtoms,
    attributes: {}
  }
  const molecule: Molecule = {
    string: molSmile,
    method: met,
    attributes: {}
  }

  useEffect(() => {
    window.initRDKitModule().then((RDKit: RDKitModule) => {
      window.RDKit = RDKit
      setRDKit(RDKit);
    });
  }, []);

  function handleInputSubmit(e: FormEvent) {
    e.preventDefault();
    if (rdkit) {
      const rdkitMol = rdkit.get_mol(molSmile)
      if (rdkitMol == null) {
        setErrorMol(true)
      }
      else {
        getInterpret({variables:{molSmile: molSmile}})
        getPredict({variables:{molSmile: molSmile}})
        setErrorMol(false)
      }
    }
    
  }
  return (
    <div>
      <h1>MycoPermeNet</h1>
      <div className="card flex justify-content">
        <form onSubmit={handleInputSubmit}>
          <div className="flex flex-column gap-2">
            <label htmlFor="molSmile">Molecule SMILES</label>
            <div className='flex flex-row gap-2'>
              <InputText invalid={errorMol} id="molSmile" name='molSmile' value={molSmile} onChange={e => setMolSmile(e.target.value)}/>
              <Button type='submit'>Submit</Button>
            </div>
            {errorMol && <Message severity="error" text="Invalid Molecule" />}
          </div>
        </form>
      </div>

      <div className="flex flex-column m-1">
        {errorPredict &&  <Message severity="error" text={errorPredict.message} />}
        { loadingPredict && <ProgressSpinner />}
            { dataPredict &&
              <div style={{alignItems: 'center'}}>
                  <h2 style={ {textAlign: 'center'} }>
                      { dataPredict.predictPermeabilityByAtoms.toFixed(2) + " / 1.0" }
                  </h2>
              </div>     
            }
      </div>
      <div className='align-items-center'>
        { errorInterpret &&  <Message severity="error" text={errorInterpret.message} /> }
        { loadingInterpret && <ProgressSpinner />}
        {dataInterpret && <SingleView
        molecule={molecule}
        drawerType='RDKitDrawer'
        gradientConfig={defaultGradientConfig}
      />}
      </div>
    </div>
    
  );
}