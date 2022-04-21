export async function doLogin(email, password) {
    return new Promise((resolve, reject) => {
        if(email === 'davidsousaalves@gmail.com'
        && password === '123456'){
            return resolve(true);
        }
        return reject(`Invalid user and/or password!`);
    })
}