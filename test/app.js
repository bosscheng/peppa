const Peppa = require('../index');
const path = require('path');

const peppa = new Peppa({
    port: 3001,
    rootPath: path.join(__dirname),
    locals: {
        layout: 'layout.ejs'
    }
});

peppa.useBucket();

peppa.start();
