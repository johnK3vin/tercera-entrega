import { generateToken, authToken } from "../utils/jwt.js";

async function handleSuccessfulLogin(req, res, user) {
    req.session.passport.user = {
        _id: user._id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        age: user.age,
        rol: user.rol,
        welcome: true
    };

    const token = await generateToken(req.session.passport.user);

    res.cookie('jwtCookie', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 3600000
    });
    const userData = JSON.stringify(req.session.passport.user);
    
    res.cookie('userData', userData, {
        path: '/',
        httpOnly: false,
        secure: process.env.NODE_ENV !== 'development',
        maxAge: 3600000
    });
}

const login = async (req, res) => {
    try {
        if(!req.user){
            res.status(401).send({ resultado: 'Usuario invalido' });
        }
        
        await handleSuccessfulLogin(req, res, req.user);
        const token = await generateToken(req.user);
        res.status(200).json({
            redirectTo: '/home',
            payload: req.session.passport,
            firstLogin: true,
            token : token
        });
        

    } catch (error) {
        console.error('Hubo un error al iniciar sesión:', error);
        res.status(500).send({ mensaje: `Error al iniciar sesion ${error}` });
    }
}

const faillogin = (req, res) => {
    console.log('Error al iniciar sesión');
    res.send({error: 'Failed login'})
}

const github = (req, res) => { 
    res.status(200).send({ resultado: 'Usuario creado exitosamente.' });
}

const githubCallback = async (req, res) => {
    try {
        await handleSuccessfulLogin(req, res, req.user);
        res.redirect('/home');

    } catch (error) {
        console.error('Hubo un error al iniciar sesión con GitHub:', error);
        res.status(500).send({ mensaje: `Error al iniciar sesion ${error}` });
    }
}

const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error al destruir la sesión:", err);
            res.status(500).send({ resultado: 'Error interno al desloguear' });
        } else {
            res.clearCookie('userData', {
                path: '/',
                httpOnly: false,
                secure: process.env.NODE_ENV !== 'development',
                maxAge: 3600000}) ; 
            // Limpiar la cookie 'jwt'
            res.clearCookie('jwtCookie', {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development'
            });
            res.status(200).send({ resultado: 'Usuario deslogueado' });
        }
    });
    console.log("Sesión antes del logout:", req.session);
    req.logout(() => {
        console.log('Logged out');
    });// Método de Passport para cerrar sesión
}

const updateWelcome = (req, res) => {
    if (req.cookies && req.cookies.userData) {
        const userData = JSON.parse(decodeURIComponent(req.cookies.userData));
        userData.welcome = false;
        
        res.cookie('userData', JSON.stringify(userData), {
            path: '/',
            httpOnly: false,
            secure: process.env.NODE_ENV !== 'development',
            maxAge: 3600000
        });
        
        res.status(200).send({ result: 'Cookie updated successfully' });
    } else {
        res.status(400).send({ result: 'Cookie not found' });
    }
}

// exporto todas las funcione juntas en un sessionsController por defecto
export default {
    login,
    faillogin,
    github,
    githubCallback,
    logout,
    updateWelcome
}