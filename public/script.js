// ----- REGISTER -----
document.getElementById('register-btn').addEventListener('click', async () => {
  const username = document.getElementById('reg-username').value;
  const password = document.getElementById('reg-password').value;

  const res = await fetch('/register', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  document.getElementById('reg-msg').textContent = data.message;
  if(data.success){ document.getElementById('register-box').style.display='none'; }
});

// ----- LOGIN -----
document.getElementById('login-btn').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/login', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({username, password})
  });
  const data = await res.json();
  document.getElementById('login-msg').textContent = data.message;
  if(data.success){
    document.getElementById('login-box').style.display='none';
    loadProducts();
  }
});

// ----- LAMP -----
let string = document.getElementById("string");
let lamp = document.getElementById("lamp");
let face = document.getElementById("face");
let isOn = true;
let startY=0, currentHeight=80;

string.addEventListener("mousedown", function(e){
  startY=e.clientY;
  document.onmousemove = function(e){
    let diff = e.clientY-startY;
    if(diff>0 && currentHeight<140){ currentHeight = 80+diff; string.style.height = currentHeight + "px"; }
  }
  document.onmouseup = function(){
    document.onmousemove=null;
    if(currentHeight>120){ isOn=!isOn; face.textContent = isOn?"😊":"😢"; }
    string.style.height="80px"; currentHeight=80;
  }
});

// ----- PRODUCTS -----
async function loadProducts(){
  const res = await fetch('/products');
  const products = await res.json();
  const container = document.getElementById('products');
  container.innerHTML='';
  products.forEach(p=>{
    const div = document.createElement('div');
    div.className='product-card';
    div.innerHTML=`
      <img src="${p.image_url}">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p>$${p.price}</p>
      <button onclick="buyProduct(${p.id})">Buy Now</button>
    `;
    container.appendChild(div);
  });
}

// ----- BUY PRODUCT -----
function buyProduct(id){
  const customer_name = prompt("Enter your name");
  const address = prompt("Enter delivery address");
  const email = prompt("Enter email (optional)");
  if(!customer_name || !address){ alert("Name and address required"); return; }

  fetch('/order',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ product_id:id, customer_name, address, email })
  }).then(res=>res.json()).then(data=>{ alert(data.message); });
}
