
const API = "https://chatapplication-kptr.onrender.com";

function showSignup() {
  document.getElementById("login-form").style.display = "none";
  document.getElementById("signup-form").style.display = "block";
}

function showLogin() {
  document.getElementById("signup-form").style.display = "none";
  document.getElementById("login-form").style.display = "block";
}

async function login() {
  const Email = document.getElementById("login-email").value;
  const Password = document.getElementById("login-password").value;

  const res = await fetch(`${API}/api/auth/login`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Email, Password }),
  });

  if (res.ok) {
    window.location.href = "chat.html";
  } else {
    const err = await res.json();
    alert(err.message);
  }
}

async function signup() {
  const Name = document.getElementById("signup-name").value;
  const Email = document.getElementById("signup-email").value;
  const Password = document.getElementById("signup-password").value;

  const res = await fetch(`${API}/api/auth/signup`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ Name, Email, Password }),
  });

  if (res.ok) {
    window.location.href = "chat.html";
  } else {
    const err = await res.json();
    alert(err.message);
  }
}
