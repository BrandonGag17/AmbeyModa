function ProductoCard({ producto }) {
    console.log(producto);
    const { id, nombre, precio, imagen } = producto;
    return (
        <div>
            <img src={imagen} alt={nombre} />
            <h3>{nombre}</h3>
            <p>${precio}</p>
        </div>
    );
}

export default ProductoCard;