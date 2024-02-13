export function generarRespuesta(estado, mensaje, objeto, token) {
    return {
        "estado": estado,
        "mensaje": mensaje,
        "objeto": objeto,
        "token": token
    };
}