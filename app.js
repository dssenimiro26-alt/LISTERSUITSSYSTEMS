const KEY = 'listerSuitsERP.v1';
const demoProducts = [
 {id:1,name:'Classic Slim-Fit Suit',colour:'Navy Blue',size:'40 / Medium',price:350000,stock:8},
 {id:2,name:'Formal Black Suit',colour:'Black',size:'42 / Large',price:420000,stock:5},
 {id:3,name:'Modern Grey Suit',colour:'Charcoal Grey',size:'40 / Medium',price:380000,stock:6}
];
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{products:demoProducts,customers:[],sales:[]}}catch(e){return {products:demoProducts,customers:[],sales:[]}}}
let db=load();
function save(){localStorage.setItem(KEY,JSON.stringify(db));}
function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function money(v){return 'UGX '+Number(v||0).toLocaleString('en-UG',{maximumFractionDigits:0});}
function id(){return Date.now()+Math.floor(Math.random()*1000);}
function del(type,itemId){if(!confirm('Delete this record?'))return;db[type]=db[type].filter(x=>x.id!==itemId);save();renderAll();}
function renderDashboard(){
 const el=id=>document.getElementById(id);
 if(!el('productCount'))return;
 el('productCount').textContent=db.products.length;
 el('customerCount').textContent=db.customers.length;
 el('saleCount').textContent=db.sales.length;
 el('revenue').textContent=money(db.sales.reduce((a,s)=>a+s.total,0));
 const rows=db.sales.slice().sort((a,b)=>b.id-a.id).slice(0,5);
 el('recentSales').innerHTML=rows.length?rows.map(s=>`<tr><td>${esc(s.date)}</td><td>${esc(s.customerName||'Walk-in')}</td><td>${esc(s.productName)}</td><td>${money(s.total)}</td></tr>`).join(''):'<tr><td colspan="4" class="empty">No sales recorded yet.</td></tr>';
}
function renderProducts(){
 const body=document.getElementById('productRows');if(!body)return;
 const q=(document.getElementById('productSearch')?.value||'').toLowerCase();
 const list=db.products.filter(p=>[p.name,p.colour,p.size].join(' ').toLowerCase().includes(q));
 document.getElementById('productSummary').textContent=`${db.products.length} style(s) saved`;
 body.innerHTML=list.length?list.map(p=>`<tr><td><strong>${esc(p.name)}</strong></td><td>${esc(p.colour)}</td><td>${esc(p.size)}</td><td>${money(p.price)}</td><td><span class="tag">${p.stock} in stock</span></td><td><button class="delete" onclick="del('products',${p.id})">Delete</button></td></tr>`).join(''):'<tr><td colspan="6" class="empty">No matching products.</td></tr>';
}
function renderCustomers(){
 const body=document.getElementById('customerRows');if(!body)return;
 const q=(document.getElementById('customerSearch')?.value||'').toLowerCase();
 const list=db.customers.filter(c=>[c.name,c.phone,c.email,c.notes].join(' ').toLowerCase().includes(q));
 document.getElementById('customerSummary').textContent=`${db.customers.length} customer(s) saved`;
 body.innerHTML=list.length?list.map(c=>`<tr><td><strong>${esc(c.name)}</strong></td><td>${esc(c.phone||'—')}</td><td>${esc(c.email||'—')}</td><td>${esc(c.notes||'—')}</td><td><button class="delete" onclick="del('customers',${c.id})">Delete</button></td></tr>`).join(''):'<tr><td colspan="5" class="empty">No customers saved yet.</td></tr>';
}
function renderSaleOptions(){
 const customers=document.getElementById('saleCustomer'),products=document.getElementById('saleProduct');
 if(customers){const val=customers.value;customers.innerHTML='<option value="">Walk-in customer</option>'+db.customers.map(c=>`<option value="${c.id}">${esc(c.name)}</option>`).join('');customers.value=val;}
 if(products){const val=products.value;products.innerHTML='<option value="">Choose a suit</option>'+db.products.map(p=>`<option value="${p.id}">${esc(p.name)} — ${esc(p.colour)} (${p.stock} in stock)</option>`).join('');products.value=val;}
}
function renderSales(){
 const body=document.getElementById('salesRows');if(!body)return;
 document.getElementById('salesSummary').textContent=`${db.sales.length} sale(s) recorded`;
 body.innerHTML=db.sales.length?db.sales.slice().sort((a,b)=>b.id-a.id).map(s=>`<tr><td>${esc(s.date)}</td><td>${esc(s.customerName||'Walk-in')}</td><td>${esc(s.productName)}</td><td>${s.quantity}</td><td>${money(s.total)}</td><td><button class="delete" onclick="del('sales',${s.id})">Delete</button></td></tr>`).join(''):'<tr><td colspan="6" class="empty">No sales recorded yet.</td></tr>';
}
function setupForms(){
 const pf=document.getElementById('productForm');if(pf)pf.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(pf);db.products.push({id:id(),name:f.get('name').trim(),colour:f.get('colour').trim(),size:f.get('size').trim(),price:Number(f.get('price')),stock:Number(f.get('stock'))});save();pf.reset();renderAll();alert('Suit added to inventory.');});
 const cf=document.getElementById('customerForm');if(cf)cf.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(cf);db.customers.push({id:id(),name:f.get('name').trim(),phone:f.get('phone').trim(),email:f.get('email').trim(),notes:f.get('notes').trim()});save();cf.reset();renderAll();alert('Customer saved.');});
 const sf=document.getElementById('saleForm');if(sf){
  const product=document.getElementById('saleProduct'),qty=sf.elements.quantity,price=document.getElementById('salePrice');
  document.getElementById('saleDate').value=new Date().toISOString().slice(0,10);
  function updateTotal(){document.getElementById('saleTotal').textContent=money(Number(qty.value||0)*Number(price.value||0));}
  product.addEventListener('change',()=>{const p=db.products.find(p=>p.id===Number(product.value));if(p)price.value=p.price;updateTotal();});
  qty.addEventListener('input',updateTotal);price.addEventListener('input',updateTotal);updateTotal();
  sf.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(sf),p=db.products.find(p=>p.id===Number(f.get('product'))),quantity=Number(f.get('quantity'));if(!p){alert('Please choose a suit.');return;}if(quantity>p.stock){alert('Not enough stock available.');return;}const c=db.customers.find(c=>c.id===Number(f.get('customer')));const unit=Number(f.get('price'));db.sales.push({id:id(),date:f.get('date'),customerName:c?c.name:'Walk-in',productName:p.name+' ('+p.colour+')',quantity,unitPrice:unit,total:quantity*unit});p.stock-=quantity;save();sf.reset();renderAll();document.getElementById('saleDate').value=new Date().toISOString().slice(0,10);updateTotal();alert('Sale recorded and stock updated.');});
 }
 const ps=document.getElementById('productSearch');if(ps)ps.addEventListener('input',renderProducts);
 const cs=document.getElementById('customerSearch');if(cs)cs.addEventListener('input',renderCustomers);
}
function renderAll(){renderDashboard();renderProducts();renderCustomers();renderSaleOptions();renderSales();}
setupForms();renderAll();
