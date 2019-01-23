module.exports = async function(ctx) {
    // let t = await ctx.sonicRequest.get('http://www.suning.com');
    // console.log(t);
    console.log('test controller');
    return ctx.render('test/parent');
};
