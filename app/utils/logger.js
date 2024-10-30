
class Logger{
    static info(value){
        console.log(`<<<<<<<<<<${value}>>>>>>>>>>`);
        
    }

    static error(error){
        console.log(`<<<<<<<<<<${error}>>>>>>>>>>`);
    }
}

module.exports = Logger;