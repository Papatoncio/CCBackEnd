export function generarRespuesta(estado, mensaje, objeto, token, twofa, expiro) {
    return {
        "estado": estado,
        "mensaje": mensaje,
        "objeto": objeto,
        "token": token,
        "twofa": twofa,
        "expiro": expiro
    };
}