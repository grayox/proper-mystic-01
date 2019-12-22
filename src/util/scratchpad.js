
const a = [ 1, 2, 3, 4, 5, 6, ];
const b = [ 1, 2, 3, 4, 5, 6, ];

const run = () =>
  new Promise(async (resolve, reject,) => {
    try {
      a
      result = [];
      await a.forEach( i => {
        result.push(i *  b[2])
      });
      return resolve( result );
    } catch (e) {
      return reject(e);
    }
  })

const out = run();
out