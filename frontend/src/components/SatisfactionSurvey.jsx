import React from 'react';

export default function SatisfactionSurvey({ onSubmit }){
  const [score, setScore] = React.useState(5);
  return (
    <div>
      <h4>Pesquisa de Satisfação</h4>
      <input type="range" min={1} max={5} value={score} onChange={e=>setScore(Number(e.target.value))} />
      <div>Nota: {score}</div>
      <button onClick={()=>onSubmit(score)}>Enviar</button>
    </div>
  );
}
