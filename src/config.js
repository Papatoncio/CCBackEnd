//Importación config
import { config } from 'dotenv';

config(); //Permitir configuración

//Exportar configuración de mongodbURL y SECRET
export default {
    SECRET: 'sammyshop-api' //Palabra secreta para generación de token
}