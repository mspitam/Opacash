import React, {useEffect, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const initial = {name:'Your Name', balance:2500000, tx:[
 {id:1,title:'Welcome balance',date:new Date().toLocaleDateString(),amount:2500000,type:'credit'}
]};
function App(){
 const [pin,setPin]=useState(localStorage.getItem('opacash_pin')||'');
 const [entered,setEntered]=useState(false);
 const [pinInput,setPinInput]=useState('');
 const [data,setData]=useState(()=>JSON.parse(localStorage.getItem('opacash_data')||'null')||initial);
 const [name,setName]=useState(data.name);
 const [amount,setAmount]=useState(String((data.balance/100).toFixed(2)));
 const [activity,setActivity]=useState('');
 useEffect(()=>{localStorage.setItem('opacash_data',JSON.stringify(data));},[data]);
 useEffect(()=>{if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});},[]);
 const money=n=>'₦'+Number(n/100).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2});
 function saveProfile(){setData(d=>({...d,name:name.trim()||d.name}));setActivity('Account name updated');}
 function setBalance(){const n=Number(amount);if(!Number.isFinite(n)||n<0){setActivity('Enter a valid amount');return;}const k=Math.round(n*100);setData(d=>({...d,balance:k,tx:[{id:Date.now(),title:'Balance adjustment',date:new Date().toLocaleString(),amount:Math.abs(k-d.balance),type:k>=d.balance?'credit':'debit'},...d.tx]}));setActivity('Displayed balance updated');}
 function move(type){const n=Number(prompt(`Enter ${type} amount in naira`));if(!Number.isFinite(n)||n<=0)return;const k=Math.round(n*100);setData(d=>({...d,balance:type==='Deposit'?d.balance+k:Math.max(0,d.balance-k),tx:[{id:Date.now(),title:type,date:new Date().toLocaleString(),amount:k,type:type==='Deposit'?'credit':'debit'},...d.tx]}));}
 function login(){if(!pin){if(pinInput.length<4){alert('Choose a PIN with at least 4 digits');return;}localStorage.setItem('opacash_pin',pinInput);setPin(pinInput);setEntered(true);}else if(pinInput===pin){setEntered(true);}else alert('Incorrect PIN');}
 if(!entered)return <main className="login"><div className="brandmark">O</div><h1>OpaCash</h1><p>Your personal finance dashboard</p><input type="password" inputMode="numeric" maxLength="8" placeholder={pin?'Enter your PIN':'Create a private PIN'} value={pinInput} onChange={e=>setPinInput(e.target.value)}/><button onClick={login}>{pin?'Unlock':'Create PIN'}</button><small>Private dashboard stored on this device.</small></main>;
 return <main className="app"><header><div className="brand"><span className="brandmark small">O</span><b>OpaCash</b></div><button className="logout" onClick={()=>setEntered(false)}>Lock</button></header>
 <section className="hero"><div className="eyebrow">AVAILABLE BALANCE</div><h1>{money(data.balance)}</h1><div className="account">{data.name}</div><div className="accountno">PERSONAL ACCOUNT</div></section>
 <section className="actions"><button onClick={()=>move('Deposit')}><i>＋</i>Deposit</button><button onClick={()=>move('Withdrawal')}><i>↗</i>Withdraw</button></section>
 <section className="panel"><h2>Account settings</h2><label>Account display name</label><input value={name} onChange={e=>setName(e.target.value)}/><button className="secondary" onClick={saveProfile}>Save name</button><label>Set displayed balance (₦)</label><input inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)}/><button onClick={setBalance}>Update balance</button><p className="hint">This is a personal visual simulator. It does not connect to a bank or move real money.</p></section>
 <section className="panel"><h2>Recent activity</h2>{data.tx.length===0?<p className="muted">No activity yet.</p>:data.tx.slice(0,12).map(t=><div className="tx" key={t.id}><div><b>{t.title}</b><small>{t.date}</small></div><strong className={t.type}>{t.type==='credit'?'+':'−'}{money(t.amount)}</strong></div>)}</section>
 {activity&&<div className="toast">{activity}</div>}
 </main>
}
createRoot(document.getElementById('root')).render(<App/>);