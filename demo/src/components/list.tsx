import React, { useState } from 'riact';

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
  name: 'Willie Zimmerman',
  email: 'luz@bufepop.ca'
}];

const lb = [{
  name: 'Henry Cohen',
  email: 'vemhodhe@riifog.vg'
}, {
  name: 'Andre Medina',
  email: 'dohnogudo@rusu.pt'
}, {
  name: 'Phoebe Luna',
  email: 'ovezowac@umlah.kg'
}, {
  name: 'Willie Zimmerman123123',
  email: 'luz@bufepop.ca'
}];

const List = React.memo(function(props: Riact.TObject): JSX.Element {
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
});

export default List;
