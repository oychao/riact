import React, { useState, createRef } from 'react';

const la = [{
  name: 'Andre Medina',
  email: 'dohnogudo@rusu.pt'
}, {
  name: 'Phoebe Luna',
  email: 'ovezowac@umlah.kg'
}, {
  name: 'Henry Cohen',
  email: 'vemhodhe@riifog.vg'
}, {
  name: 'Emma Larson',
  email: 'ifsi@ruhepa.mo'
}, {
  name: 'Willie Zimmerman',
  email: 'luz@bufepop.ca'
}];

const lb = [{
  name: 'Andre Medina',
  email: 'dohnogudo@rusu.pt'
}, {
  name: 'Maggie Haynes',
  email: 'wetovgar@menbitove.fk'
}, {
  name: 'Henry Cohen',
  email: 'vemhodhe@riifog.vg'
}, {
  name: 'Willie Zimmerman',
  email: 'luz@bufepop.ca'
}];

const List = function(props: common.TObject): JSX.Element {
  const [ listValue, setListValue ] = useState(la);

  setTimeout(() => {
    setListValue(listValue === la ? lb : la);
  }, 1e3);

  return (
    <div>
      <ol>
        {listValue.map((val: any): JSX.Element => (<li key={val.email}>{val.name}</li>))}
      </ol>
    </div>
  );
};

export default List;
