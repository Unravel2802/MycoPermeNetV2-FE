"use client"
import { InputText } from 'primereact/inputtext';  
import { FormEvent, useEffect, useState } from 'react';
import { Message } from 'primereact/message';
import { Button } from 'primereact/button';
import { gql, useLazyQuery } from '@apollo/client';
import { ProgressSpinner } from 'primereact/progressspinner';
import { RDKitModule } from '@rdkit/rdkit';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';

export default function Home() {
  const [molSmile, setMolSmile] = useState("")
  const [errorMol, setErrorMol] = useState(false)
  const [rdkit, setRDKit] = useState<RDKitModule>();

  const queryTanimotoScores = gql`query ($molSmiles: String!){ findSimilarMoleculesByTanimotoSimilarity(molSmiles:$molSmiles) }`
  const [getTanimotoScores, {loading: loadingTanimotoScores, error: errorTanimotoScores, data: dataTanimotoScores}] = useLazyQuery(queryTanimotoScores) 

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
        getTanimotoScores({variables:{molSmiles: molSmile}})
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

      <div className='align-items-center'>
        { errorTanimotoScores &&  <Message severity="error" text={errorTanimotoScores.message} /> }
        { loadingTanimotoScores && <ProgressSpinner />}
        {dataTanimotoScores && 
        <DataTable paginator sortField="maccs" sortOrder={-1} rows={10} value={dataTanimotoScores.findSimilarMoleculesByTanimotoSimilarity.map((row: any) => ({"smiles": row[0], "maccs": row[1], 'avalon':row[2], 'morgan':row[3], 'atom_pair':row[4], 'topological':row[5], 'rdkit':row[6]}))}>
          <Column field='smiles' header="Molecule" sortable></Column>
          <Column field='maccs' header="Maccs" sortable></Column>
          <Column field='avalon' header="Avalon" sortable></Column>
          <Column field='morgan' header="Morgan" sortable></Column>
          <Column field='atom_pair' header="Atom Pair" sortable></Column>
          <Column field='topological' header="Topological" sortable></Column>
          <Column field='rdkit' header="RDKit" sortable></Column>
        </DataTable>}
      </div>
      
    </div>
    
  );
}
