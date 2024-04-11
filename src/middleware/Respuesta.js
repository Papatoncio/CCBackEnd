export function generarRespuesta(estado, mensaje, objeto, token, twofa) {
    return {
        "estado": estado,
        "mensaje": mensaje,
        "objeto": objeto,
        "token": token,
        "twofa": twofa
    };
}