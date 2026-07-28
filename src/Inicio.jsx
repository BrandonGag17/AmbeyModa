import ProductoCard from "./ProductoCard";

function Inicio() {
    const producto = {
        id: 1,
        nombre: "Remera Oversize",
        precio: 35000,
        imagen: "https://picsum.photos/300"
    };

    return (
        <div>
            <h1>Inicio</h1>
            <ProductoCard producto={producto} />
        </div>
    );
}

export default Inicio;