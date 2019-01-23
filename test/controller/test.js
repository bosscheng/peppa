module.exports = async function(ctx) {
    console.log('test controller');
    return ctx.render('test/parent');
};
