const auth = '$VUE_APP_LENTICULAR_LENS_AUTH';
const title = '$VUE_APP_LENTICULAR_LENS_TITLE';
const subTitle = '$VUE_APP_LENTICULAR_LENS_SUB_TITLE';
const authText = '$VUE_APP_LENTICULAR_LENS_AUTH_TEXT';
const lenticularLensApi = '$VUE_APP_LENTICULAR_LENS_API';

export const isAuthEnabled = () => getVar(auth) && getVar(auth).trim().toLowerCase() === 'true';
export const getTitle = () => getVar(title);
export const getSubTitle = () => getVar(subTitle);
export const getAuthText = () => getVar(authText);
export const getLenticularLensApi = () => getVar(lenticularLensApi);

function getVar(key) {
    if (key.startsWith('$VUE_APP_'))
        return process.env[key.substring(1)];
    return key;
}
