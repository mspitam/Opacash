import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import './style.css';

const BANKS = ['Access Bank','First Bank of Nigeria','Guaranty Trust Bank (GTBank)','United Bank for Africa (UBA)','Zenith Bank','Fidelity Bank','Union Bank','Sterling Bank','Wema Bank','Kuda Bank','Moniepoint MFB','Opay'];
// Clearly fictional test fixtures. These are NOT linked to bank records.
const TEST_ACCOUNTS = {
  '0123456789':'AMINA BELLO',
  '0001234567':'CHUKWUEMEKA OKAFOR',
  '1234567890':'TEST RECIPIENT'
};
const initial = {name:'Your Name', balance:250000000, tx:[{id:1,title:'Welcome balance',date:new Date().toLocaleDateString(),amount:250000000,type:'credit'}], beneficiaries:[]};
function App(){
 const [pin,setPin]=useState(localStorage.getItem('opacash_pin')||'');
 const [entered,setEntered]=useState(false);
 const [pinInput,setPinInput]=useState('');
 const [data,setData]=useState(()=>{try{return {...initial,...(JSON.parse(localStorage.getItem('opacash_data')||'null')||{})}}catch{return initial}});
 const [name,setName]=useState(data.name);
 const [amount,setAmount]=useState(String((data.balance/100).toFixed(2)));
 const [activity,setActivity]=useState('');
 const [tab,setTab]=useState('home');
 const [bank,setBank]=useState(BANKS[0]);
 const [acct,setAcct]=useState('');
 const [recipient,setRecipient]=useState('');
 const [transferAmount,setTransferAmount]=useState('');
 const [verified,setVerified]=useState(false);
 const [beneficiaryName,setBeneficiaryName]=useState('');
 useEffect(()=>{localStorage.setItem('opacash_data',JSON.stringify(data));},[data]);
 useEffect(()=>{if('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(()=>{});},[]);
 const money=n=>'₦'+(Number(n||0)/100).toLocaleString('en-NG',{minimumFractionDigits:2,maximumFractionDigits:2});
 function notify(s){setActivity(s);setTimeout(()=>setActivity(''),2600)}
 function saveProfile(){setData(d=>({...d,name:name.trim()||d.name}));notify('Account name updated');}
 function setBalance(){const n=Number(amount);if(!Number.isFinite(n)||n<0){notify('Enter a valid amount');return;}const k=Math.round(n*100);setData(d=>({...d,balance:k,tx:[{id:Date.now(),title:'Balance adjustment',date:new Date().toLocaleString(),amount:Math.abs(k-d.balance),type:k>=d.balance?'credit':'debit'},...d.tx]}));notify('Displayed balance updated');}
 function move(type){const raw=prompt(`Enter ${type} amount in naira`);if(raw===null)return;const n=Number(raw);if(!Number.isFinite(n)||n<=0){notify('Enter a valid amount');return;}const k=Math.round(n*100);setData(d=>({...d,balance:type==='Deposit'?d.balance+k:Math.max(0,d.balance-k),tx:[{id:Date.now(),title:type,date:new Date().toLocaleString(),amount:k,type:type==='Deposit'?'credit':'debit'},...d.tx]}));}
 function verify(){setVerified(false);setRecipient('');if(!/^\d{10}$/.test(acct)){notify('Enter a 10-digit account number');return;}const found=TEST_ACCOUNTS[acct];if(!found){notify('No matching sample account. Try 0123456789 or 0001234567');return;}setRecipient(found);setVerified(true);notify('Sample account name found');}
 function doTransfer(){const n=Number(transferAmount);if(!verified||!recipient){notify('Verify a sample account first');return;}if(!Number.isFinite(n)||n<=0){notify('Enter a valid amount');return;}const k=Math.round(n*100);if(k>data.balance){notify('Insufficient displayed balance');return;}setData(d=>({...d,balance:d.balance-k,tx:[{id:Date.now(),title:`Transfer to ${recipient} · ${bank}`,date:new Date().toLocaleString(),amount:k,type:'debit'},...d.tx]}));setTransferAmount('');setAcct('');setRecipient('');setVerified(false);notify('Simulated transfer completed');setTab('history');}
 function saveBeneficiary(){if(!verified){notify('Verify a sample account first');return;}setData(d=>({...d,beneficiaries:[{id:Date.now(),name:recipient,bank,account:acct},...(d.beneficiaries||[])]}));notify('Beneficiary saved');}
 function login(){if(!pin){if(!/^\d{4,8}$/.test(pinInput)){alert('Choose a PIN with 4–8 digits');return;}localStorage.setItem('opacash_pin',pinInput);setPin(pinInput);setEntered(true);}else if(pinInput===pin){setEntered(true);}else alert('Incorrect PIN');}
 if(!entered)return <main className="login"><div className="brandmark">O</div><h1>OpaCash</h1><p>Your personal finance dashboard</p><input type="password" inputMode="numeric" maxLength="8" placeholder={pin?'Enter your PIN':'Create a private PIN'} value={pinInput} onChange={e=>setPinInput(e.target.value)}/><button onClick={login}>{pin?'Unlock':'Create PIN'}</button><small>Personal prototype stored on this device.</small></main>;
 const nav=[['home','Home','⌂'],['transfer','Transfer','⇄'],['banks','Banks','▤'],['beneficiaries','Beneficiaries','♡'],['history','History','◷']];
 return <main className="app"><header><div className="brand"><span className="brandmark small">O</span><b>OpaCash</b></div><button className="logout" onClick={()=>setEntered(false)}>Lock</button></header>
 {tab==='home'&&<><section className="hero"><div className="eyebrow">AVAILABLE BALANCE</div><h1>{money(data.balance)}</h1><div className="account">{data.name}</div><div className="accountno">PERSONAL ACCOUNT · TEST PROFILE</div></section><section className="actions"><button onClick={()=>move('Deposit')}><i>＋</i>Deposit</button><button onClick={()=>move('Withdrawal')}><i>↗</i>Withdraw</button></section><section className="panel"><h2>Account settings</h2><label>Account display name</label><input value={name} onChange={e=>setName(e.target.value)}/><button className="secondary" onClick={saveProfile}>Save name</button><label>Set displayed balance (₦)</label><input inputMode="decimal" value={amount} onChange={e=>setAmount(e.target.value)}/><button onClick={setBalance}>Update balance</button><p className="hint">Personal prototype. Balances and transactions are fictional. No bank connection or real payments.</p></section><section className="panel"><h2>Recent activity</h2>{data.tx.slice(0,4).map(t=><Tx key={t.id} t={t} money={money}/>)}</section></>}
 {tab==='transfer'&&<section className="panel page"><h2>Transfer</h2><p className="muted">Try account-name lookup using the built-in sample records.</p><label>Recipient bank</label><select value={bank} onChange={e=>{setBank(e.target.value);setVerified(false);setRecipient('')}}>{BANKS.map(b=><option key={b}>{b}</option>)}</select><label>Account number</label><input inputMode="numeric" maxLength="10" placeholder="Enter 10-digit account number" value={acct} onChange={e=>{setAcct(e.target.value.replace(/\D/g,'').slice(0,10));setVerified(false);setRecipient('')}}/><button className="secondary" onClick={verify}>Verify account name</button>{verified&&<div className="verified"><b>✓ Sample account name</b><strong>{recipient}</strong><small>Test fixture only — not retrieved from actual bank records.</small></div>}<label>Amount (₦)</label><input inputMode="decimal" placeholder="0.00" value={transferAmount} onChange={e=>setTransferAmount(e.target.value)}/><button disabled={!verified} onClick={doTransfer}>Continue with simulated transfer</button><button className="textbtn" disabled={!verified} onClick={saveBeneficiary}>Save as beneficiary</button><p className="hint">No funds move. This only updates the fictional balance and history stored on this device.</p></section>}
 {tab==='banks'&&<section className="panel page"><h2>Banks</h2><p className="muted">Banks available in this prototype's selector.</p>{BANKS.map(b=><button className="bankrow" key={b} onClick={()=>{setBank(b);setTab('transfer')}}><span className="bankicon">▤</span>{b}<span>›</span></button>)}</section>}
 {tab==='beneficiaries'&&<section className="panel page"><h2>Beneficiaries</h2>{(data.beneficiaries||[]).length===0?<p className="muted">No saved beneficiaries yet. Verify a sample recipient in Transfer and choose Save as beneficiary.</p>:(data.beneficiaries||[]).map(b=><div className="tx" key={b.id}><div><b>{b.name}</b><small>{b.bank} · {b.account}</small></div><button className="secondary mini" onClick={()=>{setBank(b.bank);setAcct(b.account);setRecipient(b.name);setVerified(true);setTab('transfer')}}>Use</button></div>)}</section>}
 {tab==='history'&&<section className="panel page"><h2>Transaction history</h2>{data.tx.length===0?<p className="muted">No transactions yet.</p>:data.tx.map(t=><Tx key={t.id} t={t} money={money}/>)}</section>}
 <nav className="bottomnav">{nav.map(([id,label,ico])=><button key={id} className={tab===id?'active':''} onClick={()=>setTab(id)}><span>{ico}</span>{label}</button>)}</nav>
 {activity&&<div className="toast">{activity}</div>}
 </main>
}
function Tx({t,money}){return <div className="tx"><div><b>{t.title}</b><small>{t.date}</small></div><strong className={t.type}>{t.type==='credit'?'+':'−'}{money(t.amount)}</strong></div>}
createRoot(document.getElementById('root')).render(<App/>);
