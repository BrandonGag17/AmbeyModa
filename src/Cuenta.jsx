import { useState } from "react";
import "./Cuenta.css";

function Cuenta() {
    const [usuario, setUsuario] = useState("");
    const [contrasena, setContrasena] = useState("");
    const [esAdmin, setEsAdmin] = useState(false);

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
        <div className="cuenta-page">
            <div className="cuenta-card">

                <p>Panel de administración</p>

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

                <button onClick={iniciarSesion}>
                    Iniciar sesión
                </button>

                {esAdmin &&
                    <span className="admin-ok">
                        ✓ Modo Mame Sheine activado
                    </span>
                }

            </div>
        </div>
    );
}

export default Cuenta;