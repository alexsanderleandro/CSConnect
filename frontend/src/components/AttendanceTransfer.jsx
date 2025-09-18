import React from 'react';

export default function AttendanceTransfer({ onTransfer }){
  const [toAnalyst, setToAnalyst] = React.useState('');
  return (
    <div>
      <h4>Transferir Atendimento</h4>
      <input value={toAnalyst} onChange={e=>setToAnalyst(e.target.value)} placeholder="ID analista" />
      <button onClick={()=>onTransfer(Number(toAnalyst))}>Transferir</button>
    </div>
  );
}
