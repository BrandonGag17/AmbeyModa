import { useEffect, useState } from "react";

function Cuenta() {
  const [usuario, setUsuario] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [esAdmin, setEsAdmin] = useState(false);

  useEffect(() => {
    const adminGuardado = localStorage.getItem("esAdmin");
    if (adminGuardado === "true") {
      setEsAdmin(true);
    }
  }, []);

  function iniciarSesion() {
    if (usuario === "adrianita" && contrasena === "shajor") {
      setEsAdmin(true);
      localStorage.setItem("esAdmin", "true");
    } else {
      alert("Usuario o contraseña incorrectos");
      setEsAdmin(false);
      localStorage.removeItem("esAdmin");
    }
  }

  return (
    <div>
      <div>
        <h2>Ingresa a tu cuenta</h2>
        <input
          type="text"
          placeholder="Usuario"
          value={usuario}
          onChange={(e) => setUsuario(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={contrasena}
          onChange={(e) => setContrasena(e.target.value)}
        />
        <button onClick={iniciarSesion}>Iniciar sesión</button>
        {esAdmin && <p>Modo Mame Sheine activado.</p>}
      </div>
    </div>
  );
}

export default Cuenta;